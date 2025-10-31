import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester') ? parseInt(searchParams.get('semester')!) : undefined;

    // Check access permissions
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student || student.id !== params.studentId) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only view your own reports' }, { status: 403 });
      }
    } else if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          courses: {
            include: {
              attendance: {
                where: {
                  studentId: params.studentId,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!teacher) {
        return NextResponse.json({ success: false, message: 'Teacher profile not found' }, { status: 400 });
      }

      const hasAccess = teacher.courses.some((course) => course.attendance.length > 0);

      if (!hasAccess) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only view reports for students in your courses' }, { status: 403 });
      }
    }

    // Get student reports
    const where: any = {
      studentId: params.studentId,
    };

    if (semester) {
      where.semester = semester;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        semester: 'desc',
      },
    });

    // Get attendance summary
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: params.studentId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
    });

    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const absentCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length;
    const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;
    const attendanceRate = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

    // Get assignment statistics
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: params.studentId,
      },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
              },
            },
          },
        },
      },
    });

    const validGrades = submissions.filter((s) => s.grade !== null).map((s) => s.grade!);
    const avgAssignmentScore = validGrades.length > 0 ? validGrades.reduce((acc, grade) => acc + grade, 0) / validGrades.length : 0;
    const totalSubmissions = submissions.length;
    const completedAssignments = validGrades.length;
    const pendingAssignments = totalSubmissions - completedAssignments;

    // Calculate overall GPA if reports exist
    const overallGPA = reports.length > 0 ? reports.reduce((acc, r) => acc + r.gpa, 0) / reports.length : 0;

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: params.studentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Student performance report fetched successfully',
        data: {
          student,
          reports,
          overallGPA: Math.round(overallGPA * 100) / 100,
          attendance: {
            totalClasses,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            records: attendanceRecords,
          },
          assignments: {
            totalSubmissions,
            completedAssignments,
            pendingAssignments,
            averageScore: Math.round(avgAssignmentScore * 100) / 100,
            submissions,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/reports/student/:studentId error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


