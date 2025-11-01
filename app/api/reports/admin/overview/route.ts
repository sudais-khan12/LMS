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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/reports/admin/overview error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

