import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { updateCourseSchema } from '@/lib/validation/course';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { id: courseId } = await params;
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { id: courseId } = await params;
    
    // Verify ownership first
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
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
      where: { id: courseId },
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

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { id: courseId } = await params;

    // Verify ownership
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!existing) {
      return NextResponse.json(apiError('Course not found'), { status: 404 });
    }

    if (existing.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only delete your own courses'), { status: 403 });
    }

    // Delete related records first
    // Delete attendance records for this course
    await prisma.attendance.deleteMany({
      where: { courseId },
    });

    // Delete submissions (through assignments)
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      select: { id: true },
    });
    
    if (assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.id);
      await prisma.submission.deleteMany({
        where: { assignmentId: { in: assignmentIds } },
      });
    }

    // Delete assignments for this course
    await prisma.assignment.deleteMany({
      where: { courseId },
    });

    // Now delete the course
    await prisma.course.delete({ where: { id: courseId } });
    return NextResponse.json(apiSuccess({ id: courseId }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Course not found'), { status: 404 });
    }
    // Handle foreign key constraint errors
    if (error?.code === 'P2003' || error?.message?.includes('foreign key')) {
      return NextResponse.json(
        apiError('Cannot delete course: Course has related records that need to be deleted first'),
        { status: 409 }
      );
    }
    console.error('DELETE /api/teacher/classes/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

