import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const updateAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']).optional(),
  date: z.string().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        course: {
          include: {
            teacher: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!attendance) {
      return NextResponse.json({ success: false, message: 'Attendance record not found' }, { status: 404 });
    }

    const role = session.user.role as Role;

    // Check access permissions
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student || attendance.studentId !== student.id) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
    } else if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher || attendance.course.teacher?.id !== teacher.id) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, message: 'Attendance fetched successfully', data: attendance }, { status: 200 });
  } catch (error) {
    console.error('GET /api/attendance/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only teachers and admins can update attendance' }, { status: 403 });
    }

    // Check existing attendance
    const existing = await prisma.attendance.findUnique({
      where: { id: params.id },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Attendance record not found' }, { status: 404 });
    }

    // Check if teacher owns the course
    if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher || existing.course.teacher?.id !== teacher.id) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only update attendance for your own courses' }, { status: 403 });
      }
    }

    const body = await request.json();
    const parsed = updateAttendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
    }

    const updateData: any = {};
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.date) {
      const date = new Date(parsed.data.date);
      date.setHours(0, 0, 0, 0);
      updateData.date = date;
    }

    const updated = await prisma.attendance.update({
      where: { id: params.id },
      data: updateData,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Attendance updated successfully', data: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/attendance/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only admins can delete attendance records' }, { status: 403 });
    }

    await prisma.attendance.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Attendance deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/attendance/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

