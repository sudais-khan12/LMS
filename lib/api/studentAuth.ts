import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { apiError } from './response';
import { prisma } from '@/lib/prisma';

export async function requireStudent() {
  const session = await auth();
  if (!session || !session.user) {
    return { ok: false as const, response: NextResponse.json(apiError('Unauthorized'), { status: 401 }) };
  }
  if ((session.user.role as Role) !== 'STUDENT') {
    return { ok: false as const, response: NextResponse.json(apiError('Forbidden'), { status: 403 }) };
  }

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) {
    return { ok: false as const, response: NextResponse.json(apiError('Student profile not found'), { status: 404 }) };
  }

  return { ok: true as const, session, student };
}


