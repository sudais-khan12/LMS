import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { updateCourseSchema } from '@/lib/validation/course';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const course = await prisma.course.findUnique({ where: { id: params.id }, include: { teacher: { include: { user: { select: { id: true, name: true, email: true } } } } } });
    if (!course) return NextResponse.json(apiError('Course not found'), { status: 404 });
    return NextResponse.json(apiSuccess(course), { status: 200 });
  } catch (error) {
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const json = await request.json();
    const parsed = updateCourseSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    const updated = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title ?? undefined,
        code: parsed.data.code ?? undefined,
        description: parsed.data.description ?? undefined,
        teacherId: parsed.data.teacherId === undefined ? undefined : parsed.data.teacherId,
      },
    });
    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json(apiError('Course not found'), { status: 404 });
    if (error?.code === 'P2002') return NextResponse.json(apiError('Course code already exists'), { status: 409 });
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json(apiSuccess({ id: params.id }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json(apiError('Course not found'), { status: 404 });
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


