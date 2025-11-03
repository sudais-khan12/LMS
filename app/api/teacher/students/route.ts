import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { parsePagination } from '@/lib/api/pagination';

export async function GET(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;

    // Get teacher's courses
    const courses = await prisma.course.findMany({
      where: { teacherId: teacherAuth.teacher.id },
      select: { id: true, title: true, code: true },
    });

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return NextResponse.json(apiSuccess({ items: [], total: 0, limit, skip }), { status: 200 });
    }

    // Get all students who have attendance in teacher's courses
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        courseId: { in: courseIds },
        ...(courseId ? { courseId } : {}),
      },
      select: {
        studentId: true,
        courseId: true,
        status: true,
        date: true,
      },
    });

    // Get unique student IDs
    const studentIds = [...new Set(attendanceRecords.map((a) => a.studentId))];

    // Get assignments for teacher's courses
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, courseId: true },
    });

    const assignmentIds = assignments.map((a) => a.id);

    // Get students with their data
    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
              date: true,
            },
          },
          submissions: {
            where: {
              assignmentId: { in: assignmentIds },
            },
            select: {
              grade: true,
              assignmentId: true,
              submittedAt: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.student.count({ where: { id: { in: studentIds } } }),
    ]);

    // Calculate performance metrics per student
    const studentsWithPerformance = students.map((student) => {
      // Get student's courses (from attendance records)
      const studentCourseIds = [...new Set(
        attendanceRecords
          .filter((a) => a.studentId === student.id)
          .map((a) => a.courseId)
      )];

      // Get course details
      const studentCourses = courses.filter((c) => studentCourseIds.includes(c.id));

      // Calculate attendance rate
      const totalAttendance = student.attendance.length;
      const presentCount = student.attendance.filter((a) => a.status === 'PRESENT').length;
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

      // Calculate progress (completed assignments / total assignments)
      const studentAssignments = assignments.filter((a) => studentCourseIds.includes(a.courseId));
      const totalAssignments = studentAssignments.length;
      const completedAssignments = student.submissions.filter(
        (s) => s.submittedAt !== null && studentAssignments.some((a) => a.id === s.assignmentId)
      ).length;
      const progress = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      // Calculate average grade
      const submissionsWithGrades = student.submissions.filter(
        (s) => s.grade !== null && studentAssignments.some((a) => a.id === s.assignmentId)
      );
      const avgGrade = submissionsWithGrades.length > 0
        ? submissionsWithGrades.reduce((sum, s) => sum + (s.grade ?? 0), 0) / submissionsWithGrades.length
        : null;

      // Determine status based on attendance and grade
      let status = 'Active';
      if (attendanceRate < 75 || (avgGrade !== null && avgGrade < 60)) {
        status = 'At Risk';
      } else if (attendanceRate < 50) {
        status = 'Inactive';
      }

      // Get grade from average or latest report
      let grade = 'N/A';
      if (avgGrade !== null) {
        if (avgGrade >= 90) grade = 'A+';
        else if (avgGrade >= 85) grade = 'A';
        else if (avgGrade >= 80) grade = 'B+';
        else if (avgGrade >= 75) grade = 'B';
        else if (avgGrade >= 70) grade = 'C+';
        else if (avgGrade >= 65) grade = 'C';
        else if (avgGrade >= 60) grade = 'D';
        else grade = 'F';
      } else if (student.reports[0]?.gpa) {
        const gpa = student.reports[0].gpa;
        if (gpa >= 3.7) grade = 'A+';
        else if (gpa >= 3.3) grade = 'A';
        else if (gpa >= 3.0) grade = 'B+';
        else if (gpa >= 2.7) grade = 'B';
        else if (gpa >= 2.3) grade = 'C+';
        else if (gpa >= 2.0) grade = 'C';
        else if (gpa >= 1.7) grade = 'D';
        else grade = 'F';
      }

      return {
        id: student.id,
        userId: student.userId,
        studentId: student.enrollmentNo,
        name: student.user.name,
        email: student.user.email,
        enrollmentNo: student.enrollmentNo,
        semester: student.semester,
        section: student.section,
        status,
        grade,
        attendance: Number(attendanceRate.toFixed(1)),
        progress: Number(progress.toFixed(1)),
        averageGrade: avgGrade ? Number(avgGrade.toFixed(1)) : null,
        latestGpa: student.reports[0]?.gpa ?? null,
        completedAssignments,
        totalAssignments,
        courses: studentCourses.map((c) => ({
          id: c.id,
          title: c.title,
          code: c.code,
        })),
        lastActive: student.submissions.length > 0
          ? student.submissions
              .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0))[0]
              .submittedAt?.toISOString()
          : null,
      };
    });

    return NextResponse.json(apiSuccess({ items: studentsWithPerformance, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/teacher/students error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

