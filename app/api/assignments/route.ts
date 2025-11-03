import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const createAssignmentSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	dueDate: z.string().transform((v) => new Date(v)),
	courseId: z.string().min(1),
});

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

		const { searchParams } = new URL(request.url);
		const courseId = searchParams.get('courseId') ?? undefined;
		const teacherId = searchParams.get('teacherId') ?? undefined;

		const where: any = {};
		if (courseId) where.courseId = courseId;
		if (teacherId) where.course = { teacherId };

		// Teachers by default see their own assignments if no filter provided
		if (!courseId && !teacherId && session.user.role === 'TEACHER') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (teacher) where.course = { teacherId: teacher.id };
		}

		const data = await prisma.assignment.findMany({ where, include: { course: true } });
		return NextResponse.json({ success: true, message: 'Assignments fetched', data }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('GET /api/assignments error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		const role = session.user.role as Role;
		if (role !== 'ADMIN' && role !== 'TEACHER') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

		const body = await request.json();
		const parsed = createAssignmentSchema.safeParse(body);
		if (!parsed.success) return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });

		// Teacher can only create for their own course
		if (role === 'TEACHER') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (!teacher) return NextResponse.json({ success: false, message: 'Teacher profile not found' }, { status: 400 });
			const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
			if (!course || course.teacherId !== teacher.id) {
				return NextResponse.json({ success: false, message: 'Forbidden: cannot create for this course' }, { status: 403 });
			}
		}

		const assignment = await prisma.assignment.create({
			data: {
				title: parsed.data.title,
				description: parsed.data.description ?? null,
				dueDate: parsed.data.dueDate,
				courseId: parsed.data.courseId,
			},
		});
		return NextResponse.json({ success: true, message: 'Assignment created', data: assignment }, { status: 201 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('POST /api/assignments error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
