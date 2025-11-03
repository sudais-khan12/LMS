import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(_request: NextRequest) {
	try {
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

		let data;
		if (session.user.role === 'ADMIN') {
			data = await prisma.submission.findMany({ include: { assignment: { include: { course: true } }, student: true } });
		} else if (session.user.role === 'TEACHER') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (!teacher) return NextResponse.json({ success: true, message: 'No submissions', data: [] }, { status: 200 });
			data = await prisma.submission.findMany({
				where: { assignment: { course: { teacherId: teacher.id } } },
				include: { assignment: { include: { course: true } }, student: true },
			});
		} else {
			const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
			if (!student) return NextResponse.json({ success: true, message: 'No submissions', data: [] }, { status: 200 });
			data = await prisma.submission.findMany({ where: { studentId: student.id }, include: { assignment: true } });
		}

		return NextResponse.json({ success: true, message: 'Submissions fetched', data }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('GET /api/submissions error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
