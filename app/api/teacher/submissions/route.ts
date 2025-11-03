import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { parsePagination } from '@/lib/api/pagination';

export async function GET(request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId') || undefined;

    // Get teacher's courses
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: teacherAuth.teacher.id },
      select: { id: true },
    });

    const courseIds = teacherCourses.map((c) => c.id);

    // Get assignments for teacher's courses
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true },
    });

    const assignmentIds = assignments.map((a) => a.id);

    if (assignmentId) {
      // Verify assignment belongs to teacher
      if (!assignmentIds.includes(assignmentId)) {
        return NextResponse.json(apiError('Forbidden: Assignment not found or not yours'), { status: 403 });
      }
    }

    const where: any = {
      assignmentId: { in: assignmentIds },
    };

    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    const [items, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          assignment: {
            include: {
              course: { select: { id: true, title: true, code: true } },
            },
          },
          student: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.submission.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/teacher/submissions error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

