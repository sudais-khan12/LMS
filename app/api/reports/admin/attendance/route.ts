import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') ?? undefined;
    const studentId = searchParams.get('studentId') ?? undefined;

    // Build where clause
    let attendanceWhere: any = {};
    if (courseId) {
      attendanceWhere.courseId = courseId;
    }
    if (studentId) {
      attendanceWhere.studentId = studentId;
    }

    // Get all attendance records with course and student info
    const attendanceRecords = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Calculate attendance per course
    const courseMap = new Map<string, { course: any; total: number; present: number; absent: number; late: number }>();
    attendanceRecords.forEach((record) => {
      const courseId = record.courseId;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: record.course,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        });
      }
      const stats = courseMap.get(courseId)!;
      stats.total++;
      if (record.status === 'PRESENT') stats.present++;
      else if (record.status === 'ABSENT') stats.absent++;
      else if (record.status === 'LATE') stats.late++;
    });

    const courseStats = Array.from(courseMap.values()).map((stats) => ({
      courseId: stats.course.id,
      courseName: stats.course.title,
      courseCode: stats.course.code,
      totalClasses: stats.total,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      attendancePercentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    }));

    // Calculate attendance per student
    const studentMap = new Map<string, { student: any; total: number; present: number; absent: number; late: number }>();
    attendanceRecords.forEach((record) => {
      const studentId = record.studentId;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: {
            id: record.student.id,
            name: record.student.user.name,
            email: record.student.user.email,
            enrollmentNo: record.student.enrollmentNo,
          },
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        });
      }
      const stats = studentMap.get(studentId)!;
      stats.total++;
      if (record.status === 'PRESENT') stats.present++;
      else if (record.status === 'ABSENT') stats.absent++;
      else if (record.status === 'LATE') stats.late++;
    });

    const studentStats = Array.from(studentMap.values()).map((stats) => ({
      studentId: stats.student.id,
      studentName: stats.student.name,
      studentEmail: stats.student.email,
      enrollmentNo: stats.student.enrollmentNo,
      totalClasses: stats.total,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      attendancePercentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    }));

    // Calculate overall attendance percentage
    const totalRecords = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const overallAttendancePercentage =
      totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    return NextResponse.json(
      {
        success: true,
        message: 'Admin attendance report fetched successfully',
        data: {
          overallAttendancePercentage,
          courseStats,
          studentStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/reports/admin/attendance error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

