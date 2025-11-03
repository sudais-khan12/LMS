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
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;

    // Get student's courses via attendance
    const attendance = await prisma.attendance.findMany({
      where: { studentId: studentAuth.student.id },
      select: { courseId: true },
      distinct: ['courseId'],
    });
    const courseIds = attendance.map((a) => a.courseId);

    if (courseId && !courseIds.includes(courseId)) {
      return NextResponse.json(apiError('Forbidden: Course not enrolled'), { status: 403 });
    }

    const where: any = { courseId: { in: courseIds } };
    if (courseId) where.courseId = courseId;

    const [items, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          course: { select: { id: true, title: true, code: true } },
          submissions: {
            where: { studentId: studentAuth.student.id },
            select: { 
              id: true, 
              fileUrl: true, 
              grade: true, 
              submittedAt: true 
            },
            take: 1,
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    // Transform items to include submission status and grade
    const transformedItems = items.map((assignment) => {
      const submission = assignment.submissions?.[0];
      return {
        ...assignment,
        submission,
      };
    });

    return NextResponse.json(apiSuccess({ items: transformedItems, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/student/assignments error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


