import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;

    // Check course exists and access
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: true,
        attendance: {
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
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    // Check if teacher owns this course
    if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacher || course.teacherId !== teacher.id) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
    }

    // Get unique students from attendance records
    const studentMap = new Map();
    course.attendance.forEach((att) => {
      if (!studentMap.has(att.studentId)) {
        studentMap.set(att.studentId, {
          id: att.student.id,
          userId: att.student.user.id,
          name: att.student.user.name,
          email: att.student.user.email,
          enrollmentNo: att.student.enrollmentNo,
          semester: att.student.semester,
          section: att.student.section,
        });
      }
    });

    const students = Array.from(studentMap.values());

    return NextResponse.json({ success: true, message: 'Students fetched successfully', data: students }, { status: 200 });
  } catch (error) {
    console.error('GET /api/courses/:id/students error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


