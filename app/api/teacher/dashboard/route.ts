import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api/response';
import { requireTeacher } from '@/lib/api/teacherAuth';

export async function GET(_request: NextRequest) {
  const teacherAuth = await requireTeacher();
  if (!teacherAuth.ok) return teacherAuth.response;

  try {
    const teacherId = teacherAuth.teacher.id;

    // Get teacher's courses
    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            attendance: true,
            assignments: true,
          },
        },
      },
    });

    // Get unique students across all courses
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        course: { teacherId },
      },
      select: { studentId: true },
    });
    const uniqueStudents = new Set(attendanceRecords.map((a) => a.studentId)).size;

    // Get total assignments
    const totalAssignments = await prisma.assignment.count({
      where: { course: { teacherId } },
    });

    // Get attendance statistics
    const allAttendance = await prisma.attendance.findMany({
      where: { course: { teacherId } },
      select: { status: true },
    });
    const totalAttendanceRecords = allAttendance.length;
    const presentCount = allAttendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = totalAttendanceRecords > 0
      ? Math.round((presentCount / totalAttendanceRecords) * 100)
      : 0;

    // Get upcoming assignments (next 7 days) - assignments with due dates
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        course: { teacherId },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // Calculate attendance trend (monthly data for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const attendanceByMonth = await prisma.attendance.findMany({
      where: {
        course: { teacherId },
        date: { gte: sixMonthsAgo },
      },
      select: {
        date: true,
        status: true,
      },
    });

    // Group by month and calculate attendance percentage
    const monthlyAttendance: Record<string, { total: number; present: number }> = {};
    attendanceByMonth.forEach((record) => {
      const monthKey = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyAttendance[monthKey]) {
        monthlyAttendance[monthKey] = { total: 0, present: 0 };
      }
      monthlyAttendance[monthKey].total++;
      if (record.status === 'PRESENT') {
        monthlyAttendance[monthKey].present++;
      }
    });

    // Convert to array format for charts (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const attendanceTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthData = monthlyAttendance[monthKey] || { total: 0, present: 0 };
      const attendance = monthData.total > 0 
        ? Math.round((monthData.present / monthData.total) * 100)
        : 0;
      return {
        month: monthNames[date.getMonth()],
        users: attendance,
      };
    });

    // Get student performance data (top students by average grade)
    const submissions = await prisma.submission.findMany({
      where: {
        assignment: {
          course: { teacherId },
        },
        grade: { not: null },
      },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Calculate average grade per student
    const studentGrades: Record<string, { name: string; grades: number[] }> = {};
    submissions.forEach((submission) => {
      const studentId = submission.student.user.id;
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          name: submission.student.user.name,
          grades: [],
        };
      }
      if (submission.grade !== null) {
        studentGrades[studentId].grades.push(submission.grade);
      }
    });

    // Convert to array and calculate averages (top 5)
    const studentPerformance = Object.entries(studentGrades)
      .map(([_, data]) => ({
        course: data.name,
        enrollments: 1, // Student count per course (simplified)
        completions: data.grades.length,
        progress: data.grades.length > 0
          ? Math.round(data.grades.reduce((a, b) => a + b, 0) / data.grades.length)
          : 0,
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    // Get recent activities (submissions, attendance marked, assignments created)
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        assignment: {
          course: { teacherId },
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
        assignment: {
          include: {
            course: {
              select: { id: true, title: true, code: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    });

    // Get recent assignments created (order by id descending for newest)
    const recentAssignments = await prisma.assignment.findMany({
      where: { course: { teacherId } },
      include: {
        course: {
          select: { id: true, title: true, code: true },
        },
      },
      orderBy: { id: 'desc' }, // Order by id descending (newest CUIDs first)
      take: 5,
    });

    // Combine and format recent activities
    const recentActivities = [
      ...recentSubmissions.map((s) => ({
        id: s.id,
        type: 'assignment_submitted' as const,
        message: `${s.student.user.name} submitted ${s.assignment.title}`,
        timestamp: s.submittedAt.toISOString(),
        icon: 'FileText' as const,
      })),
      ...recentAssignments.map((a) => ({
        id: a.id,
        type: 'assignment_created' as const,
        message: `New assignment created: ${a.title}`,
        timestamp: a.dueDate.toISOString(), // Use dueDate as timestamp since no createdAt
        icon: 'FileText' as const,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Format upcoming classes from courses (simplified - using courses as "classes")
    const upcomingClasses = courses.slice(0, 5).map((course, index) => {
      // Get unique students for this course
      const courseAttendance = attendanceRecords.filter(
        (a) => courses.find((c) => c.id === a.courseId)?.id === course.id
      );
      const courseStudentCount = new Set(courseAttendance.map((a) => a.studentId)).size;
      
      return {
        id: course.id,
        subject: course.title,
        time: '09:00 AM', // Placeholder - would need schedule data
        date: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 'Upcoming',
        students: courseStudentCount,
        room: 'Room 101', // Placeholder - would need room data
      };
    });

    return NextResponse.json(
      apiSuccess({
        stats: {
          totalClasses: courses.length,
          activeStudents: uniqueStudents,
          assignmentsGiven: totalAssignments,
          attendanceRate,
        },
        attendanceTrend,
        studentPerformance,
        upcomingClasses,
        recentActivities,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/teacher/dashboard error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

