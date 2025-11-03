import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const markAttendanceSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
  date: z.string().optional(), // Optional, defaults to today
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') ?? undefined;
    const studentId = searchParams.get('studentId') ?? undefined;

    let where: any = {};

    if (role === 'ADMIN') {
      // Admin can see all attendance
      if (courseId) where.courseId = courseId;
      if (studentId) where.studentId = studentId;
    } else if (role === 'TEACHER') {
      // Teacher can see attendance for their courses
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher) {
        return NextResponse.json({ success: true, message: 'No attendance records', data: [] }, { status: 200 });
      }

      where.course = { teacherId: teacher.id };
      if (courseId) where.courseId = courseId;
      if (studentId) where.studentId = studentId;
    } else {
      // STUDENT can see only their own attendance
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student) {
        return NextResponse.json({ success: true, message: 'No attendance records', data: [] }, { status: 200 });
      }

      where.studentId = student.id;
      if (courseId) where.courseId = courseId;
    }

    const attendance = await prisma.attendance.findMany({
      where,
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
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ success: true, message: 'Attendance fetched successfully', data: attendance }, { status: 200 });
  } catch (error) {
    console.error('GET /api/attendance error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only teachers and admins can mark attendance' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = markAttendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
    }

    // Check if teacher owns the course
    if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher) {
        return NextResponse.json({ success: false, message: 'Teacher profile not found' }, { status: 400 });
      }

      const course = await prisma.course.findUnique({
        where: { id: parsed.data.courseId },
      });

      if (!course || course.teacherId !== teacher.id) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only mark attendance for your own courses' }, { status: 403 });
      }
    }

    // Parse date or use today
    const attendanceDate = parsed.data.date ? new Date(parsed.data.date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check for duplicate (student + course + date)
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_courseId_date: {
          studentId: parsed.data.studentId,
          courseId: parsed.data.courseId,
          date: attendanceDate,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'Attendance already marked for this student on this date' }, { status: 409 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId: parsed.data.studentId,
        courseId: parsed.data.courseId,
        status: parsed.data.status,
        date: attendanceDate,
      },
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

    return NextResponse.json({ success: true, message: 'Attendance marked successfully', data: attendance }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/attendance error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'Duplicate attendance record' }, { status: 409 });
    }

    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


