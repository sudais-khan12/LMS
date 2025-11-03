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
      email: "admin@lancerstech.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // 3️⃣ Create teachers (Users + Teacher profile)
  const teacherPassword = await bcrypt.hash("teacherpassword", 10);

  const teacherSpecializations = [
    "Web Development",
    "Database Systems",
    "Computer Science",
    "Data Structures",
    "Algorithms",
    "Software Engineering",
    "Machine Learning",
    "Network Security",
    "Operating Systems",
    "Mobile Development",
    "Cloud Computing",
    "DevOps",
    "UI/UX Design",
    "Game Development",
    "Cybersecurity",
    "Artificial Intelligence",
    "Blockchain",
    "Data Science",
    "Computer Networks",
    "System Design",
  ];

  const teacherNames = [
    "John Doe", "Sarah Lee", "Jane Smith", "Michael Chen", "Emily Johnson",
    "David Wilson", "Jessica Brown", "Robert Taylor", "Amanda Martinez", "Christopher Davis",
    "Michelle Anderson", "James Thomas", "Lisa Garcia", "Daniel Rodriguez", "Patricia Lewis",
    "Matthew Walker", "Jennifer Hall", "Kevin Young", "Ashley King", "Ryan Wright",
  ];

  const teacherUsers = [];
  
  // Create main test teacher
  const mainTeacher = await prisma.user.create({
    data: {
      name: teacherNames[0],
      email: "teacher@lancerstech.com",
      password: teacherPassword,
      role: Role.TEACHER,
      teacher: {
        create: {
          specialization: teacherSpecializations[0],
          contact: `0300-${String(1111111).padStart(7, "0")}`,
        },
      },
    },
    include: { teacher: true },
  });
  teacherUsers.push(mainTeacher);

  // Create 80 more teachers (total 81 including main teacher)
  for (let i = 1; i <= 80; i++) {
    const nameIndex = i % teacherNames.length;
    const user = await prisma.user.create({
      data: {
        name: teacherNames[nameIndex] || `Teacher ${i}`,
        email: `teacher${i}@lancerstech.com`,
        password: teacherPassword,
        role: Role.TEACHER,
        teacher: {
          create: {
            specialization: teacherSpecializations[i % teacherSpecializations.length],
            contact: `0300-${String(2000000 + i).padStart(7, "0")}`,
            isActive: Math.random() > 0.1, // 90% active
          },
        },
      },
      include: { teacher: true },
    });
    teacherUsers.push(user);
  }

  // 4️⃣ Create students (Users + Student profile)
  const studentPassword = await bcrypt.hash("studentpassword", 10);

  const firstNames = [
    "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery",
    "Cameron", "Quinn", "Dakota", "Skylar", "Parker", "Blake", "River",
    "Aiden", "Kai", "Phoenix", "Sage", "Rowan", "Charlie", "Finley", "Hayden",
    "Jamie", "Logan", "Mason", "Noah", "Olivia", "Sophia", "Emma", "Liam",
    "Ethan", "Mia", "Isabella", "Charlotte", "Harper", "Amelia", "Evelyn",
    "Abigail", "Emily", "Elizabeth", "Sofia", "Avery", "Ella", "Madison",
    "Scarlett", "Victoria", "Aria", "Grace", "Chloe", "Luna", "Penelope",
    "Layla", "Riley", "Zoey", "Nora", "Lily", "Eleanor", "Hannah", "Lillian",
    "Addison", "Aubrey", "Ellie", "Stella", "Natalie", "Zoe", "Leah", "Hazel",
    "Violet", "Aurora", "Savannah", "Audrey", "Brooklyn", "Bella", "Claire",
    "Skylar", "Lucy", "Paisley", "Everly", "Anna", "Caroline", "Nova",
    "Genesis", "Aaliyah", "Kennedy", "Kinsley", "Allison", "Maya", "Sarah",
    "Adeline", "Alexa", "Ariana", "Elena", "Gabriella", "Naomi", "Alice",
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres",
    "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall",
    "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips",
  ];

  const studentUsers = [];

  // Create main test student
  const mainStudent = await prisma.user.create({
    data: {
      name: "Student User",
      email: "student@lancerstech.com",
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
  studentUsers.push(mainStudent);

  // Create 500 students (total 501 including main student)
  for (let i = 1; i <= 500; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const semester = (i % 8) + 1; // Distribute across 8 semesters
    const sections = ["A", "B", "C", "D", "E"];
    const section = sections[Math.floor(Math.random() * sections.length)];

    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `student${i}@lancerstech.com`,
        password: studentPassword,
        role: Role.STUDENT,
        student: {
          create: {
            enrollmentNo: `ENR${String(i + 1).padStart(4, "0")}`,
            semester,
            section,
          },
        },
      },
      include: { student: true },
    });
    studentUsers.push(user);
  }

  console.log(`✅ Created ${studentUsers.length} students`);

  // 5️⃣ Create Courses (referencing teacher IDs)
  const courseTemplates = [
    { title: "Web Development", code: "WD101", desc: "Learn HTML, CSS, JS, and modern web frameworks" },
    { title: "Database Systems", code: "DB201", desc: "SQL, relational design, and Prisma ORM" },
    { title: "Data Structures", code: "DS301", desc: "Arrays, linked lists, trees, graphs, and algorithms" },
    { title: "Algorithms", code: "ALG401", desc: "Sorting, searching, dynamic programming, and complexity analysis" },
    { title: "Software Engineering", code: "SE301", desc: "Software design patterns, UML, and project management" },
    { title: "Machine Learning", code: "ML501", desc: "Neural networks, deep learning, and AI applications" },
    { title: "Network Security", code: "NS401", desc: "Cybersecurity principles, encryption, and network protocols" },
    { title: "Operating Systems", code: "OS401", desc: "Process management, memory management, and file systems" },
    { title: "Mobile Development", code: "MD301", desc: "iOS and Android app development" },
    { title: "Cloud Computing", code: "CC401", desc: "AWS, Azure, and cloud architecture" },
    { title: "DevOps", code: "DO401", desc: "CI/CD, Docker, Kubernetes, and infrastructure" },
    { title: "UI/UX Design", code: "UX201", desc: "User interface design and user experience principles" },
    { title: "Game Development", code: "GD301", desc: "Game engines, graphics, and game design" },
    { title: "Cybersecurity", code: "CS401", desc: "Ethical hacking, penetration testing, and security" },
    { title: "Artificial Intelligence", code: "AI501", desc: "AI algorithms, NLP, and computer vision" },
    { title: "Blockchain", code: "BC401", desc: "Cryptocurrency, smart contracts, and DApps" },
    { title: "Data Science", code: "DS401", desc: "Data analysis, visualization, and statistics" },
    { title: "Computer Networks", code: "CN301", desc: "TCP/IP, routing, switching, and network design" },
    { title: "System Design", code: "SD501", desc: "Scalable system architecture and design patterns" },
    { title: "Web Development Advanced", code: "WD302", desc: "Advanced React, Node.js, and full-stack development" },
    { title: "Database Advanced", code: "DB302", desc: "NoSQL, distributed databases, and optimization" },
    { title: "Computer Graphics", code: "CG401", desc: "3D rendering, shaders, and graphics programming" },
    { title: "Cryptography", code: "CRY401", desc: "Encryption algorithms, digital signatures, and security" },
    { title: "Internet of Things", code: "IoT301", desc: "IoT devices, sensors, and embedded systems" },
    { title: "Quantum Computing", code: "QC501", desc: "Quantum algorithms and quantum mechanics" },
    { title: "Natural Language Processing", code: "NLP401", desc: "Text processing, sentiment analysis, and chatbots" },
    { title: "Computer Vision", code: "CV401", desc: "Image processing, object detection, and recognition" },
    { title: "Robotics", code: "ROB401", desc: "Robot programming, sensors, and automation" },
    { title: "Digital Forensics", code: "DF401", desc: "Cybercrime investigation and evidence collection" },
    { title: "Ethical Hacking", code: "EH401", desc: "Penetration testing and vulnerability assessment" },
  ];

  const courses = [];
  
  // Create courses and assign them to teachers
  for (let i = 0; i < courseTemplates.length; i++) {
    const template = courseTemplates[i];
    const teacher = teacherUsers[i % teacherUsers.length];
    
    const course = await prisma.course.create({
      data: {
        title: template.title,
        code: template.code,
        description: template.desc,
        teacherId: teacher.teacher!.id,
      },
    });
    courses.push(course);
  }

  // Create additional courses (variations with different codes) - total 150 courses
  for (let i = courseTemplates.length; i < 150; i++) {
    const baseTemplate = courseTemplates[i % courseTemplates.length];
    const teacher = teacherUsers[i % teacherUsers.length];
    const level = ["101", "201", "301", "401", "501"][Math.floor(Math.random() * 5)];
    const variant = i > 100 ? ` (Section ${String.fromCharCode(65 + (i % 4))})` : ""; // Add sections for courses > 100
    
    // Ensure unique code by adding iteration number
    const baseCode = baseTemplate.code.slice(0, 2);
    const sectionSuffix = i > 100 ? String.fromCharCode(65 + (i % 4)) : "";
    const uniqueCode = `${baseCode}${level}${sectionSuffix}-${i}`;
    
    const course = await prisma.course.create({
      data: {
        title: `${baseTemplate.title} ${level}${variant}`,
        code: uniqueCode,
        description: `${baseTemplate.desc} - Level ${level}${variant}`,
        teacherId: teacher.teacher!.id,
      },
    });
    courses.push(course);
  }

  console.log(`✅ Created ${courses.length} courses`);

  // 6️⃣ Create Attendance Records (for last 60 days per student per course)
  console.log("📅 Creating attendance records...");
  const attendanceStatuses = [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE];
  const statusWeights = [0.75, 0.15, 0.10]; // 75% present, 15% absent, 10% late

  let attendanceCount = 0;
  const batchSize = 50; // Process students in batches

  for (let batch = 0; batch < studentUsers.length; batch += batchSize) {
    const batchStudents = studentUsers.slice(batch, batch + batchSize);
    
    for (const student of batchStudents) {
      // Each student is enrolled in 4-8 random courses
      const enrolledCourses = courses
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 5) + 4); // 4-8 courses

      for (const course of enrolledCourses) {
        // Create attendance for last 60 days
        const daysBack = Math.min(60, Math.floor(Math.random() * 30) + 30);
        
        for (let day = 0; day < daysBack; day++) {
          // Skip weekends (Saturday = 6, Sunday = 0)
          const date = new Date();
          date.setDate(date.getDate() - day);
          const dayOfWeek = date.getDay();
          
          if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

          // Random status based on weights
          const rand = Math.random();
          let status: AttendanceStatus = AttendanceStatus.PRESENT;
          if (rand < statusWeights[0]) {
            status = AttendanceStatus.PRESENT;
          } else if (rand < statusWeights[0] + statusWeights[1]) {
            status = AttendanceStatus.ABSENT;
          } else {
            status = AttendanceStatus.LATE;
          }

          try {
            await prisma.attendance.create({
              data: {
                studentId: student.student!.id,
                courseId: course.id,
                date: date,
                status: status,
              },
            });
            attendanceCount++;
          } catch (error) {
            // Ignore duplicate key errors (unique constraint)
            if ((error as any).code !== "P2002") {
              throw error;
            }
          }
        }
      }
    }
    if (batch % (batchSize * 2) === 0) {
      console.log(`   Processed ${Math.min(batch + batchSize, studentUsers.length)}/${studentUsers.length} students...`);
    }
  }

  console.log(`✅ Created ${attendanceCount} attendance records`);

  // 7️⃣ Create Assignments (multiple per course)
  console.log("📝 Creating assignments...");
  const assignments = [];

  for (const course of courses) {
    // Create 5-12 assignments per course (more for larger dataset)
    const assignmentCount = Math.floor(Math.random() * 8) + 5;

    for (let i = 1; i <= assignmentCount; i++) {
      const daysFromNow = Math.floor(Math.random() * 90) - 45; // -45 to +45 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysFromNow);

      const assignmentTitles = [
        "Lab Assignment",
        "Project",
        "Quiz",
        "Homework",
        "Final Project",
        "Midterm Exam",
        "Practical Work",
        "Research Paper",
        "Case Study",
        "Presentation",
        "Group Project",
        "Individual Assignment",
        "Weekly Assignment",
        "Programming Exercise",
        "Written Exam",
      ];

      const title = `${assignmentTitles[i % assignmentTitles.length]} ${Math.floor(i / assignmentTitles.length) + 1 || 1}`;
      
      const assignment = await prisma.assignment.create({
        data: {
          title: `${course.title} - ${title}`,
          description: `Complete the ${title.toLowerCase()} for ${course.title}. This assignment covers important concepts from the course material.`,
          dueDate: dueDate,
          courseId: course.id,
        },
      });
      assignments.push(assignment);
    }
  }

  console.log(`✅ Created ${assignments.length} assignments`);

  // 8️⃣ Create Submissions (for enrolled students)
  console.log("📤 Creating submissions...");
  let submissionCount = 0;

  for (const assignment of assignments) {
    // Get students enrolled in this course (have attendance records)
    const courseAttendance = await prisma.attendance.findMany({
      where: { courseId: assignment.courseId },
      select: { studentId: true },
      distinct: ["studentId"],
    });

    const enrolledStudentIds = courseAttendance.map((a) => a.studentId);
    
    if (enrolledStudentIds.length === 0) continue;
    
    // 60-90% of students submit the assignment
    const submissionRate = 0.6 + Math.random() * 0.3;
    const studentsToSubmit = Math.floor(enrolledStudentIds.length * submissionRate);

    // Shuffle and take unique students
    const shuffledStudents = [...enrolledStudentIds].sort(() => Math.random() - 0.5);
    const studentsToProcess = shuffledStudents.slice(0, Math.min(studentsToSubmit, shuffledStudents.length));

    for (const studentId of studentsToProcess) {
      // Check if already submitted
      const existing = await prisma.submission.findUnique({
        where: {
          assignmentId_studentId: {
            assignmentId: assignment.id,
            studentId: studentId,
          },
        },
      });

      if (existing) continue;

      const isGraded = Math.random() > 0.25; // 75% are graded
      // Grade distribution: 60% get 70-100, 30% get 60-69, 10% get below 60
      let grade: number | null = null;
      if (isGraded) {
        const rand = Math.random();
        if (rand < 0.6) {
          grade = Math.floor(Math.random() * 31) + 70; // 70-100
        } else if (rand < 0.9) {
          grade = Math.floor(Math.random() * 10) + 60; // 60-69
        } else {
          grade = Math.floor(Math.random() * 20) + 40; // 40-59
        }
      }
      
      const submittedDate = new Date(assignment.dueDate);
      // Some submissions are late (10-20% chance)
      const isLate = Math.random() < 0.15;
      if (isLate) {
        submittedDate.setDate(submittedDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days late
      } else {
        submittedDate.setDate(submittedDate.getDate() - Math.floor(Math.random() * 10)); // 0-10 days before due
      }

      // Get student user ID for fileUrl
      const student = studentUsers.find((s) => s.student?.id === studentId);

      try {
        await prisma.submission.create({
          data: {
            assignmentId: assignment.id,
            studentId: studentId,
            fileUrl: `https://lancerstech.com/submissions/${student?.id || studentId}/${assignment.id}`,
            grade: grade,
            submittedAt: submittedDate,
          },
        });
        submissionCount++;
      } catch (error) {
        // Ignore duplicate key errors
        if ((error as any).code !== "P2002") {
          throw error;
        }
      }
    }
  }

  console.log(`✅ Created ${submissionCount} submissions`);

  // 9️⃣ Create Reports (multiple semesters per student)
  console.log("📊 Creating reports...");
  
  for (const student of studentUsers) {
    const currentSemester = student.student!.semester;
    
    // Create reports for each completed semester (1 to current)
    for (let sem = 1; sem <= currentSemester; sem++) {
      // Calculate GPA based on performance (2.0 to 4.0)
      const baseGpa = 2.5 + Math.random() * 1.5;
      
      const remarks = [
        "Good academic standing",
        "Excellent performance",
        "Satisfactory progress",
        "Needs improvement",
        "Outstanding work",
        "Maintaining good grades",
        "Above average performance",
      ];

      await prisma.report.create({
        data: {
          studentId: student.student!.id,
          gpa: Number(baseGpa.toFixed(2)),
          semester: sem,
          remarks: remarks[Math.floor(Math.random() * remarks.length)],
        },
      });
    }
  }

  console.log("✅ Created reports");

  // 🔟 Create Leave Requests
  console.log("📋 Creating leave requests...");
  const leaveTypes = ["SICK", "PERSONAL", "EXAM", "FAMILY", "MEDICAL"];
  const leaveReasons = [
    "Flu and fever",
    "Family emergency",
    "Medical appointment",
    "Personal matter",
    "Exam preparation",
    "Family wedding",
    "Health issues",
    "Bereavement",
  ];

  // Create leave requests for 100-200 students (20-40% of students)
  const leaveRequestCount = Math.floor(Math.random() * 101) + 100;
  const studentsWithLeaves = studentUsers
    .sort(() => Math.random() - 0.5)
    .slice(0, leaveRequestCount);

  // Some students may have multiple leave requests
  const leavesPerStudent = Math.floor(leaveRequestCount / studentsWithLeaves.length);
  const extraLeaves = leaveRequestCount % studentsWithLeaves.length;
  
  for (let idx = 0; idx < studentsWithLeaves.length; idx++) {
    const student = studentsWithLeaves[idx];
    const numLeaves = leavesPerStudent + (idx < extraLeaves ? 1 : 0);
    
    for (let leaveNum = 0; leaveNum < numLeaves; leaveNum++) {
      const leaveDays = Math.floor(Math.random() * 7) + 1; // 1-7 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Math.floor(Math.random() * 60) - leaveNum * 30); // Stagger across last 60-90 days
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + leaveDays);

      const statusRandom = Math.random();
      let status: LeaveStatus = LeaveStatus.PENDING;
      let approverId: string | null = null;
      
      if (statusRandom > 0.35) {
        status = LeaveStatus.APPROVED;
        approverId = admin.id;
      } else if (statusRandom > 0.15) {
        status = LeaveStatus.REJECTED;
        approverId = admin.id;
      }

      await prisma.leaveRequest.create({
        data: {
          requesterId: student.id,
          studentId: student.student!.id,
          type: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
          fromDate: fromDate,
          toDate: toDate,
          reason: leaveReasons[Math.floor(Math.random() * leaveReasons.length)],
          status: status,
          approverId: approverId,
        },
      });
    }
  }

  const leaveRequestsCount = await prisma.leaveRequest.count();
  console.log(`✅ Created ${leaveRequestsCount} leave requests`);

  // 1️⃣1️⃣ Create Notifications
  console.log("🔔 Creating notifications...");
  
  const notificationTemplates = [
    {
      title: "New Assignment Posted",
      category: "assignment",
      body: "A new assignment has been posted in your course.",
    },
    {
      title: "Assignment Graded",
      category: "assignment",
      body: "Your submission has been graded. Check your results.",
    },
    {
      title: "Leave Request Status",
      category: "leave",
      body: "Your leave request status has been updated.",
    },
    {
      title: "Attendance Reminder",
      category: "attendance",
      body: "Don't forget to attend your classes today.",
    },
    {
      title: "Report Available",
      category: "report",
      body: "Your semester report is now available.",
    },
    {
      title: "Course Announcement",
      category: "system",
      body: "Important announcement from your instructor.",
    },
  ];

  // Create notifications for random students and teachers
  const notificationCount = Math.floor(Math.random() * 500) + 300; // 300-800 notifications
  
  for (let i = 0; i < notificationCount; i++) {
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    const allUsers = [...studentUsers, ...teacherUsers, admin];
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: template.title,
        body: template.body,
        link: `/dashboard`,
        category: template.category,
        isRead: Math.random() > 0.5, // 50% read
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time in last 7 days
      },
    });
  }

  console.log(`✅ Created ${notificationCount} notifications`);

  // 📊 Summary
  const totalUsers = 1 + teacherUsers.length + studentUsers.length;
  const totalAttendance = await prisma.attendance.count();
  const totalSubmissions = await prisma.submission.count();
  const totalReports = await prisma.report.count();
  const totalLeaveRequests = await prisma.leaveRequest.count();
  const totalNotifications = await prisma.notification.count();

  console.log("\n📊 Seeding Summary:");
  console.log(`   👥 Users: ${totalUsers} (1 admin, ${teacherUsers.length} teachers, ${studentUsers.length} students)`);
  console.log(`   📚 Courses: ${courses.length}`);
  console.log(`   📝 Assignments: ${assignments.length}`);
  console.log(`   📅 Attendance Records: ${totalAttendance}`);
  console.log(`   📤 Submissions: ${totalSubmissions}`);
  console.log(`   📊 Reports: ${totalReports}`);
  console.log(`   📋 Leave Requests: ${totalLeaveRequests}`);
  console.log(`   🔔 Notifications: ${totalNotifications}`);
  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
