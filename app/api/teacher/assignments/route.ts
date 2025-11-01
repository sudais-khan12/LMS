import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { parsePagination } from '@/lib/api/pagination';
import { createAssignmentSchema } from '@/lib/validation/assignment';

export async function GET(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;

    // Get teacher's courses
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: teacherAuth.teacher.id },
      select: { id: true },
    });

    const courseIds = teacherCourses.map((c) => c.id);

    if (courseId) {
      // Verify course belongs to teacher
      if (!courseIds.includes(courseId)) {
        return NextResponse.json(apiError('Forbidden: Course not found or not yours'), { status: 403 });
      }
    }

    const where: any = {
      courseId: { in: courseIds },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const [items, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          course: { select: { id: true, title: true, code: true } },
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: { dueDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/teacher/assignments error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const json = await request.json();
    const parsed = createAssignmentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    // Verify course belongs to teacher
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { teacherId: true },
    });

    if (!course || course.teacherId !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: Course not found or not yours'), { status: 403 });
    }

    const created = await prisma.assignment.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        dueDate: new Date(parsed.data.dueDate),
        courseId: parsed.data.courseId,
      },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error) {
    console.error('POST /api/teacher/assignments error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

