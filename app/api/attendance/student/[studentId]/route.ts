import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const { studentId } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') ?? undefined;

    // Check access permissions
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student || student.id !== studentId) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only view your own attendance' }, { status: 403 });
      }
    } else if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          courses: true,
        },
      });

      if (!teacher) {
        return NextResponse.json({ success: false, message: 'Teacher profile not found' }, { status: 400 });
      }

      // Check if student is enrolled in teacher's courses
      if (courseId) {
        const course = teacher.courses.find((c) => c.id === courseId);
        if (!course) {
          return NextResponse.json({ success: false, message: 'Forbidden: You can only view attendance for your courses' }, { status: 403 });
        }
      }
    }

    const where: any = {
      studentId: params.studentId,
    };

    if (courseId) {
      where.courseId = courseId;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate attendance statistics
    const totalRecords = attendance.length;
    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
    const lateCount = attendance.filter((a) => a.status === 'LATE').length;
    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    return NextResponse.json(
      {
        success: true,
        message: 'Student attendance fetched successfully',
        data: {
          attendance,
          statistics: {
            totalRecords,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/attendance/student/:studentId error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


