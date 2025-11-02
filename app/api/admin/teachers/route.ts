import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { parsePagination } from '@/lib/api/pagination';

const createTeacherSchema = z.object({
  userId: z.string(), // link existing user as teacher
  specialization: z.string().optional(),
  contact: z.string().optional(),
});

const updateTeacherSchema = z.object({
  id: z.string(),
  specialization: z.string().optional(),
  contact: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get('active');
    const isActive = activeParam === null ? undefined : activeParam === 'true';

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { user: { createdAt: 'desc' } } as any,
        skip,
        take: limit,
      }),
      prisma.teacher.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /admin/teachers error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = createTeacherSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const created = await prisma.teacher.create({
      data: {
        userId: parsed.data.userId,
        specialization: parsed.data.specialization ?? null,
        contact: parsed.data.contact ?? null,
        isActive: true,
      },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(apiError('Teacher for user already exists'), { status: 409 });
    }
    console.error('POST /admin/teachers error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = updateTeacherSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const updated = await prisma.teacher.update({
      where: { id: parsed.data.id },
      data: {
        specialization: parsed.data.specialization ?? undefined,
        contact: parsed.data.contact ?? undefined,
        isActive: parsed.data.isActive ?? undefined,
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Teacher not found'), { status: 404 });
    }
    console.error('PUT /admin/teachers error:', error);
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

    // Unassign courses from this teacher (set teacherId to null)
    await prisma.course.updateMany({
      where: { teacherId: id },
      data: { teacherId: null },
    });

    // Now delete the teacher profile
    await prisma.teacher.delete({ where: { id } });
    return NextResponse.json(apiSuccess({ id }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Teacher not found'), { status: 404 });
    }
    // Handle foreign key constraint errors
    if (error?.code === 'P2003' || error?.message?.includes('foreign key')) {
      return NextResponse.json(
        apiError('Cannot delete teacher: Teacher has related records that need to be handled first'),
        { status: 409 }
      );
    }
    console.error('DELETE /admin/teachers error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


