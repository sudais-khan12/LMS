import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role, Prisma } from '@prisma/client';
import { z } from 'zod';

const updateReportSchema = z.object({
  gpa: z.number().min(0).max(4.0).optional(),
  remarks: z.string().nullable().optional(),
  semester: z.number().int().min(1).max(10).optional(),
});

// Helper function to calculate GPA (same as in route.ts)
async function calculateGPA(studentId: string, courseId?: string): Promise<number> {
  const submissionWhere: Prisma.SubmissionWhereInput = { studentId };
  if (courseId) {
    submissionWhere.assignment = { courseId };
  }

  const submissions = await prisma.submission.findMany({
    where: submissionWhere,
    include: {
      assignment: {
        select: {
          courseId: true,
        },
      },
    },
  });

  const validGrades = submissions.filter((s) => s.grade !== null).map((s) => s.grade!);
  const avgScore = validGrades.length > 0 ? validGrades.reduce((acc, grade) => acc + grade, 0) / validGrades.length : 0;
  const assignmentScore = (avgScore / 100) * 4;

  const attendanceWhere: Prisma.AttendanceWhereInput = { studentId };
  if (courseId) {
    attendanceWhere.courseId = courseId;
  }

  const totalClasses = await prisma.attendance.count({
    where: attendanceWhere,
  });

  const presentCount = await prisma.attendance.count({
    where: {
      ...attendanceWhere,
      status: 'PRESENT',
    },
  });

  const attendanceRate = totalClasses > 0 ? presentCount / totalClasses : 0;
  const gpa = assignmentScore * 0.6 + attendanceRate * 4 * 0.4;

  return Math.round(gpa * 100) / 100;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;

    const report = await prisma.report.findUnique({
      where: { id },
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
    });

    if (!report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    // Check access permissions
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student || report.studentId !== student.id) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
    } else if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          courses: {
            include: {
              attendance: {
                where: {
                  studentId: report.studentId,
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
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, message: 'Report fetched successfully', data: report }, { status: 200 });
  } catch (error) {
    console.error('GET /api/reports/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only teachers and admins can update reports' }, { status: 403 });
    }

    const existingReport = await prisma.report.findUnique({
      where: { id },
    });

    if (!existingReport) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    // Check if teacher has access to this student
    if (role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          courses: {
            include: {
              attendance: {
                where: {
                  studentId: existingReport.studentId,
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
        return NextResponse.json({ success: false, message: 'Forbidden: You can only update reports for students in your courses' }, { status: 403 });
      }
    }

    const body = await request.json();
    const parsed = updateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
    }

    const updateData: Prisma.ReportUpdateInput = {};
    if (parsed.data.gpa !== undefined) updateData.gpa = parsed.data.gpa;
    if (parsed.data.remarks !== undefined) updateData.remarks = parsed.data.remarks;
    if (parsed.data.semester !== undefined) updateData.semester = parsed.data.semester;

    // If GPA not provided, recalculate it
    if (parsed.data.gpa === undefined) {
      updateData.gpa = await calculateGPA(existingReport.studentId);
    }

    const updated = await prisma.report.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json({ success: true, message: 'Report updated successfully', data: updated }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/reports/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


