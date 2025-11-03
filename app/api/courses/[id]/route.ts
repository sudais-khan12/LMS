import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const updateCourseSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
	code: z.string().min(1).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const course = await prisma.course.findUnique({ where: { id }, include: { teacher: true } });
		if (!course) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
		return NextResponse.json({ success: true, message: 'Course fetched', data: course }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('GET /api/courses/:id error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		const role = session.user.role as Role;

		const course = await prisma.course.findUnique({ where: { id } });
		if (!course) return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });

		if (role !== 'ADMIN') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (!teacher || course.teacherId !== teacher.id) {
				return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
			}
		}

		const body = await request.json();
		const parsed = updateCourseSchema.safeParse(body);
		if (!parsed.success) return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });

		const updated = await prisma.course.update({ where: { id }, data: parsed.data });
		return NextResponse.json({ success: true, message: 'Course updated', data: updated }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('PUT /api/courses/:id error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		const role = session.user.role as Role;
		if (role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

		await prisma.course.delete({ where: { id } });
		return NextResponse.json({ success: true, message: 'Course deleted' }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('DELETE /api/courses/:id error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
