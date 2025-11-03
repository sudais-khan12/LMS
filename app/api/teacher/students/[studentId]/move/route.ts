import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { z } from 'zod';

const moveStudentSchema = z.object({
  fromCourseId: z.string(),
  toCourseId: z.string(),
});

/**
 * POST /api/teacher/students/[studentId]/move
 * Move a student from one course to another by:
 * 1. Verifying both courses belong to the teacher
 * 2. Getting the student's most recent attendance records from the old course
 * 3. Creating attendance records in the new course for the same dates
 * 4. Deleting attendance records from the old course
 * Note: This is a simplified move - it preserves recent attendance but deletes old records
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { studentId } = await params;
    const json = await request.json();
    const parsed = moveStudentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        apiError('Validation error', parsed.error.issues),
        { status: 400 }
      );
    }

    const { fromCourseId, toCourseId } = parsed.data;

    // Verify both courses belong to teacher
    const courses = await prisma.course.findMany({
      where: {
        id: { in: [fromCourseId, toCourseId] },
        teacherId: teacherAuth.teacher.id,
      },
      select: { id: true, teacherId: true },
    });

    if (courses.length !== 2) {
      return NextResponse.json(
        apiError('Forbidden: One or both courses not found or not yours'),
        { status: 403 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    // Get recent attendance records from old course (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttendance = await prisma.attendance.findMany({
      where: {
        studentId,
        courseId: fromCourseId,
        date: { gte: thirtyDaysAgo },
      },
      select: {
        date: true,
        status: true,
      },
    });

    // Get assignments for old course
    const oldAssignments = await prisma.assignment.findMany({
      where: { courseId: fromCourseId },
      select: { id: true },
    });

    const oldAssignmentIds = oldAssignments.map((a) => a.id);

    // Delete submissions for old course assignments
    await prisma.submission.deleteMany({
      where: {
        studentId,
        assignmentId: { in: oldAssignmentIds },
      },
    });

    // Delete all attendance records from old course
    await prisma.attendance.deleteMany({
      where: {
        studentId,
        courseId: fromCourseId,
      },
    });

    // Create attendance records in new course for recent dates
    const newAttendanceRecords = recentAttendance.map((att) => ({
      studentId,
      courseId: toCourseId,
      date: att.date,
      status: att.status,
    }));

    if (newAttendanceRecords.length > 0) {
      await prisma.attendance.createMany({
        data: newAttendanceRecords,
        skipDuplicates: true,
      });
    }

    return NextResponse.json(
      apiSuccess({
        message: 'Student moved to new course successfully',
        movedAttendanceRecords: newAttendanceRecords.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/teacher/students/[studentId]/move error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

