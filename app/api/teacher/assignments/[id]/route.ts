import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { updateAssignmentSchema } from '@/lib/validation/assignment';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        course: {
          include: { teacher: { select: { id: true } } },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    }

    // Verify ownership via course
    if (assignment.course.teacher?.id !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only access your own assignments'), { status: 403 });
    }

    return NextResponse.json(apiSuccess(assignment), { status: 200 });
  } catch (error) {
    console.error('GET /api/teacher/assignments/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    // Verify ownership
    const existing = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        course: {
          include: { teacher: { select: { id: true } } },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    }

    if (existing.course.teacher?.id !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only update your own assignments'), { status: 403 });
    }

    const json = await request.json();
    const parsed = updateAssignmentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const updated = await prisma.assignment.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title ?? undefined,
        description: parsed.data.description ?? undefined,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    }
    console.error('PATCH /api/teacher/assignments/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    // Verify ownership
    const existing = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        course: {
          include: { teacher: { select: { id: true } } },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    }

    if (existing.course.teacher?.id !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only delete your own assignments'), { status: 403 });
    }

    await prisma.assignment.delete({ where: { id: params.id } });
    return NextResponse.json(apiSuccess({ id: params.id }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    }
    console.error('DELETE /api/teacher/assignments/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

