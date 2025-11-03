import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { parsePagination } from '@/lib/api/pagination';
import { createAssignmentSchema } from '@/lib/validation/assignment';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;

    const where: any = {};
    if (courseId) where.courseId = courseId;

    const [items, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          course: { select: { id: true, title: true, code: true } },
        },
        orderBy: { dueDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /admin/assignments error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = createAssignmentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const created = await prisma.assignment.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        dueDate: new Date(parsed.data.dueDate),
        courseId: parsed.data.courseId,
      },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error) {
    console.error('POST /admin/assignments error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


