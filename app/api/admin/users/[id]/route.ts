import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { updateUserSchema } from '@/lib/validation/user';
import bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id }, include: { teacher: true, student: true } });
    if (!user) return NextResponse.json(apiError('User not found'), { status: 404 });
    return NextResponse.json(apiSuccess(user), { status: 200 });
  } catch (error) {
    console.error('GET /admin/users/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = updateUserSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });

    const updates: Prisma.UserUpdateInput = {};
    if (parsed.data.name) updates.name = parsed.data.name;
    if (parsed.data.email) updates.email = parsed.data.email;
    if (parsed.data.password) updates.password = await bcrypt.hash(parsed.data.password, 10);
    if (parsed.data.role) updates.role = parsed.data.role as Role;

    const updated = await prisma.user.update({ where: { id }, data: updates, include: { teacher: true, student: true } });

    // upsert nested profiles if role suggests
    if ((parsed.data.role === 'TEACHER') || updated.role === 'TEACHER') {
      await prisma.teacher.upsert({
        where: { userId: id },
        update: { specialization: parsed.data.specialization ?? undefined, contact: parsed.data.contact ?? undefined },
        create: { userId: id, specialization: parsed.data.specialization ?? null, contact: parsed.data.contact ?? null },
      });
    }

    if ((parsed.data.role === 'STUDENT') || updated.role === 'STUDENT') {
      await prisma.student.upsert({
        where: { userId: id },
        update: { enrollmentNo: parsed.data.enrollmentNo ?? undefined, semester: parsed.data.semester ?? undefined, section: parsed.data.section ?? undefined },
        create: { userId: id, enrollmentNo: parsed.data.enrollmentNo || `ENR-${Date.now()}`, semester: parsed.data.semester ?? 1, section: parsed.data.section ?? 'A' },
      });
    }

    const finalUser = await prisma.user.findUnique({ where: { id }, include: { teacher: true, student: true } });
    return NextResponse.json(apiSuccess(finalUser), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json(apiSuccess({ id }), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


