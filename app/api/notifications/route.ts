import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const createNotificationSchema = z.object({
  userId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  link: z.string().optional(),
  category: z.string().optional(),
  data: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    const { searchParams } = new URL(request.url);
    const unread = searchParams.get('unread') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const cursor = searchParams.get('cursor') ?? undefined;
    const category = searchParams.get('category') ?? undefined;

    let where: any = {};

    if (role === 'ADMIN') {
      // Admin can see all notifications or filter by userId
      const userId = searchParams.get('userId') ?? undefined;
      if (userId) {
        where.userId = userId;
      }
    } else {
      // Regular users can only see their own notifications
      where.userId = session.user.id;
    }

    if (unread) {
      where.isRead = false;
    }

    if (category) {
      where.category = category;
    }

    // Pagination
    const take = limit && limit > 0 && limit <= 100 ? limit : 20;
    const skip = cursor ? 1 : 0;

    if (cursor) {
      where.id = { lt: cursor };
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notifications fetched successfully',
        data: {
          notifications,
          unreadCount,
          hasMore: notifications.length === take,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    // Only admins can manually create notifications
    if (role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Only admins can create notifications' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
    }

    // Determine target users
    let userIds: string[] = [];

    if (parsed.data.userIds && parsed.data.userIds.length > 0) {
      userIds = parsed.data.userIds;
    } else if (parsed.data.userId) {
      userIds = [parsed.data.userId];
    } else {
      // If no userId specified, create for all users (system notification)
      const allUsers = await prisma.user.findMany({
        select: { id: true },
      });
      userIds = allUsers.map((u) => u.id);
    }

    // Create notifications for all target users
    const notifications = await Promise.all(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            title: parsed.data.title,
            body: parsed.data.body,
            link: parsed.data.link ?? null,
            category: parsed.data.category ?? null,
            data: parsed.data.data ?? null,
          },
        })
      )
    );

    return NextResponse.json({ success: true, message: 'Notifications created successfully', data: notifications }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead') === 'true';
    const category = searchParams.get('category') ?? undefined;

    let where: any = {
      userId: session.user.id,
    };

    if (isRead !== null) {
      where.isRead = isRead;
    }

    if (category) {
      where.category = category;
    }

    const result = await prisma.notification.deleteMany({
      where,
    });

    return NextResponse.json({ success: true, message: `${result.count} notification(s) deleted successfully`, data: { count: result.count } }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/notifications error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

