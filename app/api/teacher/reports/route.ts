import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';

export async function GET(_request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    // Get teacher's courses
    const courses = await prisma.course.findMany({
      where: { teacherId: teacherAuth.teacher.id },
      select: { id: true, title: true, code: true },
    });

    const courseIds = courses.map((c) => c.id);

    // Get all students who have attendance in teacher's courses
    const attendanceRecords = await prisma.attendance.findMany({
      where: { courseId: { in: courseIds } },
      select: {
        studentId: true,
        courseId: true,
        status: true,
      },
    });

    // Get unique student IDs
    const studentIds = [...new Set(attendanceRecords.map((a) => a.studentId))];

    // Get students with their reports
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        reports: {
          orderBy: { semester: 'desc' },
          take: 1,
          select: { gpa: true, semester: true, remarks: true },
        },
        attendance: {
          where: { courseId: { in: courseIds } },
          select: {
            status: true,
            courseId: true,
          },
        },
        submissions: {
          where: {
            assignment: {
              courseId: { in: courseIds },
            },
          },
          select: {
            grade: true,
          },
        },
      },
    });

    // Calculate performance metrics per student
    const studentsWithPerformance = students.map((student) => {
      const totalAttendance = student.attendance.length;
      const presentCount = student.attendance.filter((a) => a.status === 'PRESENT').length;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      const submissionsWithGrades = student.submissions.filter((s) => s.grade !== null);
      const avgGrade = submissionsWithGrades.length > 0
        ? submissionsWithGrades.reduce((sum, s) => sum + (s.grade ?? 0), 0) / submissionsWithGrades.length
        : null;

      return {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        enrollmentNo: student.enrollmentNo,
        semester: student.semester,
        latestGpa: student.reports[0]?.gpa ?? null,
        latestSemester: student.reports[0]?.semester ?? null,
        remarks: student.reports[0]?.remarks ?? null,
        attendanceRate: Number(attendanceRate.toFixed(2)),
        averageGrade: avgGrade ? Number(avgGrade.toFixed(2)) : null,
        coursesEnrolled: [...new Set(student.attendance.map((a) => a.courseId))].length,
      };
    });

    return NextResponse.json(
      apiSuccess({
        courses,
        students: studentsWithPerformance,
        summary: {
          totalStudents: studentsWithPerformance.length,
          totalCourses: courses.length,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/teacher/reports error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

