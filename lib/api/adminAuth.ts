import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { apiError } from './response';

export async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user) {
    return { ok: false as const, response: NextResponse.json(apiError('Unauthorized'), { status: 401 }) };
  }
  if ((session.user.role as Role) !== 'ADMIN') {
    return { ok: false as const, response: NextResponse.json(apiError('Forbidden'), { status: 403 }) };
  }
  return { ok: true as const, session };
}


