import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';
import { parsePagination } from '@/lib/api/pagination';
import { createLeaveSchema } from '@/lib/validation/leave';

export async function GET(request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const { limit, skip } = parsePagination(request.url);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const where: any = { requesterId: studentAuth.session.user.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return NextResponse.json(apiSuccess({ items, total, limit, skip }), { status: 200 });
  } catch (error) {
    console.error('GET /api/student/leave-requests error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const json = await request.json();
    const parsed = createLeaveSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });

    // Check pending limit
    const pendingCount = await prisma.leaveRequest.count({ where: { requesterId: studentAuth.session.user.id, status: 'PENDING' } });
    if (pendingCount >= 3) return NextResponse.json(apiError('Maximum 3 pending leave requests allowed'), { status: 400 });

    const fromDate = new Date(parsed.data.fromDate);
    const toDate = new Date(parsed.data.toDate);

    // Check overlapping
    const overlap = await prisma.leaveRequest.findFirst({
      where: {
        requesterId: studentAuth.session.user.id,
        status: { in: ['PENDING', 'APPROVED'] },
        fromDate: { lte: toDate },
        toDate: { gte: fromDate },
      },
    });
    if (overlap) return NextResponse.json(apiError('Overlapping leave request exists'), { status: 409 });

    // Create leave request and notify admins
    const created = await prisma.leaveRequest.create({
      data: {
        requesterId: studentAuth.session.user.id,
        studentId: studentAuth.student.id,
        type: parsed.data.type,
        fromDate,
        toDate,
        reason: parsed.data.reason,
      },
    });

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: 'New Leave Request',
        body: 'A student has submitted a new leave request',
        link: `/admin/leaves/${created.id}`,
        category: 'leave',
      })),
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error) {
    console.error('POST /api/student/leave-requests error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


