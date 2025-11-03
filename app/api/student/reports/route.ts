import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';

export async function GET(_request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const reports = await prisma.report.findMany({
      where: { studentId: studentAuth.student.id },
      orderBy: { semester: 'desc' },
    });

    // Attendance summary
    const attendance = await prisma.attendance.findMany({
      where: { studentId: studentAuth.student.id },
      select: { status: true },
    });
    const totalClasses = attendance.length;
    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = totalClasses ? Number(((presentCount / totalClasses) * 100).toFixed(2)) : 0;

    // Average grade across submissions
    const submissions = await prisma.submission.findMany({
      where: { studentId: studentAuth.student.id },
      select: { grade: true },
    });
    const graded = submissions.filter((s) => s.grade !== null);
    const averageGrade = graded.length ? Number((graded.reduce((s, g) => s + (g.grade ?? 0), 0) / graded.length).toFixed(2)) : null;

    return NextResponse.json(
      apiSuccess({ reports, attendanceRate, averageGrade }),
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/student/reports error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


