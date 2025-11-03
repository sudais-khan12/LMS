import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const submitSchema = z.object({
	assignmentId: z.string().min(1),
	content: z.string().optional(),
	attachmentUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		if (session.user.role !== 'STUDENT') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

		const body = await request.json();
		const parsed = submitSchema.safeParse(body);
		if (!parsed.success) return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });

		const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
		if (!student) return NextResponse.json({ success: false, message: 'Student profile not found' }, { status: 400 });

		const submission = await prisma.submission.create({
			data: {
				assignmentId: parsed.data.assignmentId,
				studentId: student.id,
				fileUrl: parsed.data.attachmentUrl ?? 'N/A',
			},
		});

		return NextResponse.json({ success: true, message: 'Submission created', data: submission }, { status: 201 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('POST /api/assignments/submit error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
