import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';

export async function GET(_request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const [users, courses, assignments, submissions, attendance, leaves] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      prisma.course.count(),
      prisma.assignment.count(),
      prisma.submission.count(),
      prisma.attendance.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.leaveRequest.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    const latestReports = await prisma.report.findMany({
      orderBy: { semester: 'desc' },
      take: 50,
      select: { gpa: true },
    });
    const avgGpa = latestReports.length ? (latestReports.reduce((a, r) => a + r.gpa, 0) / latestReports.length) : 0;

    // students with latest GPA/performance
    const students = await prisma.student.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        reports: { orderBy: { semester: 'desc' }, take: 1, select: { gpa: true, semester: true } },
      },
      take: 100,
    });
    const studentsWithGpa = students.map((s) => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      latestGpa: s.reports[0]?.gpa ?? null,
      latestSemester: s.reports[0]?.semester ?? null,
    }));

    return NextResponse.json(apiSuccess({
      usersByRole: users.map(u => ({ role: u.role, count: u._count.role })),
      totals: { courses, assignments, submissions },
      attendanceByStatus: attendance.map(a => ({ status: a.status, count: a._count.status })),
      leavesByStatus: leaves.map(l => ({ status: l.status, count: l._count.status })),
      avgGpa: Number(avgGpa.toFixed(2)),
      studentsWithGpa,
    }), { status: 200 });
  } catch (error) {
    console.error('GET /admin/reports error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

// Other methods are not applicable for analytics; return 405
export async function POST() { return NextResponse.json(apiError('Method not allowed'), { status: 405 }); }
export async function PUT() { return NextResponse.json(apiError('Method not allowed'), { status: 405 }); }
export async function DELETE() { return NextResponse.json(apiError('Method not allowed'), { status: 405 }); }


