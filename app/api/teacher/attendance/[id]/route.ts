import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { z } from 'zod';

const updateAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']).optional(),
  date: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { id: attendanceId } = await params;

    // Verify ownership - check if attendance belongs to teacher's course
    const existing = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        course: {
          select: { teacherId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(apiError('Attendance record not found'), { status: 404 });
    }

    if (existing.course.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only update attendance for your own courses'), { status: 403 });
    }

    const json = await request.json();
    const parsed = updateAttendanceSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const updateData: any = {};
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.date) {
      const date = new Date(parsed.data.date);
      date.setHours(0, 0, 0, 0);
      updateData.date = date;
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: updateData,
      include: {
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        course: { select: { id: true, title: true, code: true } },
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Attendance record not found'), { status: 404 });
    }
    console.error('PATCH /api/teacher/attendance/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { id: attendanceId } = await params;

    // Verify ownership - check if attendance belongs to teacher's course
    const existing = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        course: {
          select: { teacherId: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(apiError('Attendance record not found'), { status: 404 });
    }

    if (existing.course.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only delete attendance for your own courses'), { status: 403 });
    }

    await prisma.attendance.delete({ where: { id: attendanceId } });
    return NextResponse.json(apiSuccess({ id: attendanceId }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Attendance record not found'), { status: 404 });
    }
    console.error('DELETE /api/teacher/attendance/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

