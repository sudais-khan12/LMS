import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all submissions with grades
    const submissions = await prisma.submission.findMany({
      where: {
        grade: { not: null },
      },
      include: {
        assignment: {
          include: {
            course: {
              select: { id: true, title: true, code: true },
            },
          },
        },
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Group by course
    const courseMap = new Map<
      string,
      {
        course: any;
        grades: number[];
        students: Set<string>;
      }
    >();

    submissions.forEach((submission) => {
      const courseId = submission.assignment.courseId;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: submission.assignment.course,
          grades: [],
          students: new Set(),
        });
      }
      const courseData = courseMap.get(courseId)!;
      if (submission.grade !== null) {
        courseData.grades.push(submission.grade);
        courseData.students.add(submission.studentId);
      }
    });

    // Calculate grade distribution per course
    const courseGradeDistribution = Array.from(courseMap.entries()).map(([courseId, data]) => {
      const grades = data.grades;
      const avgGrade = grades.length > 0 ? grades.reduce((acc, g) => acc + g, 0) / grades.length : 0;

      // Grade ranges: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)
      const distribution = {
        A: grades.filter((g) => g >= 90 && g <= 100).length,
        B: grades.filter((g) => g >= 80 && g < 90).length,
        C: grades.filter((g) => g >= 70 && g < 80).length,
        D: grades.filter((g) => g >= 60 && g < 70).length,
        F: grades.filter((g) => g < 60).length,
      };

      return {
        courseId: data.course.id,
        courseName: data.course.title,
        courseCode: data.course.code,
        totalSubmissions: grades.length,
        uniqueStudents: data.students.size,
        averageGrade: Math.round(avgGrade * 100) / 100,
        distribution,
      };
    });

    // Overall grade distribution
    const allGrades = submissions.map((s) => s.grade!).filter((g) => g !== null);
    const overallDistribution = {
      A: allGrades.filter((g) => g >= 90 && g <= 100).length,
      B: allGrades.filter((g) => g >= 80 && g < 90).length,
      C: allGrades.filter((g) => g >= 70 && g < 80).length,
      D: allGrades.filter((g) => g >= 60 && g < 70).length,
      F: allGrades.filter((g) => g < 60).length,
    };

    const overallAverage =
      allGrades.length > 0 ? allGrades.reduce((acc, g) => acc + g, 0) / allGrades.length : 0;

    return NextResponse.json(
      {
        success: true,
        message: 'Admin grades report fetched successfully',
        data: {
          overall: {
            totalSubmissions: allGrades.length,
            averageGrade: Math.round(overallAverage * 100) / 100,
            distribution: overallDistribution,
          },
          byCourse: courseGradeDistribution,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/reports/admin/grades error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

