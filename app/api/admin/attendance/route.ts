import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { parsePagination } from '@/lib/api/pagination';
import { upsertAttendanceSchema } from '@/lib/validation/attendance';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;
    const studentId = searchParams.get('studentId') || undefined;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: { include: { user: { select: { id: true, name: true, email: true } } } },
          course: { select: { id: true, title: true, code: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /admin/attendance error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = upsertAttendanceSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const date = parsed.data.date ? new Date(parsed.data.date) : new Date();

    // Upsert by unique composite (studentId, courseId, date)
    const updated = await prisma.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId: parsed.data.studentId,
          courseId: parsed.data.courseId,
          date,
        },
      },
      update: { status: parsed.data.status },
      create: {
        studentId: parsed.data.studentId,
        courseId: parsed.data.courseId,
        date,
        status: parsed.data.status,
      },
      include: {
        student: { include: { user: { select: { id: true, name: true, email: true } } } },
        course: { select: { id: true, title: true, code: true } },
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error) {
    console.error('POST /admin/attendance error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


