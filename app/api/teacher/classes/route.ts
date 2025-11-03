import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { parsePagination } from '@/lib/api/pagination';
import { createCourseSchema, updateCourseSchema } from '@/lib/validation/course';

export async function GET(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);

    // Only get courses assigned to this teacher
    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where: { teacherId: teacherAuth.teacher.id },
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
      prisma.course.count({ where: { teacherId: teacherAuth.teacher.id } }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/teacher/classes error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const json = await request.json();
    const parsed = createCourseSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    // Auto-assign to this teacher
    const created = await prisma.course.create({
      data: {
        title: parsed.data.title,
        code: parsed.data.code,
        description: parsed.data.description ?? null,
        teacherId: teacherAuth.teacher.id,
      },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(apiError('Course code already exists'), { status: 409 });
    }
    console.error('POST /api/teacher/classes error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

