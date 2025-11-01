import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { updateCourseSchema } from '@/lib/validation/course';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!course) {
      return NextResponse.json(apiError('Course not found'), { status: 404 });
    }

    // Verify ownership
    if (course.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only access your own courses'), { status: 403 });
    }

    return NextResponse.json(apiSuccess(course), { status: 200 });
  } catch (error) {
    console.error('GET /api/teacher/classes/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    // Verify ownership first
    const existing = await prisma.course.findUnique({
      where: { id: params.id },
      select: { teacherId: true },
    });

    if (!existing) {
      return NextResponse.json(apiError('Course not found'), { status: 404 });
    }

    if (existing.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only update your own courses'), { status: 403 });
    }

    const json = await request.json();
    const parsed = updateCourseSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const updated = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title ?? undefined,
        code: parsed.data.code ?? undefined,
        description: parsed.data.description ?? undefined,
        // Don't allow changing teacherId
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(apiError('Course code already exists'), { status: 409 });
    }
    console.error('PATCH /api/teacher/classes/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    // Verify ownership
    const existing = await prisma.course.findUnique({
      where: { id: params.id },
      select: { teacherId: true },
    });

    if (!existing) {
      return NextResponse.json(apiError('Course not found'), { status: 404 });
    }

    if (existing.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only delete your own courses'), { status: 403 });
    }

    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json(apiSuccess({ id: params.id }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Course not found'), { status: 404 });
    }
    console.error('DELETE /api/teacher/classes/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

