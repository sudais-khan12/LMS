import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';
import { updateSubmissionSchema } from '@/lib/validation/submission';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: true },
    });

    if (!submission) return NextResponse.json(apiError('Submission not found'), { status: 404 });
    if (submission.studentId !== studentAuth.student.id) return NextResponse.json(apiError('Forbidden'), { status: 403 });

    // Check due date
    const now = new Date();
    if (submission.assignment.dueDate < now) {
      return NextResponse.json(apiError('Submission deadline has passed'), { status: 400 });
    }

    const json = await request.json();
    const parsed = updateSubmissionSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });

    if (!parsed.data.fileUrl && !parsed.data.content) {
      return NextResponse.json(apiError('Provide fileUrl or content'), { status: 400 });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        fileUrl: parsed.data.fileUrl ?? submission.fileUrl,
      },
    });

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error) {
    console.error('PATCH /api/student/submissions/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { assignment: true },
    });

    if (!submission) return NextResponse.json(apiError('Submission not found'), { status: 404 });
    if (submission.studentId !== studentAuth.student.id) return NextResponse.json(apiError('Forbidden'), { status: 403 });

    // Check due date - allow deletion even if past due date for now
    // Students might want to remove incorrect submissions
    const now = new Date();
    if (submission.assignment.dueDate < now) {
      return NextResponse.json(apiError('Cannot delete submission after deadline'), { status: 400 });
    }

    await prisma.submission.delete({
      where: { id },
    });

    return NextResponse.json(apiSuccess({ message: 'Submission deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('DELETE /api/student/submissions/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}
