import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const updateNotificationSchema = z.object({
  isRead: z.boolean(),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
    }

    // Users can only view their own notifications
    if (notification.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, message: 'Notification fetched successfully', data: notification }, { status: 200 });
  } catch (error) {
    console.error('GET /api/notifications/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
    }

    // Users can only update their own notifications
    if (notification.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: {
        isRead: parsed.data.isRead,
      },
    });

    return NextResponse.json({ success: true, message: 'Notification updated successfully', data: updated }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/notifications/:id error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

