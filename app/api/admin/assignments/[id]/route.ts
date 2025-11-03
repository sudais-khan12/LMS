import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { updateAssignmentSchema } from '@/lib/validation/assignment';
import { Prisma } from '@prisma/client';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const { id } = await params;
    const item = await prisma.assignment.findUnique({ where: { id } });
    if (!item) return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    return NextResponse.json(apiSuccess(item), { status: 200 });
  } catch (error) {
    console.error('GET /admin/assignments/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = updateAssignmentSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }
    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        title: parsed.data.title ?? undefined,
        description: parsed.data.description ?? undefined,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      },
    });
    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    }
    console.error('PATCH /admin/assignments/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const { id } = await params;
    await prisma.assignment.delete({ where: { id } });
    return NextResponse.json(apiSuccess({ id }), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(apiError('Assignment not found'), { status: 404 });
    }
    console.error('DELETE /admin/assignments/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


