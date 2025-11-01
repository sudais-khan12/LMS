import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: { teacherId: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;

    // Verify teacher access
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.teacherId },
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

    // Get teacher's courses
    const courses = await prisma.course.findMany({
      where: { teacherId: params.teacherId },
      include: {
        assignments: {
          include: {
            submissions: {
              where: {
                grade: { not: null },
              },
            },
          },
        },
        attendance: {
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
      },
    });

    // Calculate per-class performance
    const classPerformance = courses.map((course) => {
      // Get unique students for this course
      const studentIds = new Set(course.attendance.map((a) => a.studentId));
      const totalStudents = studentIds.size;

      // Calculate average grade for this course
      const allGrades: number[] = [];
      course.assignments.forEach((assignment) => {
        assignment.submissions.forEach((submission) => {
          if (submission.grade !== null) {
            allGrades.push(submission.grade);
          }
        });
      });
      const avgGrade = allGrades.length > 0 ? allGrades.reduce((acc, g) => acc + g, 0) / allGrades.length : 0;

      // Calculate attendance percentage
      const totalClasses = course.attendance.length;
      const presentCount = course.attendance.filter((a) => a.status === 'PRESENT').length;
      const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

      // Calculate submission rate
      const totalAssignments = course.assignments.length;
      const totalSubmissions = course.assignments.reduce(
        (acc, assignment) => acc + assignment.submissions.length,
        0
      );
      const submissionRate =
        totalAssignments > 0 && totalStudents > 0
          ? (totalSubmissions / (totalAssignments * totalStudents)) * 100
          : 0;

      return {
        courseId: course.id,
        courseName: course.title,
        courseCode: course.code,
        totalStudents,
        averageGrade: Math.round(avgGrade * 100) / 100,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
        submissionRate: Math.round(submissionRate * 100) / 100,
        totalAssignments,
        totalSubmissions,
      };
    });

    // Overall stats
    const totalCourses = courses.length;
    const totalStudents = new Set(courses.flatMap((c) => c.attendance.map((a) => a.studentId))).size;
    const allGrades: number[] = [];
    courses.forEach((course) => {
      course.assignments.forEach((assignment) => {
        assignment.submissions.forEach((submission) => {
          if (submission.grade !== null) {
            allGrades.push(submission.grade);
          }
        });
      });
    });
    const overallAvgGrade = allGrades.length > 0 ? allGrades.reduce((acc, g) => acc + g, 0) / allGrades.length : 0;

    const allAttendance = courses.flatMap((c) => c.attendance);
    const totalAttendanceRecords = allAttendance.length;
    const presentCount = allAttendance.filter((a) => a.status === 'PRESENT').length;
    const overallAttendancePercentage =
      totalAttendanceRecords > 0 ? (presentCount / totalAttendanceRecords) * 100 : 0;

    return NextResponse.json(
      {
        success: true,
        message: 'Teacher overview fetched successfully',
        data: {
          teacher: {
            id: teacher.id,
            name: teacher.user.name,
            email: teacher.user.email,
          },
          overall: {
            totalCourses,
            totalStudents,
            averageGrade: Math.round(overallAvgGrade * 100) / 100,
            attendancePercentage: Math.round(overallAttendancePercentage * 100) / 100,
          },
          classPerformance,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/reports/teacher/:teacherId/overview error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

