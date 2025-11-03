import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const createCourseSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	code: z.string().min(1),
});

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session || !session.user) {
			return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}

		const role = session.user.role as Role;
		let data;

		if (role === 'ADMIN') {
			data = await prisma.course.findMany({ include: { teacher: { include: { user: true } } } });
		} else if (role === 'TEACHER') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (!teacher) return NextResponse.json({ success: true, message: 'No courses', data: [] }, { status: 200 });
			data = await prisma.course.findMany({ where: { teacherId: teacher.id } });
		} else {
			// STUDENT: Without an enrollment model, return all for now
			data = await prisma.course.findMany();
		}

		return NextResponse.json({ success: true, message: 'Courses fetched', data }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('GET /api/courses error:', error);
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
		if (role !== 'ADMIN' && role !== 'TEACHER') {
			return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
		}

		const body = await request.json();
		const parsed = createCourseSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });
		}

		let teacherId: string | null = null;
		if (role === 'TEACHER') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (!teacher) return NextResponse.json({ success: false, message: 'Teacher profile not found' }, { status: 400 });
			teacherId = teacher.id;
		}

		const course = await prisma.course.create({
			data: {
				title: parsed.data.title,
				description: parsed.data.description ?? null,
				code: parsed.data.code,
				teacherId,
			},
		});

		return NextResponse.json({ success: true, message: 'Course created', data: course }, { status: 201 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('POST /api/courses error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
