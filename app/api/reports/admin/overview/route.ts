import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get totals
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      totalAssignments,
      totalSubmissions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.assignment.count(),
      prisma.submission.count(),
    ]);

    // Calculate average GPA
    const allReports = await prisma.report.findMany({
      select: { gpa: true },
    });
    const avgGPA =
      allReports.length > 0
        ? allReports.reduce((acc, r) => acc + r.gpa, 0) / allReports.length
        : 0;

    // Calculate monthly user growth (last 12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyUsers: { [key: string]: number } = {};
    
    // Initialize all months to 0
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyUsers[monthKey] = 0;
    }

    // Get all users with creation dates
    const allUsers = await prisma.user.findMany({
      select: { createdAt: true },
    });

    // Count users by month
    allUsers.forEach((user) => {
      const userDate = new Date(user.createdAt);
      const monthKey = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyUsers[monthKey] !== undefined) {
        monthlyUsers[monthKey]++;
      }
    });

    // Format for chart (last 10 months or available months)
    const userGrowthData = Object.entries(monthlyUsers)
      .slice(-10) // Last 10 months
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          month: monthNames[date.getMonth()],
          users: count,
        };
      });

    // Calculate users created today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Calculate course engagement data (top 10 courses by enrollments)
    // Get all courses with counts
    const allCourses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            attendance: true,
            assignments: true,
          },
        },
      },
    });
    
    // Sort by attendance count and take top 10
    const coursesWithCounts = allCourses
      .sort((a, b) => b._count.attendance - a._count.attendance)
      .slice(0, 10);

    const courseEngagementData = await Promise.all(
      coursesWithCounts.map(async (course) => {
        // Get unique students enrolled (from attendance)
        const uniqueStudents = await prisma.attendance.findMany({
          where: { courseId: course.id },
          select: { studentId: true },
          distinct: ['studentId'],
        });
        const enrollments = uniqueStudents.length;

        // Get total assignments
        const assignmentsCount = course._count.assignments;

        // Get submissions for assignments in this course
        const assignments = await prisma.assignment.findMany({
          where: { courseId: course.id },
          select: { id: true },
        });
        const assignmentIds = assignments.map((a) => a.id);

        // Count all submissions (submittedAt is not nullable in schema, always has a value)
        const submissionsCount = await prisma.submission.count({
          where: {
            assignmentId: { in: assignmentIds },
          },
        });

        // Calculate completion rate based on submitted assignments
        const totalPossibleSubmissions = enrollments * assignmentsCount;
        const completionRate =
          totalPossibleSubmissions > 0
            ? submissionsCount / totalPossibleSubmissions
            : 0;
        const completions = Math.round(enrollments * completionRate);

        return {
          course: course.title,
          enrollments,
          completions: Math.min(completions, enrollments),
        };
      })
    );

    // Get recent activity logs (last 10)
    // Recent submissions, leave requests, attendance updates
    const recentSubmissions = await prisma.submission.findMany({
      take: 5,
      orderBy: { submittedAt: 'desc' },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        assignment: {
          include: {
            course: {
              select: { id: true, title: true, code: true },
            },
          },
        },
      },
    });

    const recentLeaveRequests = await prisma.leaveRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const recentActivities = [
      ...recentSubmissions.map((s) => ({
        id: s.id,
        type: 'submission' as const,
        description: `${s.student.user.name} submitted ${s.assignment.title}`,
        timestamp: s.submittedAt,
        user: s.student.user,
        metadata: {
          course: s.assignment.course.title,
          assignment: s.assignment.title,
        },
      })),
      ...recentLeaveRequests.map((l) => ({
        id: l.id,
        type: 'leave_request' as const,
        description: `${l.requester.name} requested leave (${l.type})`,
        timestamp: l.createdAt,
        user: l.requester,
        metadata: {
          status: l.status,
          type: l.type,
        },
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        message: 'Admin overview fetched successfully',
        data: {
          totals: {
            users: totalUsers,
            teachers: totalTeachers,
            students: totalStudents,
            courses: totalCourses,
            assignments: totalAssignments,
            submissions: totalSubmissions,
            avgGPA: Math.round(avgGPA * 100) / 100,
          },
          recentActivity: recentActivities.map((a) => ({
            ...a,
            timestamp: a.timestamp.toISOString(),
          })),
          userGrowth: userGrowthData,
          newUsersToday,
          courseEngagement: courseEngagementData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/reports/admin/overview error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

