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
    const unread = searchParams.get('unread') === 'true';
    const category = searchParams.get('category') || undefined;

    const where: any = { userId: studentAuth.session.user.id };
    if (unread) where.isRead = false;
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/student/notifications error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


