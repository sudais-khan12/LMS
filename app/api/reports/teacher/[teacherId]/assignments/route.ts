import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ teacherId: string }> }) {
  try {
    const { teacherId } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;

    // Verify teacher access
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: 'Teacher not found' }, { status: 404 });
    }

    // Check access: teacher can only view their own reports, admin can view any
    if (role === 'TEACHER' && teacher.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden: You can only view your own reports' }, { status: 403 });
    }

    if (role !== 'ADMIN' && role !== 'TEACHER') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Get teacher's courses with assignments and submissions
    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: {
        assignments: {
          include: {
            submissions: {
              include: {
                student: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
            course: {
              select: { id: true, title: true, code: true },
            },
          },
        },
        attendance: {
          select: {
            studentId: true,
          },
        },
      },
    });

    // Process assignments
    const assignmentStats = courses.flatMap((course) =>
      course.assignments.map((assignment) => {
        const totalSubmissions = assignment.submissions.length;
        const gradedSubmissions = assignment.submissions.filter((s) => s.grade !== null).length;
        const pendingGrading = totalSubmissions - gradedSubmissions;

        // Get unique students enrolled in this course (from attendance records)
        const studentIds = new Set<string>();
        course.attendance.forEach((att) => {
          studentIds.add(att.studentId);
        });

        const totalExpectedSubmissions = studentIds.size; // One submission per student
        const pendingSubmissions = totalExpectedSubmissions - totalSubmissions;

        return {
          assignmentId: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate.toISOString(),
          courseId: course.id,
          courseName: course.title,
          courseCode: course.code,
          totalSubmissions,
          gradedSubmissions,
          pendingGrading,
          pendingSubmissions,
          totalExpectedSubmissions,
          submissions: assignment.submissions.map((s) => ({
            id: s.id,
            studentId: s.student.id,
            studentName: s.student.user.name,
            studentEmail: s.student.user.email,
            fileUrl: s.fileUrl,
            grade: s.grade,
            submittedAt: s.submittedAt.toISOString(),
          })),
        };
      })
    );

    // Calculate summary stats
    const totalAssignments = assignmentStats.length;
    const totalGraded = assignmentStats.reduce((acc, a) => acc + a.gradedSubmissions, 0);
    const totalPendingGrading = assignmentStats.reduce((acc, a) => acc + a.pendingGrading, 0);
    const totalPendingSubmissions = assignmentStats.reduce((acc, a) => acc + a.pendingSubmissions, 0);

    return NextResponse.json(
      {
        success: true,
        message: 'Teacher assignments report fetched successfully',
        data: {
          teacher: {
            id: teacher.id,
            name: teacher.user.name,
            email: teacher.user.email,
          },
          summary: {
            totalAssignments,
            totalGraded,
            totalPendingGrading,
            totalPendingSubmissions,
            completionRate:
              totalAssignments > 0
                ? Math.round((totalGraded / (totalGraded + totalPendingGrading)) * 100)
                : 0,
          },
          assignments: assignmentStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/reports/teacher/:teacherId/assignments error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

