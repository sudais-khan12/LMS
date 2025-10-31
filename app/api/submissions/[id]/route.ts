import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

		const submission = await prisma.submission.findUnique({
			where: { id: params.id },
			include: { assignment: { include: { course: true } }, student: true },
		});
		if (!submission) return NextResponse.json({ success: false, message: 'Submission not found' }, { status: 404 });

		if (session.user.role === 'ADMIN') {
			return NextResponse.json({ success: true, message: 'Submission fetched', data: submission }, { status: 200 });
		}

		if (session.user.role === 'TEACHER') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (teacher && submission.assignment.course?.teacherId === teacher.id) {
				return NextResponse.json({ success: true, message: 'Submission fetched', data: submission }, { status: 200 });
			}
			return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
		}

		// STUDENT
		const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
		if (student && submission.studentId === student.id) {
			return NextResponse.json({ success: true, message: 'Submission fetched', data: submission }, { status: 200 });
		}

		return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('GET /api/submissions/:id error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
