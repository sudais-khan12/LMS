import {
  PrismaClient,
  Role,
  AttendanceStatus,
  LeaveStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1️⃣ Clear existing data (order matters)
  await prisma.notification.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.course.deleteMany();
  await prisma.report.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // 2️⃣ Create admin
  const adminPassword = await bcrypt.hash("adminpassword", 10);
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // 3️⃣ Create teachers (Users + Teacher profile)
  const teacherPassword = await bcrypt.hash("teacherpassword", 10);

  const teacherUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: "John Doe",
        email: "teacher@example.com",
        password: teacherPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            specialization: "Web Development",
            contact: "0300-1111111",
          },
        },
      },
      include: { teacher: true },
    }),
    prisma.user.create({
      data: {
        name: "Sarah Lee",
        email: "teacher1@example.com",
        password: teacherPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            specialization: "Databases",
            contact: "0300-2222222",
          },
        },
      },
      include: { teacher: true },
    }),
    prisma.user.create({
      data: {
        name: "Jane Smith",
        email: "teacher2@example.com",
        password: teacherPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            specialization: "Computer Science",
            contact: "0300-3333333",
          },
        },
      },
      include: { teacher: true },
    }),
  ]);

  // 4️⃣ Create students (Users + Student profile)
  const studentPassword = await bcrypt.hash("studentpassword", 10);

  // Create the specific student@example.com account first (for testing)
  const mainStudent = await prisma.user.create({
    data: {
      name: "Student User",
      email: "student@example.com",
      password: studentPassword,
      role: Role.STUDENT,
      student: {
        create: {
          enrollmentNo: "ENR0001",
          semester: 1,
          section: "A",
        },
      },
    },
    include: { student: true },
  });

  const studentUsers = [mainStudent];

  // Create additional students
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: studentPassword,
        role: Role.STUDENT,
        student: {
          create: {
            enrollmentNo: `ENR00${i + 1}`,
            semester: (i % 8) + 1,
            section: i % 2 === 0 ? "A" : "B",
          },
        },
      },
      include: { student: true },
    });
    studentUsers.push(user);
  }

  // 5️⃣ Create Courses (referencing teacher IDs)
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: "Web Development",
        code: "WD101",
        description: "Learn HTML, CSS, JS, and modern web frameworks",
        teacherId: teacherUsers[0].teacher!.id,
      },
    }),
    prisma.course.create({
      data: {
        title: "Database Systems",
        code: "DB201",
        description: "SQL, relational design, and Prisma ORM",
        teacherId: teacherUsers[1].teacher!.id,
      },
    }),
  ]);

  // 6️⃣ Create Attendance Records
  for (const student of studentUsers) {
    for (const course of courses) {
      await prisma.attendance.create({
        data: {
          studentId: student.student!.id,
          courseId: course.id,
          date: new Date(),
          status:
            Math.random() > 0.8
              ? AttendanceStatus.ABSENT
              : AttendanceStatus.PRESENT,
        },
      });
    }
  }

  // 7️⃣ Create Assignments
  for (const course of courses) {
    const assignment = await prisma.assignment.create({
      data: {
        title: `${course.title} Assignment 1`,
        description: `Complete your ${course.title} task.`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        courseId: course.id,
      },
    });

    // Submissions for first few students
    for (const student of studentUsers.slice(0, 5)) {
      await prisma.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId: student.student!.id,
          fileUrl: `https://example.com/submissions/${student.id}`,
          grade: Math.random() > 0.5 ? 85 + Math.random() * 10 : null,
        },
      });
    }
  }

  // 8️⃣ Create Reports
  for (const student of studentUsers) {
    await prisma.report.create({
      data: {
        studentId: student.student!.id,
        gpa: 2.5 + Math.random() * 1.5,
        semester: student.student!.semester,
        remarks: "Good academic standing",
      },
    });
  }

  // 9️⃣ Create Leave Requests
  for (const student of studentUsers.slice(0, 3)) {
    await prisma.leaveRequest.create({
      data: {
        requesterId: student.id,
        studentId: student.student!.id,
        type: "SICK",
        fromDate: new Date(),
        toDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        reason: "Flu and fever",
        status:
          Math.random() > 0.5 ? LeaveStatus.APPROVED : LeaveStatus.PENDING,
        approverId: admin.id,
      },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
