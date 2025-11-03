import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';
import { parsePagination } from '@/lib/api/pagination';

export async function GET(request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const studentId = studentAuth.student.id;

    // Determine enrolled courses via attendance
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      select: { courseId: true },
      distinct: ['courseId'],
    });
    const courseIds = attendance.map((a) => a.courseId);

    if (courseIds.length === 0) {
      return NextResponse.json(apiSuccess({ items: [], total: 0, limit, skip }), { status: 200 });
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { id: { in: courseIds } },
        include: {
          teacher: { include: { user: { select: { id: true, name: true, email: true } } } },
          assignments: {
            include: {
              submissions: {
                where: { studentId },
                select: { grade: true, submittedAt: true },
              },
            },
          },
          attendance: {
            where: { studentId },
            select: { status: true },
          },
        },
        orderBy: { title: 'asc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where: { id: { in: courseIds } } }),
    ]);

    // Calculate progress for each course
    const items = courses.map((course) => {
      const totalAssignments = course.assignments.length;
      const completedAssignments = course.assignments.filter((a) =>
        a.submissions.some((s) => s.grade !== null)
      ).length;
      const progress = totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

      const attendanceRecords = course.attendance;
      const attendanceTotal = attendanceRecords.length;
      const attendancePresent = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
      const attendancePercentage = attendanceTotal > 0
        ? Math.round((attendancePresent / attendanceTotal) * 100)
        : 0;

      // Determine status
      let status: 'Enrolled' | 'Completed' | 'In Progress' = 'Enrolled';
      if (progress === 100 && totalAssignments > 0) {
        status = 'Completed';
      } else if (progress > 0) {
        status = 'In Progress';
      }

      return {
        id: course.id,
        title: course.title,
        code: course.code,
        description: course.description || '',
        instructor: course.teacher?.user?.name || 'Unassigned',
        category: course.code.split(/\d+/)[0] || 'General', // Extract category from course code
        level: 'Beginner', // Default level
        progress,
        status,
        assignmentsCount: totalAssignments,
        completedAssignments,
        attendancePercentage,
      };
    });

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/student/courses error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


