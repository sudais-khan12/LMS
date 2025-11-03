import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { sendEmail, createLeaveRequestEmail } from '@/lib/email';

const createLeaveSchema = z.object({
  type: z.string().min(2, 'Leave type is required'),
  fromDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid from date'),
  toDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid to date'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
}).refine((data) => new Date(data.fromDate) <= new Date(data.toDate), {
  message: 'From date must be before or equal to to date',
  path: ['toDate'],
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const requesterId = searchParams.get('requesterId') ?? undefined;

    let where: any = {};

    if (role === 'ADMIN') {
      // Admin can see all leave requests
      if (status) {
        where.status = status;
      }
      if (requesterId) {
        where.requesterId = requesterId;
      }
    } else if (role === 'TEACHER') {
      // Teacher can see leave requests of their students and their own
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

      if (!teacher) {
        return NextResponse.json({ success: true, message: 'No leave requests found', data: [] }, { status: 200 });
      }

      // Get student userIds from teacher's courses
      const studentUserIds = new Set<string>();
      teacher.courses.forEach((course) => {
        course.attendance.forEach((att) => {
          if (att.student?.userId) {
            studentUserIds.add(att.student.userId);
          }
        });
      });

      const studentUserIdsArray = Array.from(studentUserIds);
      studentUserIdsArray.push(session.user.id); // Include teacher's own requests

      where.requesterId = { in: studentUserIdsArray };

      if (status) {
        where.status = status;
      }
      if (requesterId && studentUserIdsArray.includes(requesterId)) {
        where.requesterId = requesterId;
      }
    } else {
      // STUDENT can see only their own requests
      where.requesterId = session.user.id;
      if (status) {
        where.status = status;
      }
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, message: 'Leave requests fetched successfully', data: leaveRequests }, { status: 200 });
  } catch (error) {
    console.error('GET /api/leaves error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    // Only students and teachers can create leave requests
    if (role !== 'STUDENT' && role !== 'TEACHER') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only students and teachers can create leave requests' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createLeaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
    }

    // Check for max 3 pending leaves per user
    const pendingLeavesCount = await prisma.leaveRequest.count({
      where: {
        requesterId: session.user.id,
        status: 'PENDING',
      },
    });

    if (pendingLeavesCount >= 3) {
      return NextResponse.json({ success: false, message: 'Maximum 3 pending leave requests allowed. Please wait for pending requests to be processed.' }, { status: 400 });
    }

    // Check for overlapping leave requests
    const fromDate = new Date(parsed.data.fromDate);
    const toDate = new Date(parsed.data.toDate);

    const overlappingLeaves = await prisma.leaveRequest.findFirst({
      where: {
        requesterId: session.user.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            fromDate: { lte: toDate },
            toDate: { gte: fromDate },
          },
        ],
      },
    });

    if (overlappingLeaves) {
      return NextResponse.json({ success: false, message: 'You already have a pending or approved leave request for this date range' }, { status: 409 });
    }

    // Get student ID if requester is a student
    let studentId: string | null = null;
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      studentId = student?.id ?? null;
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        requesterId: session.user.id,
        type: parsed.data.type,
        fromDate,
        toDate,
        reason: parsed.data.reason,
        status: 'PENDING',
        studentId,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create notification for admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true },
    });

    // Create notifications for admins
    const notificationPromises = admins.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'New Leave Request',
          body: `${session.user.name} has submitted a leave request (${parsed.data.type})`,
          link: `/admin/leaves/${leaveRequest.id}`,
          category: 'leave',
          data: {
            leaveRequestId: leaveRequest.id,
            requesterId: session.user.id,
            requesterName: session.user.name,
          },
        },
      })
    );

    await Promise.all(notificationPromises);

    // Send email to admins
    const emailPromises = admins.map((admin) =>
      sendEmail({
        to: admin.email || '',
        subject: 'Leave Request Submitted',
        html: createLeaveRequestEmail(
          session.user.name || 'User',
          parsed.data.type,
          parsed.data.fromDate,
          parsed.data.toDate,
          parsed.data.reason
        ),
      })
    );

    await Promise.allSettled(emailPromises);

    return NextResponse.json({ success: true, message: 'Leave request created successfully', data: leaveRequest }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/leaves error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Duplicate leave request' }, { status: 409 });
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

