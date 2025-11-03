import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const { id: courseId } = await params;
    const studentId = studentAuth.student.id;

    // Verify student is enrolled in the course
    const attendance = await prisma.attendance.findFirst({
      where: { studentId, courseId },
    });

    if (!attendance) {
      return NextResponse.json(apiError('Not enrolled in this course'), { status: 404 });
    }

    // Delete all attendance records for this course
    await prisma.attendance.deleteMany({
      where: { studentId, courseId },
    });

    // Delete all submissions related to assignments in this course
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      select: { id: true },
    });

    const assignmentIds = assignments.map((a) => a.id);

    if (assignmentIds.length > 0) {
      await prisma.submission.deleteMany({
        where: {
          studentId,
          assignmentId: { in: assignmentIds },
        },
      });
    }

    return NextResponse.json(
      apiSuccess({ message: 'Successfully unenrolled from course' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/student/courses/[id] error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

