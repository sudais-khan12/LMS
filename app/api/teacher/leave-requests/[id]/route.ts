import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { updateLeaveStatusSchema } from '@/lib/validation/leave';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { id } = await params;
    // Get existing leave request
    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        student: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(apiError('Leave request not found'), { status: 404 });
    }

    // Check if requester is a student in teacher's courses or teacher's own request
    if (existing.requesterId === teacherAuth.session.user.id) {
      // Teacher can approve/reject their own requests
    } else if (existing.student?.id) {
      // Check if student is in teacher's courses
      const courses = await prisma.course.findMany({
        where: { teacherId: teacherAuth.teacher.id },
        select: { id: true },
      });

      const courseIds = courses.map((c) => c.id);

      const hasAttendance = await prisma.attendance.findFirst({
        where: {
          studentId: existing.student.id,
          courseId: { in: courseIds },
        },
      });

      if (!hasAttendance) {
        return NextResponse.json(
          apiError('Forbidden: You can only approve/reject leave requests for your students'),
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(apiError('Forbidden: You can only approve/reject leave requests for your students'), { status: 403 });
    }

    const json = await request.json();
    const parsed = updateLeaveStatusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    // Update status
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        approverId: parsed.data.status !== 'PENDING' ? teacherAuth.session.user.id : null,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    // Create notification for requester
    if (parsed.data.status !== 'PENDING') {
      await prisma.notification.create({
        data: {
          userId: existing.requesterId,
          title: `Leave Request ${parsed.data.status}`,
          body: `Your leave request (${existing.type}) has been ${parsed.data.status.toLowerCase()}.`,
          link: `/student/leaves/${updated.id}`,
          category: 'leave',
        },
      });
    }

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error) {
    console.error('PATCH /api/teacher/leave-requests/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

