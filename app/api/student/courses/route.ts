import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';
import { parsePagination } from '@/lib/api/pagination';

export async function GET(request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);

    // Determine enrolled courses via attendance/submissions
    const attendance = await prisma.attendance.findMany({
      where: { studentId: studentAuth.student.id },
      select: { courseId: true },
      distinct: ['courseId'],
    });
    const courseIds = attendance.map((a) => a.courseId);

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where: { id: { in: courseIds } },
        include: {
          teacher: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { assignments: true, attendance: true } },
        },
        orderBy: { title: 'asc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where: { id: { in: courseIds } } }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/student/courses error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


