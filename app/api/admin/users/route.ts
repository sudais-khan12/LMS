import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { parsePagination } from '@/lib/api/pagination';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  specialization: z.string().optional(),
  contact: z.string().optional(),
  enrollmentNo: z.string().optional(),
  semester: z.number().int().optional(),
  section: z.string().optional(),
});

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
  specialization: z.string().optional(),
  contact: z.string().optional(),
  enrollmentNo: z.string().optional(),
  semester: z.number().int().optional(),
  section: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') as Role | null) || null;
    const q = searchParams.get('q') || '';

    const where: any = {};
    if (role) where.role = role;
    if (q) where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          teacher: true,
          student: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /admin/users error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = createUserSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }
    const data = parsed.data;

    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        role: data.role as Role,
        teacher: data.role === 'TEACHER' ? {
          create: {
            specialization: data.specialization ?? null,
            contact: data.contact ?? null,
          },
        } : undefined,
        student: data.role === 'STUDENT' ? {
          create: {
            enrollmentNo: data.enrollmentNo || `ENR-${Date.now()}`,
            semester: data.semester ?? 1,
            section: data.section ?? 'A',
          },
        } : undefined,
      },
      include: { teacher: true, student: true },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(apiError('Email already exists'), { status: 409 });
    }
    console.error('POST /admin/users error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = updateUserSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }
    const data = parsed.data;

    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.email) updates.email = data.email;
    if (data.password) updates.password = await bcrypt.hash(data.password, 10);
    if (data.role) updates.role = data.role as Role;

    const updated = await prisma.user.update({
      where: { id: data.id },
      data: updates,
      include: { teacher: true, student: true },
    });

    // Update nested profiles if provided
    if (data.role === 'TEACHER' || updated.role === 'TEACHER') {
      await prisma.teacher.upsert({
        where: { userId: data.id },
        update: {
          specialization: data.specialization ?? undefined,
          contact: data.contact ?? undefined,
        },
        create: {
          userId: data.id,
          specialization: data.specialization ?? null,
          contact: data.contact ?? null,
        },
      });
    }

    if (data.role === 'STUDENT' || updated.role === 'STUDENT') {
      await prisma.student.upsert({
        where: { userId: data.id },
        update: {
          enrollmentNo: data.enrollmentNo ?? undefined,
          semester: data.semester ?? undefined,
          section: data.section ?? undefined,
        },
        create: {
          userId: data.id,
          enrollmentNo: data.enrollmentNo || `ENR-${Date.now()}`,
          semester: data.semester ?? 1,
          section: data.section ?? 'A',
        },
      });
    }

    const finalUser = await prisma.user.findUnique({
      where: { id: data.id },
      include: { teacher: true, student: true },
    });

    return NextResponse.json(apiSuccess(finalUser), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }
    console.error('PUT /admin/users error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(apiError('Missing id'), { status: 400 });
    }

    // First, get the user to check their role and related records
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        teacher: true,
        student: true,
      },
    });

    if (!user) {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }

    // Delete related records first in the correct order
    
    // If user is a Student, delete all student-related records
    if (user.student) {
      const studentId = user.student.id;
      
      // Delete student's submissions
      await prisma.submission.deleteMany({
        where: { studentId },
      });

      // Delete student's attendance records
      await prisma.attendance.deleteMany({
        where: { studentId },
      });

      // Delete student's reports
      await prisma.report.deleteMany({
        where: { studentId },
      });

      // Delete student's leave requests
      await prisma.leaveRequest.deleteMany({
        where: { studentId },
      });

      // Now delete the student profile
      await prisma.student.delete({
        where: { id: studentId },
      });
    }

    // If user is a Teacher, handle teacher-related records
    if (user.teacher) {
      const teacherId = user.teacher.id;
      
      // Set courses to have no teacher (null teacherId) instead of deleting courses
      await prisma.course.updateMany({
        where: { teacherId },
        data: { teacherId: null },
      });

      // Delete the teacher profile
      await prisma.teacher.delete({
        where: { id: teacherId },
      });
    }

    // Delete user's leave requests where they are the requester
    await prisma.leaveRequest.deleteMany({
      where: { requesterId: id },
    });

    // Delete leave requests where user is the approver
    await prisma.leaveRequest.deleteMany({
      where: { approverId: id },
    });

    // Delete user's notifications
    await prisma.notification.deleteMany({
      where: { userId: id },
    });

    // Delete NextAuth related records (accounts and sessions)
    await prisma.account.deleteMany({
      where: { userId: id },
    });

    await prisma.session.deleteMany({
      where: { userId: id },
    });

    // Now delete the user (accounts and sessions will be handled by Prisma relations)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json(apiSuccess({ id }), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }
    // Handle foreign key constraint errors
    if (error?.code === 'P2003' || error?.message?.includes('foreign key')) {
      return NextResponse.json(
        apiError('Cannot delete user: User has related records that need to be deleted first'),
        { status: 409 }
      );
    }
    console.error('DELETE /admin/users error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


