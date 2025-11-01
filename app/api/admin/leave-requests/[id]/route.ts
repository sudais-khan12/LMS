import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { updateLeaveStatusSchema } from '@/lib/validation/leave';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  try {
    const json = await request.json();
    const parsed = updateLeaveStatusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const existing = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: { requester: { select: { id: true, name: true, email: true } } },
    });
    if (!existing) return NextResponse.json(apiError('Leave request not found'), { status: 404 });

    // Update status and approver
    const updated = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: { status: parsed.data.status, approverId: admin.session!.user.id },
      include: { requester: { select: { id: true, name: true, email: true } } },
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: updated.requesterId,
        title: `Leave Request ${parsed.data.status}`,
        body: `Your leave request (${existing.type}) has been ${parsed.data.status.toLowerCase()}.`,
        link: `/student/leaves/${updated.id}`,
        category: 'leave',
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error) {
    console.error('PATCH /admin/leave-requests/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


