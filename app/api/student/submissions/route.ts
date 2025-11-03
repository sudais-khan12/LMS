import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireStudent } from '@/lib/api/studentAuth';
import { createSubmissionSchema } from '@/lib/validation/submission';

export async function POST(request: NextRequest) {
  const studentAuth = await requireStudent();
  if (!studentAuth.ok) return studentAuth.response;

  try {
    const json = await request.json();
    const parsed = createSubmissionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    // Verify assignment belongs to student's courses
    const assignment = await prisma.assignment.findUnique({
      where: { id: parsed.data.assignmentId },
      include: { course: true },
    });
    if (!assignment) return NextResponse.json(apiError('Assignment not found'), { status: 404 });

    const isEnrolled = await prisma.attendance.findFirst({
      where: { studentId: studentAuth.student.id, courseId: assignment.courseId },
    });
    if (!isEnrolled) return NextResponse.json(apiError('Forbidden: Not enrolled in course'), { status: 403 });

    // Check due date
    const now = new Date();
    if (assignment.dueDate < now) {
      return NextResponse.json(apiError('Submission deadline has passed'), { status: 400 });
    }

    // Prevent duplicate
    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: studentAuth.student.id } },
    });
    if (existing) return NextResponse.json(apiError('Submission already exists'), { status: 409 });

    if (!parsed.data.fileUrl && !parsed.data.content) {
      return NextResponse.json(apiError('Provide fileUrl or content'), { status: 400 });
    }

    const created = await prisma.submission.create({
      data: {
        assignmentId: assignment.id,
        studentId: studentAuth.student.id,
        fileUrl: parsed.data.fileUrl ?? '',
        // Storing content in fileUrl alternative column is not ideal; assuming fileUrl or text content is handled client-side storage
        // If text content needs storage, extend schema to include a separate column.
      },
    });

    return NextResponse.json(apiSuccess(created), { status: 201 });
  } catch (error) {
    console.error('POST /api/student/submissions error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}


