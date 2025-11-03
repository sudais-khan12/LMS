import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { parsePagination } from '@/lib/api/pagination';
import { Prisma } from '@prisma/client';

const createCourseSchema = z.object({
  title: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  teacherId: z.string().optional(), // Teacher.id (not userId)
});

const updateCourseSchema = z.object({
  id: z.string(),
  title: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
  teacherId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId') || undefined;
    const q = searchParams.get('q') || '';

    const where: Prisma.CourseWhereInput = {};
    if (teacherId) where.teacherId = teacherId;
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { code: { contains: q, mode: 'insensitive' } },
    ];

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          teacher: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          _count: {
            select: {
              assignments: true,
              attendance: true,
            },
          },
        },
        orderBy: { title: 'asc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /admin/courses error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = createCourseSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const created = await prisma.course.create({
      data: {
        title: parsed.data.title,
        code: parsed.data.code,
        description: parsed.data.description ?? null,
        teacherId: parsed.data.teacherId ?? null,
      },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(apiError('Course code already exists'), { status: 409 });
    }
    console.error('POST /admin/courses error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = updateCourseSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const updated = await prisma.course.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title ?? undefined,
        code: parsed.data.code ?? undefined,
        description: parsed.data.description ?? undefined,
        teacherId: parsed.data.teacherId === undefined ? undefined : parsed.data.teacherId,
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(apiError('Course not found'), { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json(apiError('Course code already exists'), { status: 409 });
      }
    }
    console.error('PUT /admin/courses error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json(apiError('Missing id'), { status: 400 });

    await prisma.course.delete({ where: { id } });
    return NextResponse.json(apiSuccess({ id }), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(apiError('Course not found'), { status: 404 });
    }
    console.error('DELETE /admin/courses error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


