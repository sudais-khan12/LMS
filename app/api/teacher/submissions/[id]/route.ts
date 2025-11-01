import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';
import { gradeSubmissionSchema } from '@/lib/validation/submission';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    // Verify ownership via assignment -> course
    const existing = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: {
            course: {
              include: { teacher: { select: { id: true } } },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(apiError('Submission not found'), { status: 404 });
    }

    if (existing.assignment.course.teacher?.id !== teacherAuth.teacher.id) {
      return NextResponse.json(apiError('Forbidden: You can only grade submissions for your assignments'), { status: 403 });
    }

    const json = await request.json();
    const parsed = gradeSubmissionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(apiError('Validation error', parsed.error.issues), { status: 400 });
    }

    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: {
        grade: parsed.data.grade ?? undefined,
      },
      include: {
        assignment: {
          include: {
            course: { select: { id: true, title: true, code: true } },
          },
        },
        student: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    // Notify student when assignment is graded
    if (updated.grade !== null && parsed.data.grade !== null) {
      await prisma.notification.create({
        data: {
          userId: updated.student.user.id,
          title: 'Assignment Graded',
          body: `Your submission for "${updated.assignment.title}" has been graded: ${parsed.data.grade}/100`,
          link: `/student/assignments/${updated.assignmentId}`,
          category: 'assignment',
          data: {
            assignmentId: updated.assignmentId,
            assignmentTitle: updated.assignment.title,
            grade: parsed.data.grade,
            courseId: updated.assignment.course.id,
          },
        },
      });
    }

    return NextResponse.json(apiSuccess(updated), { status: 200 });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(apiError('Submission not found'), { status: 404 });
    }
    console.error('PATCH /api/teacher/submissions/:id error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

