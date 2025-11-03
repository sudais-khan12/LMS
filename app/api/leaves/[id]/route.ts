import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role, LeaveStatus } from '@prisma/client';
import { z } from 'zod';
import { sendEmail, createLeaveStatusEmail } from '@/lib/email';

const updateLeaveStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  remarks: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json({ success: false, message: 'Leave request not found' }, { status: 404 });
    }

    // Check access permissions
    if (role === 'STUDENT') {
      if (leaveRequest.requesterId !== session.user.id) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
    } else if (role === 'TEACHER') {
      // Teacher can view if it's their own request or their student's request
      const isOwnRequest = leaveRequest.requesterId === session.user.id;

      if (isOwnRequest) {
        // Allow viewing own requests
      } else {
        // Check if requester is a student in teacher's courses
        const teacher = await prisma.teacher.findUnique({
          where: { userId: session.user.id },
          include: {
            courses: {
              include: {
                attendance: {
                  include: {
                    student: {
                      select: {
                        userId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const studentUserIds = new Set<string>();
        teacher?.courses.forEach((course) => {
          course.attendance.forEach((att) => {
            if (att.student?.userId) {
              studentUserIds.add(att.student.userId);
            }
          });
        });

        const isStudentRequest = studentUserIds.has(leaveRequest.requesterId);

        if (!isStudentRequest) {
          return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Leave request fetched successfully', data: leaveRequest }, { status: 200 });
  } catch (error) {
    console.error('GET /api/leaves/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'ADMIN' && role !== 'TEACHER') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only admins and teachers can approve/reject leave requests' }, { status: 403 });
    }

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Leave request not found' }, { status: 404 });
    }

    // Check if teacher has access to this student's request
    if (role === 'TEACHER') {
      const isOwnRequest = existing.requesterId === session.user.id;

      if (!isOwnRequest) {
        // Check if requester is a student in teacher's courses
        const teacher = await prisma.teacher.findUnique({
          where: { userId: session.user.id },
          include: {
            courses: {
              include: {
                attendance: {
                  include: {
                    student: {
                      select: {
                        userId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const studentUserIds = new Set<string>();
        teacher?.courses.forEach((course) => {
          course.attendance.forEach((att) => {
            if (att.student?.userId) {
              studentUserIds.add(att.student.userId);
            }
          });
        });

        const isStudentRequest = studentUserIds.has(existing.requesterId);

        if (!isStudentRequest) {
          return NextResponse.json({ success: false, message: 'Forbidden: You can only approve/reject leave requests for your students' }, { status: 403 });
        }
      }
    }

    // Don't allow changing status if already approved or rejected (unless changing back to pending)
    const body = await request.json();
    const parsed = updateLeaveStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
    }

    if (existing.status === 'APPROVED' && parsed.data.status === 'REJECTED') {
      return NextResponse.json({ success: false, message: 'Cannot reject an approved leave request' }, { status: 400 });
    }

    if (existing.status === 'REJECTED' && parsed.data.status === 'APPROVED') {
      return NextResponse.json({ success: false, message: 'Cannot approve a rejected leave request' }, { status: 400 });
    }

    // Update leave request
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: parsed.data.status as LeaveStatus,
        approverId: parsed.data.status !== 'PENDING' ? session.user.id : null,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for requester
    if (parsed.data.status !== 'PENDING') {
      await prisma.notification.create({
        data: {
          userId: existing.requesterId,
          title: `Leave Request ${parsed.data.status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
          body: `Your leave request (${existing.type}) from ${new Date(existing.fromDate).toLocaleDateString()} to ${new Date(existing.toDate).toLocaleDateString()} has been ${parsed.data.status.toLowerCase()}.`,
          link: `/student/leaves/${updated.id}`,
          category: 'leave',
          data: {
            leaveRequestId: updated.id,
            status: parsed.data.status,
            approverName: session.user.name,
            remarks: parsed.data.remarks,
          },
        },
      });

      // Send email to requester
      if (existing.requester.email) {
        await sendEmail({
          to: existing.requester.email,
          subject: `Leave Request ${parsed.data.status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
          html: createLeaveStatusEmail(
            existing.requester.name || 'User',
            existing.type,
            parsed.data.status as 'APPROVED' | 'REJECTED',
            existing.fromDate.toISOString(),
            existing.toDate.toISOString(),
            parsed.data.remarks
          ),
        });
      }
    }

    return NextResponse.json({ success: true, message: `Leave request ${parsed.data.status.toLowerCase()} successfully`, data: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/leaves/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json({ success: false, message: 'Leave request not found' }, { status: 404 });
    }

    const role = session.user.role as Role;

    // Only requester or ADMIN can delete, and only if status is PENDING
    if (leaveRequest.requesterId !== session.user.id && role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only the requester or admin can delete leave requests' }, { status: 403 });
    }

    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json({ success: false, message: 'Only pending leave requests can be deleted' }, { status: 400 });
    }

    await prisma.leaveRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Leave request deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/leaves/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

