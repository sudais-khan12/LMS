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
    const status = searchParams.get('status') || undefined;

    // Get teacher's courses
    const courses = await prisma.course.findMany({
      where: { teacherId: teacherAuth.teacher.id },
      select: { id: true },
    });

    const courseIds = courses.map((c) => c.id);

    // Get students who have attendance in teacher's courses
    const attendanceRecords = await prisma.attendance.findMany({
      where: { courseId: { in: courseIds } },
      select: { studentId: true },
      distinct: ['studentId'],
    });

    const studentIds = attendanceRecords.map((a) => a.studentId);

    // Get student user IDs
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { userId: true },
    });

    const studentUserIds = students.map((s) => s.userId);
    // Also include teacher's own leave requests
    studentUserIds.push(teacherAuth.session.user.id);

    const where: any = {
      requesterId: { in: studentUserIds },
    };

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, email: true, role: true } },
          approver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/teacher/leave-requests error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

