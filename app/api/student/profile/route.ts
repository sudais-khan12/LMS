import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
  enrollmentNo: z.string().optional(),
  semester: z.number().int().min(1).max(8).optional(),
  section: z.string().optional(),
});

export async function GET(_request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: studentAuth.user.id },
      include: {
        student: true,
      },
    });

    if (!user) {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }

    // Get additional stats
    const reports = await prisma.report.findMany({
      where: { studentId: studentAuth.student.id },
      orderBy: { semester: 'desc' },
      take: 1,
    });

    const attendance = await prisma.attendance.findMany({
      where: { studentId: studentAuth.student.id },
      select: { status: true },
    });

    const totalClasses = attendance.length;
    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = totalClasses > 0 
      ? Math.round((presentCount / totalClasses) * 100)
      : 0;

    const submissions = await prisma.submission.findMany({
      where: { studentId: studentAuth.student.id },
      select: { grade: true },
    });
    const graded = submissions.filter((s) => s.grade !== null);
    const averageGrade = graded.length 
      ? Number((graded.reduce((s, g) => s + (g.grade ?? 0), 0) / graded.length).toFixed(2))
      : null;

    const currentGPA = reports.length > 0 ? reports[0].gpa : null;
    const credits = reports.reduce((sum, r) => sum + (r.credits || 0), 0);

    return NextResponse.json(
      apiSuccess({
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.student?.contact || '',
          studentId: user.student?.enrollmentNo || '',
          enrollmentDate: user.createdAt.toISOString().split('T')[0],
          program: user.student?.section || 'N/A',
          gpa: currentGPA?.toFixed(2) || 'N/A',
          credits: credits.toString(),
          semester: user.student?.semester?.toString() || 'N/A',
          enrollmentNo: user.student?.enrollmentNo || '',
          section: user.student?.section || '',
        },
        stats: {
          attendanceRate,
          averageGrade,
          currentGPA,
          credits,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/student/profile error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const json = await request.json();
    const parsed = updateProfileSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const data = parsed.data;
    const updates: any = {};

    // Update user fields
    if (data.name) updates.name = data.name;
    if (data.email) {
      // Check if email already exists for another user
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email, id: { not: studentAuth.user.id } },
      });
      if (existingUser) {
        return NextResponse.json(apiError('Email already exists'), { status: 409 });
      }
      updates.email = data.email;
    }
    if (data.password) {
      updates.password = await bcrypt.hash(data.password, 10);
    }

    // Update user
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: studentAuth.user.id },
        data: updates,
      });
    }

    // Update student profile
    const studentUpdates: any = {};
    if (data.enrollmentNo) studentUpdates.enrollmentNo = data.enrollmentNo;
    if (data.semester) studentUpdates.semester = data.semester;
    if (data.section) studentUpdates.section = data.section;
    if (data.phone) studentUpdates.contact = data.phone;

    if (Object.keys(studentUpdates).length > 0) {
      await prisma.student.update({
        where: { id: studentAuth.student.id },
        data: studentUpdates,
      });
    }

    // Fetch updated profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: studentAuth.user.id },
      include: { student: true },
    });

    return NextResponse.json(
      apiSuccess({
        message: 'Profile updated successfully',
        profile: updatedUser,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(apiError('Email already exists'), { status: 409 });
    }
    console.error('PATCH /api/student/profile error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

