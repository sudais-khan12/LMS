import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';

export async function GET(_request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const studentId = studentAuth.student.id;

    // Get total courses
    const totalCourses = await prisma.attendance.groupBy({
      by: ['courseId'],
      where: { studentId },
    });

    // Get completed assignments (with grades)
    const completedAssignments = await prisma.submission.count({
      where: {
        studentId,
        grade: { not: null },
      },
    });

    // Get total assignments
    const allAssignments = await prisma.assignment.count({
      where: {
        course: {
          attendance: {
            some: { studentId },
          },
        },
      },
    });

    // Calculate attendance percentage
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId },
      select: { status: true },
    });
    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const attendancePercentage = totalClasses > 0 
      ? Math.round((presentCount / totalClasses) * 100)
      : 0;

    // Get upcoming assignments (next 7 days)
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        course: {
          attendance: {
            some: { studentId },
          },
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // Get course progress
    const coursesWithProgress = await prisma.course.findMany({
      where: {
        attendance: {
          some: { studentId },
        },
      },
      include: {
        assignments: {
          include: {
            submissions: {
              where: { studentId },
              select: { grade: true },
            },
          },
        },
        attendance: {
          where: { studentId },
          select: { status: true },
        },
      },
    });

    const courseProgress = coursesWithProgress.map((course) => {
      const totalAssignments = course.assignments.length;
      const completedAssignments = course.assignments.filter((a) =>
        a.submissions.some((s) => s.grade !== null)
      ).length;
      const progress = totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

      const attendanceRecords = course.attendance;
      const attendanceTotal = attendanceRecords.length;
      const attendancePresent = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
      const attendancePercentage = attendanceTotal > 0
        ? Math.round((attendancePresent / attendanceTotal) * 100)
        : 0;

      return {
        course: course.title,
        progress,
        attendancePercentage,
        totalAssignments,
        completedAssignments,
      };
    });

    // Get recent announcements (notifications)
    const recentNotifications = await prisma.notification.findMany({
      where: {
        userId: studentAuth.session.user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        category: true,
      },
    });

    return NextResponse.json(
      apiSuccess({
        stats: {
          totalCourses: totalCourses.length,
          completedAssignments,
          totalAssignments: allAssignments,
          attendancePercentage,
        },
        upcomingAssignments: upcomingAssignments.map((a) => ({
          id: a.id,
          title: a.title,
          course: a.course.title,
          dueDate: a.dueDate.toISOString(),
        })),
        courseProgress,
        recentNotifications: recentNotifications.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.body,
          timestamp: n.createdAt.toISOString(),
          type: n.category || 'announcement',
        })),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/student/dashboard error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

