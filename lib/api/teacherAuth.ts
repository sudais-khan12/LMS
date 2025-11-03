import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { apiError } from './response';
import { prisma } from '@/lib/prisma';

export async function requireTeacher() {
  const session = await auth();
  if (!session || !session.user) {
    return { ok: false as const, response: NextResponse.json(apiError('Unauthorized'), { status: 401 }) };
  }
  if ((session.user.role as Role) !== 'TEACHER') {
    return { ok: false as const, response: NextResponse.json(apiError('Forbidden'), { status: 403 }) };
  }

  // Fetch teacher profile
  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacher) {
    return { ok: false as const, response: NextResponse.json(apiError('Teacher profile not found'), { status: 404 }) };
  }

  return { ok: true as const, session, teacher };
}

