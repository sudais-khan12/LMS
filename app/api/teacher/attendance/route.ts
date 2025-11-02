import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { parsePagination } from '@/lib/api/pagination';
import { upsertAttendanceSchema } from '@/lib/validation/attendance';

export async function GET(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;

    // Verify course belongs to teacher if provided
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true },
      });

      if (!course || course.teacherId !== teacherAuth.teacher.id) {
        return NextResponse.json(apiError('Forbidden: Course not found or not yours'), { status: 403 });
      }
    }

    // Get all courses for this teacher
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: teacherAuth.teacher.id },
      select: { id: true },
    });

    const courseIds = teacherCourses.map((c) => c.id);

    const where: any = {
      courseId: { in: courseIds },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
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
    console.error('GET /api/teacher/attendance error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const json = await request.json();
    const parsed = upsertAttendanceSchema.safeParse(json);
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

    // Parse date correctly - ensure it's set to start of day for consistency
    let date: Date;
    if (parsed.data.date) {
      date = new Date(parsed.data.date);
      date.setHours(0, 0, 0, 0); // Set to start of day
    } else {
      date = new Date();
      date.setHours(0, 0, 0, 0);
    }

    // Upsert attendance
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
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        course: { select: { id: true, title: true, code: true } },
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error) {
    console.error('POST /api/teacher/attendance error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

