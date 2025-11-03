import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { z } from 'zod';

const updateAssignmentSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
	dueDate: z.string().transform((v) => new Date(v)).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const assignment = await prisma.assignment.findUnique({ where: { id }, include: { course: true } });
		if (!assignment) return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 });
		return NextResponse.json({ success: true, message: 'Assignment fetched', data: assignment }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('GET /api/assignments/:id error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const session = await auth();
		if (!session || !session.user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
		const role = session.user.role as Role;

		const assignment = await prisma.assignment.findUnique({ where: { id }, include: { course: true } });
		if (!assignment) return NextResponse.json({ success: false, message: 'Assignment not found' }, { status: 404 });

		if (role !== 'ADMIN') {
			const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
			if (!teacher || assignment.course?.teacherId !== teacher.id) {
				return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
			}
		}

		const body = await request.json();
		const parsed = updateAssignmentSchema.safeParse(body);
		if (!parsed.success) return NextResponse.json({ success: false, message: 'Validation error', data: parsed.error.issues }, { status: 400 });

		const updated = await prisma.assignment.update({ where: { id }, data: parsed.data });
		return NextResponse.json({ success: true, message: 'Assignment updated', data: updated }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('PUT /api/assignments/:id error:', error);
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

		await prisma.assignment.delete({ where: { id } });
		return NextResponse.json({ success: true, message: 'Assignment deleted' }, { status: 200 });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('DELETE /api/assignments/:id error:', error);
		return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
	}
}
