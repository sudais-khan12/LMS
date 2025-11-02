import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { parsePagination } from '@/lib/api/pagination';

const createStudentSchema = z.object({
  userId: z.string(),
  enrollmentNo: z.string(),
  semester: z.number().int().min(1),
  section: z.string().min(1),
});

const updateStudentSchema = z.object({
  id: z.string(),
  enrollmentNo: z.string().optional(),
  semester: z.number().int().min(1).optional(),
  section: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;
    const q = searchParams.get('q') || '';

    // Filter by course: students who have attendance in that course
    const where: any = {};
    if (q) where.user = { OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ] };

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          attendance: courseId ? { where: { courseId }, select: { id: true } } : false,
          reports: { select: { gpa: true }, take: 1, orderBy: { semester: 'desc' } },
        },
        skip,
        take: limit,
        orderBy: { user: { createdAt: 'desc' } },
      }),
      prisma.student.count({ where }),
    ]);

    // Compute progress (mock from latest GPA if available)
    const mapped = items
      .filter((s) => (courseId ? (s.attendance && s.attendance.length > 0) : true))
      .map((s) => {
        const latestGpa = s.reports[0]?.gpa ?? null;
        return {
          ...s,
          progress: latestGpa ? Math.min(100, Math.max(0, Math.round((latestGpa / 4) * 100))) : null,
        };
      });

    return NextResponse.json(apiSuccess({ items: mapped, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /admin/students error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = createStudentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const created = await prisma.student.create({
      data: {
        userId: parsed.data.userId,
        enrollmentNo: parsed.data.enrollmentNo,
        semester: parsed.data.semester,
        section: parsed.data.section,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(apiError('Student already exists for user or duplicate enrollment'), { status: 409 });
    }
    console.error('POST /admin/students error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = updateStudentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const updated = await prisma.student.update({
      where: { id: parsed.data.id },
      data: {
        enrollmentNo: parsed.data.enrollmentNo ?? undefined,
        semester: parsed.data.semester ?? undefined,
        section: parsed.data.section ?? undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }
    console.error('PUT /admin/students error:', error);
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

    // Delete related records first
    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    // Delete student's submissions
    await prisma.submission.deleteMany({ where: { studentId: id } });

    // Delete student's attendance records
    await prisma.attendance.deleteMany({ where: { studentId: id } });

    // Delete student's reports
    await prisma.report.deleteMany({ where: { studentId: id } });

    // Delete student's leave requests
    await prisma.leaveRequest.deleteMany({ where: { studentId: id } });

    // Now delete the student profile
    await prisma.student.delete({ where: { id } });
    return NextResponse.json(apiSuccess({ id }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }
    // Handle foreign key constraint errors
    if (error?.code === 'P2003' || error?.message?.includes('foreign key')) {
      return NextResponse.json(
        apiError('Cannot delete student: Student has related records that need to be deleted first'),
        { status: 409 }
      );
    }
    console.error('DELETE /admin/students error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


