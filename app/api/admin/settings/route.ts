import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/adminAuth';
import { z } from 'zod';

// In-memory mock settings store (ephemeral)
const settingsStore: Record<string, unknown> = {
  theme: 'light',
  notifications: true,
};

const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.boolean().optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  return NextResponse.json(apiSuccess(settingsStore), { status: 200 });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  try {
    const json = await request.json();
    const parsed = updateSettingsSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }
    Object.assign(settingsStore, parsed.data);
    return NextResponse.json(apiSuccess(settingsStore), { status: 200 });
  } catch (error) {
    console.error('POST /admin/settings error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

// Support PUT for update as well
export const PUT = POST;

export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  return NextResponse.json(apiError('Method not allowed'), { status: 405 });
}


