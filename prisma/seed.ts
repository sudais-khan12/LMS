import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Local enum-like string unions to avoid relying on generated Prisma enums
type RoleEnum = 'ADMIN' | 'TEACHER' | 'STUDENT';
type AttendanceStatusEnum = 'PRESENT' | 'ABSENT' | 'LATE';
type LeaveStatusEnum = 'PENDING' | 'APPROVED' | 'REJECTED';

const prisma = new PrismaClient();

async function main(): Promise<void> {
	// Clear existing data for idempotent seed in dev
	await prisma.submission.deleteMany();
	await prisma.assignment.deleteMany();
	await prisma.attendance.deleteMany();
	await prisma.report.deleteMany();
	await prisma.notification.deleteMany();
	await prisma.leaveRequest.deleteMany();
	await prisma.course.deleteMany();
	await prisma.teacher.deleteMany();
	await prisma.student.deleteMany();
	await prisma.user.deleteMany();

	// Hash passwords
	const adminPasswordHash = await bcrypt.hash('adminpassword', 10);
	const teacherPasswordHash = await bcrypt.hash('teacherpassword', 10);
	const studentPasswordHash = await bcrypt.hash('studentpassword', 10);

	const admin = await prisma.user.create({
		data: {
			name: 'Admin User',
			email: 'admin@example.com',
			password: adminPasswordHash,
			role: 'ADMIN' as RoleEnum,
		},
	});

	const teacherUser = await prisma.user.create({
		data: {
			name: 'John Doe',
			email: 'teacher@example.com',
			password: teacherPasswordHash,
			role: 'TEACHER' as RoleEnum,
			teacher: {
				create: {
					specialization: 'Computer Science',
					contact: '+1-555-0001',
				},
			},
		},
		include: { teacher: true },
	});

	if (!teacherUser.teacher) {
		throw new Error('Teacher profile creation failed');
	}

	const courseA = await prisma.course.create({
		data: {
			title: 'Algorithms',
			code: 'CS101',
			description: 'Introduction to algorithms and data structures',
			teacherId: teacherUser.teacher.id,
		},
	});

	const courseB = await prisma.course.create({
		data: {
			title: 'Databases',
			code: 'CS102',
			description: 'Relational databases and SQL',
			teacherId: teacherUser.teacher.id,
		},
	});

	const studentUser = await prisma.user.create({
		data: {
			name: 'Jane Smith',
			email: 'student@example.com',
			password: studentPasswordHash,
			role: 'STUDENT' as RoleEnum,
			student: {
				create: {
					enrollmentNo: 'ENR-2025-0001',
					semester: 1,
					section: 'A',
				},
			},
		},
		include: { student: true },
	});

	if (!studentUser.student) {
		throw new Error('Student profile creation failed');
	}

	const studentId = studentUser.student.id;

	// Assignments for both courses
	const [assnA1, assnB1] = await Promise.all([
		prisma.assignment.create({
			data: {
				title: 'Sorting Assignment',
				description: 'Implement and analyze sorting algorithms',
				dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				courseId: courseA.id,
			},
		}),
		prisma.assignment.create({
			data: {
				title: 'SQL Queries',
				description: 'Write SQL queries for sample schema',
				dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
				courseId: courseB.id,
			},
		}),
	]);

	// Submissions by the student
	await prisma.submission.createMany({
		data: [
			{
				assignmentId: assnA1.id,
				studentId,
				fileUrl: 'https://files.example.com/submissions/sorting.pdf',
				grade: 88.5,
			},
			{
				assignmentId: assnB1.id,
				studentId,
				fileUrl: 'https://files.example.com/submissions/sql.pdf',
				grade: 92.0,
			},
		],
	});

	// Attendance records over last 5 days for both courses
	const days = [0, 1, 2, 3, 4];
	const today = new Date();
	const attendanceData = days.flatMap((d) => {
		const date = new Date(today);
		date.setDate(today.getDate() - d);
		const status: AttendanceStatusEnum = d % 4 === 0
			? 'PRESENT'
			: d % 4 === 1
			? 'LATE'
			: d % 4 === 2
			? 'ABSENT'
			: 'PRESENT';
		return [
			{ studentId, courseId: courseA.id, date, status },
			{ studentId, courseId: courseB.id, date, status },
		];
	});

	await prisma.attendance.createMany({ data: attendanceData as any });

	// Report and LeaveRequest
	await prisma.report.create({
		data: {
			studentId,
			gpa: 3.7,
			semester: 1,
			remarks: 'Strong performance with consistent attendance',
		},
	});

	// Leave Request - using new schema
	const fromDate = new Date();
	fromDate.setDate(fromDate.getDate() + 7);
	const toDate = new Date(fromDate);
	toDate.setDate(toDate.getDate() + 2);

	const leaveRequest = await prisma.leaveRequest.create({
		data: {
			requesterId: studentUser.id,
			studentId,
			type: 'SICK',
			fromDate,
			toDate,
			reason: 'Medical appointment scheduled for checkup',
			status: 'PENDING' as LeaveStatusEnum,
		},
	});

	// Notifications
	await prisma.notification.createMany({
		data: [
			{
				userId: admin.id,
				title: 'New Leave Request',
				body: `${studentUser.name} has submitted a leave request (SICK)`,
				link: `/admin/leaves/${leaveRequest.id}`,
				category: 'leave',
				isRead: false,
				data: {
					leaveRequestId: leaveRequest.id,
					requesterId: studentUser.id,
					requesterName: studentUser.name,
				},
			},
			{
				userId: studentUser.id,
				title: 'Welcome to LMS',
				body: 'Your account has been created. Explore the platform to get started!',
				link: '/student/dashboard',
				category: 'system',
				isRead: false,
				data: {
					type: 'welcome',
				},
			},
		],
	});

	// eslint-disable-next-line no-console
	console.log('Seed completed:');
	console.log('- Admin:', { email: admin.email, password: 'adminpassword' });
	console.log('- Teacher:', { email: teacherUser.email, password: 'teacherpassword' });
	console.log('- Student:', { email: studentUser.email, password: 'studentpassword' });
	console.log('- Leave Request created:', leaveRequest.id);
	console.log('- Notifications created for admin and student');
}

main()
	.catch((error) => {
		// eslint-disable-next-line no-console
		console.error('Seeding error:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});


