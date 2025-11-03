import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const createReportSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  semester: z.number().int().min(1).max(10),
  remarks: z.string().optional(),
});

// Helper function to calculate GPA
async function calculateGPA(studentId: string, courseId?: string): Promise<number> {
  // Get all submissions for the student (optionally filtered by course)
  const submissionWhere: any = { studentId };
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

  // Calculate average assignment score (assuming grade is out of 100)
  const validGrades = submissions.filter((s) => s.grade !== null).map((s) => s.grade!);
  const avgScore = validGrades.length > 0 ? validGrades.reduce((acc, grade) => acc + grade, 0) / validGrades.length : 0;

  // Convert to 4.0 scale: (score / 100) * 4
  const assignmentScore = (avgScore / 100) * 4;

  // Calculate attendance rate
  const attendanceWhere: any = { studentId };
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

  // Calculate GPA: (assignmentScore * 0.6) + (attendanceRate * 4 * 0.4)
  // assignmentScore is already on 4.0 scale, attendanceRate is 0-1
  const gpa = assignmentScore * 0.6 + attendanceRate * 4 * 0.4;

  // Round to 2 decimal places
  return Math.round(gpa * 100) / 100;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') ?? undefined;
    const semester = searchParams.get('semester') ? parseInt(searchParams.get('semester')!) : undefined;

    let where: any = {};

    if (role === 'ADMIN') {
      // Admin can see all reports
      if (studentId) where.studentId = studentId;
      if (semester) where.semester = semester;
    } else if (role === 'TEACHER') {
      // Teacher can see reports for their students
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
          courses: {
            include: {
              attendance: {
                select: {
                  studentId: true,
                },
              },
            },
          },
        },
      });

      if (!teacher) {
        return NextResponse.json({ success: true, message: 'No reports found', data: [] }, { status: 200 });
      }

      // Get unique student IDs from teacher's courses
      const studentIds = new Set<string>();
      teacher.courses.forEach((course) => {
        course.attendance.forEach((att) => {
          studentIds.add(att.studentId);
        });
      });

      if (studentIds.size === 0) {
        return NextResponse.json({ success: true, message: 'No reports found', data: [] }, { status: 200 });
      }

      where.studentId = { in: Array.from(studentIds) };
      if (studentId && studentIds.has(studentId)) {
        where.studentId = studentId;
      }
      if (semester) where.semester = semester;
    } else {
      // STUDENT can see only their own reports
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });

      if (!student) {
        return NextResponse.json({ success: true, message: 'No reports found', data: [] }, { status: 200 });
      }

      where.studentId = student.id;
      if (semester) where.semester = semester;
    }

    const reports = await prisma.report.findMany({
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
      },
      orderBy: {
        semester: 'desc',
      },
    });

    return NextResponse.json({ success: true, message: 'Reports fetched successfully', data: reports }, { status: 200 });
  } catch (error) {
    console.error('GET /api/reports error:', error);
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
      return NextResponse.json({ success: false, message: 'Forbidden: Only teachers and admins can generate reports' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
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
                  studentId: parsed.data.studentId,
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

      // Check if student has attendance in teacher's courses
      const hasAccess = teacher.courses.some((course) => course.attendance.length > 0);

      if (!hasAccess) {
        return NextResponse.json({ success: false, message: 'Forbidden: You can only generate reports for students in your courses' }, { status: 403 });
      }
    }

    // Check if report already exists for this student and semester
    const existingReport = await prisma.report.findFirst({
      where: {
        studentId: parsed.data.studentId,
        semester: parsed.data.semester,
      },
    });

    // Calculate GPA (for all courses, or could be course-specific)
    const gpa = await calculateGPA(parsed.data.studentId);

    if (existingReport) {
      // Update existing report
      const updated = await prisma.report.update({
        where: { id: existingReport.id },
        data: {
          gpa,
          remarks: parsed.data.remarks ?? existingReport.remarks,
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
        },
      });

      return NextResponse.json({ success: true, message: 'Report updated successfully', data: updated }, { status: 200 });
    }

    // Create new report
    const report = await prisma.report.create({
      data: {
        studentId: parsed.data.studentId,
        semester: parsed.data.semester,
        gpa,
        remarks: parsed.data.remarks ?? null,
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
      },
    });

    return NextResponse.json({ success: true, message: 'Report generated successfully', data: report }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


