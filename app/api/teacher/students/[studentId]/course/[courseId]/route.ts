import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';

/**
 * DELETE /api/teacher/students/[studentId]/course/[courseId]
 * Remove a student from a course by deleting all attendance records
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string; courseId: string }> }
) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { studentId, courseId } = await params;

    // Verify course belongs to teacher
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course || course.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(
        apiError('Forbidden: Course not found or not yours'),
        { status: 403 }
      );
    }

    // Verify student exists and has attendance in this course
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    // Get assignments for this course
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      select: { id: true },
    });

    const assignmentIds = assignments.map((a) => a.id);

    // Delete all attendance records for this student in this course
    const deletedAttendance = await prisma.attendance.deleteMany({
      where: {
        studentId,
        courseId,
      },
    });

    // Delete all submissions for this student's assignments in this course
    const deletedSubmissions = await prisma.submission.deleteMany({
      where: {
        studentId,
        assignmentId: { in: assignmentIds },
      },
    });

    return NextResponse.json(
      apiSuccess({
        message: 'Student removed from course successfully',
        deletedAttendance: deletedAttendance.count,
        deletedSubmissions: deletedSubmissions.count,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/teacher/students/[studentId]/course/[courseId] error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

