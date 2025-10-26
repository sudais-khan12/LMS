import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  Settings,
  LogOut,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Teacher navigation menu items
export const teacherNavigationItems = [
  {
    title: "Dashboard",
    href: "/teacher",
    icon: LayoutDashboard,
    active: true,
  },
  {
    title: "My Classes",
    href: "/teacher/classes",
    icon: BookOpen,
    active: false,
  },
  {
    title: "Attendance",
    href: "/teacher/attendance",
    icon: Users,
    active: false,
  },
  {
    title: "Assignments",
    href: "/teacher/assignments",
    icon: FileText,
    active: false,
  },
  {
    title: "Students",
    href: "/teacher/students",
    icon: GraduationCap,
    active: false,
  },
  {
    title: "Reports",
    href: "/teacher/reports",
    icon: BarChart3,
    active: false,
  },
  {
    title: "Settings",
    href: "/teacher/settings",
    icon: Settings,
    active: false,
  },
];

// Teacher statistics data
export const teacherStatsData = [
  {
    title: "Total Classes",
    value: "12",
    change: "+2",
    changeType: "positive" as const,
    icon: BookOpen,
  },
  {
    title: "Active Students",
    value: "156",
    change: "+8%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Assignments Given",
    value: "24",
    change: "+3",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Attendance Rate",
    value: "94%",
    change: "+2%",
    changeType: "positive" as const,
    icon: CheckCircle,
  },
];

// Attendance trend data
export const attendanceTrendData = [
  { month: "Week 1", users: 92 },
  { month: "Week 2", users: 88 },
  { month: "Week 3", users: 95 },
  { month: "Week 4", users: 91 },
  { month: "Week 5", users: 94 },
  { month: "Week 6", users: 89 },
  { month: "Week 7", users: 96 },
  { month: "Week 8", users: 93 },
];

// Student performance data
export const studentPerformanceData = [
  { course: "Alice Johnson", enrollments: 95, completions: 8 },
  { course: "Bob Smith", enrollments: 87, completions: 7 },
  { course: "Carol Davis", enrollments: 92, completions: 8 },
  { course: "David Wilson", enrollments: 78, completions: 6 },
  { course: "Eva Brown", enrollments: 89, completions: 7 },
];

// Upcoming classes data
export const upcomingClasses = [
  {
    id: 1,
    subject: "Mathematics",
    time: "09:00 AM",
    date: "Today",
    students: 24,
    room: "Room 101",
  },
  {
    id: 2,
    subject: "Physics",
    time: "11:00 AM",
    date: "Today",
    students: 22,
    room: "Room 102",
  },
  {
    id: 3,
    subject: "Chemistry",
    time: "02:00 PM",
    date: "Tomorrow",
    students: 20,
    room: "Lab 1",
  },
  {
    id: 4,
    subject: "Biology",
    time: "10:00 AM",
    date: "Tomorrow",
    students: 18,
    room: "Lab 2",
  },
];

// Recent activities data
export const teacherRecentActivities = [
  {
    id: 1,
    type: "assignment_submitted",
    message: "Alice Johnson submitted Math Assignment #3",
    timestamp: "5 minutes ago",
    icon: FileText,
  },
  {
    id: 2,
    type: "class_completed",
    message: "Physics class completed - 22 students attended",
    timestamp: "1 hour ago",
    icon: BookOpen,
  },
  {
    id: 3,
    type: "assignment_created",
    message: "New Chemistry assignment created",
    timestamp: "2 hours ago",
    icon: FileText,
  },
  {
    id: 4,
    type: "attendance_marked",
    message: "Attendance marked for Biology class",
    timestamp: "3 hours ago",
    icon: Users,
  },
];

// My Classes data
export const myClassesData = [
  {
    id: 1,
    subject: "Mathematics",
    classCode: "MATH101",
    totalStudents: 24,
    schedule: "Mon, Wed, Fri - 09:00 AM",
    room: "Room 101",
    status: "Active" as const,
  },
  {
    id: 2,
    subject: "Physics",
    classCode: "PHYS201",
    totalStudents: 22,
    schedule: "Tue, Thu - 11:00 AM",
    room: "Room 102",
    status: "Active" as const,
  },
  {
    id: 3,
    subject: "Chemistry",
    classCode: "CHEM301",
    totalStudents: 20,
    schedule: "Mon, Wed - 02:00 PM",
    room: "Lab 1",
    status: "Active" as const,
  },
  {
    id: 4,
    subject: "Biology",
    classCode: "BIO401",
    totalStudents: 18,
    schedule: "Tue, Thu - 10:00 AM",
    room: "Lab 2",
    status: "Active" as const,
  },
];

// Assignments data
export const assignmentsData = [
  {
    id: 1,
    title: "Quadratic Equations Practice",
    subject: "Mathematics",
    dueDate: "2024-01-25",
    status: "Active" as const,
    submissions: 18,
    totalStudents: 24,
  },
  {
    id: 2,
    title: "Newton's Laws Problems",
    subject: "Physics",
    dueDate: "2024-01-26",
    status: "Active" as const,
    submissions: 15,
    totalStudents: 22,
  },
  {
    id: 3,
    title: "Chemical Bonding Lab Report",
    subject: "Chemistry",
    dueDate: "2024-01-24",
    status: "Graded" as const,
    submissions: 20,
    totalStudents: 20,
  },
  {
    id: 4,
    title: "Cell Structure Analysis",
    subject: "Biology",
    dueDate: "2024-01-27",
    status: "Draft" as const,
    submissions: 0,
    totalStudents: 18,
  },
];

// Extended Assignment with detailed student submissions
export interface AssignmentWithDetails {
  id: number;
  title: string;
  subject: string;
  classId: number;
  classCode: string;
  description: string;
  maxPoints: number;
  dueDate: string;
  status: "Assigned" | "Submitted" | "Graded" | "Late";
  creationDate: string;
  submissions: AssignmentSubmission[];
  totalStudents: number;
}

export interface AssignmentSubmission {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  status: "Not Submitted" | "Submitted" | "Graded";
  submissionDate?: string;
  grade?: number;
  maxPoints: number;
  feedback?: string;
  attachments: string[];
}

// Enhanced mock data for assignments with submissions
export const detailedAssignmentsData: AssignmentWithDetails[] = [
  {
    id: 1,
    title: "Quadratic Equations Practice",
    subject: "Mathematics",
    classId: 1,
    classCode: "MATH101",
    description:
      "Practice solving quadratic equations using different methods including factoring, completing the square, and quadratic formula.",
    maxPoints: 100,
    dueDate: "2024-01-25",
    status: "Assigned",
    creationDate: "2024-01-15",
    totalStudents: 8,
    submissions: [
      {
        id: 1,
        studentId: 1,
        studentName: "Alice Johnson",
        studentEmail: "alice.johnson@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-23",
        grade: 95,
        maxPoints: 100,
        attachments: ["assignment.pdf"],
      },
      {
        id: 2,
        studentId: 2,
        studentName: "Bob Smith",
        studentEmail: "bob.smith@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-24",
        grade: 88,
        maxPoints: 100,
        attachments: ["homework.pdf"],
      },
      {
        id: 3,
        studentId: 3,
        studentName: "Carol Davis",
        studentEmail: "carol.davis@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-24",
        grade: 92,
        maxPoints: 100,
        attachments: ["work.pdf"],
      },
      {
        id: 4,
        studentId: 4,
        studentName: "David Wilson",
        studentEmail: "david.wilson@school.edu",
        status: "Not Submitted",
        maxPoints: 100,
        attachments: [],
      },
      {
        id: 5,
        studentId: 5,
        studentName: "Eva Brown",
        studentEmail: "eva.brown@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-25",
        grade: 90,
        maxPoints: 100,
        attachments: ["solution.pdf"],
      },
      {
        id: 6,
        studentId: 6,
        studentName: "Frank Miller",
        studentEmail: "frank.miller@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-23",
        grade: 85,
        maxPoints: 100,
        attachments: ["assign.pdf"],
      },
      {
        id: 7,
        studentId: 7,
        studentName: "Grace Lee",
        studentEmail: "grace.lee@school.edu",
        status: "Not Submitted",
        maxPoints: 100,
        attachments: [],
      },
      {
        id: 8,
        studentId: 8,
        studentName: "Henry Chen",
        studentEmail: "henry.chen@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-24",
        grade: 78,
        maxPoints: 100,
        attachments: ["work.pdf"],
      },
    ],
  },
  {
    id: 2,
    title: "Newton's Laws Problems",
    subject: "Physics",
    classId: 2,
    classCode: "PHYS201",
    description:
      "Complete problems related to Newton's three laws of motion. Show all work and calculations.",
    maxPoints: 100,
    dueDate: "2024-01-26",
    status: "Assigned",
    creationDate: "2024-01-18",
    totalStudents: 6,
    submissions: [
      {
        id: 1,
        studentId: 2,
        studentName: "Bob Smith",
        studentEmail: "bob.smith@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-24",
        grade: 82,
        maxPoints: 100,
        attachments: ["physics.pdf"],
      },
      {
        id: 2,
        studentId: 3,
        studentName: "Carol Davis",
        studentEmail: "carol.davis@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-25",
        grade: 95,
        maxPoints: 100,
        attachments: ["work.pdf"],
      },
      {
        id: 3,
        studentId: 4,
        studentName: "David Wilson",
        studentEmail: "david.wilson@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-23",
        grade: 70,
        maxPoints: 100,
        attachments: ["assign.pdf"],
      },
      {
        id: 4,
        studentId: 5,
        studentName: "Eva Brown",
        studentEmail: "eva.brown@school.edu",
        status: "Not Submitted",
        maxPoints: 100,
        attachments: [],
      },
      {
        id: 5,
        studentId: 9,
        studentName: "Isabella Garcia",
        studentEmail: "isabella.garcia@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-25",
        grade: 88,
        maxPoints: 100,
        attachments: ["homework.pdf"],
      },
      {
        id: 6,
        studentId: 10,
        studentName: "Jack Williams",
        studentEmail: "jack.williams@school.edu",
        status: "Submitted",
        submissionDate: "2024-01-24",
        grade: 75,
        maxPoints: 100,
        attachments: ["physics.pdf"],
      },
    ],
  },
  {
    id: 3,
    title: "Chemical Bonding Lab Report",
    subject: "Chemistry",
    classId: 3,
    classCode: "CHEM301",
    description:
      "Write a comprehensive lab report analyzing different types of chemical bonds including ionic, covalent, and metallic bonds.",
    maxPoints: 100,
    dueDate: "2024-01-24",
    status: "Graded",
    creationDate: "2024-01-10",
    totalStudents: 5,
    submissions: [
      {
        id: 1,
        studentId: 1,
        studentName: "Alice Johnson",
        studentEmail: "alice.johnson@school.edu",
        status: "Graded",
        submissionDate: "2024-01-22",
        grade: 98,
        maxPoints: 100,
        feedback: "Excellent work with detailed analysis",
        attachments: ["lab-report.pdf"],
      },
      {
        id: 2,
        studentId: 3,
        studentName: "Carol Davis",
        studentEmail: "carol.davis@school.edu",
        status: "Graded",
        submissionDate: "2024-01-22",
        grade: 92,
        maxPoints: 100,
        feedback: "Good understanding of concepts",
        attachments: ["report.pdf"],
      },
      {
        id: 3,
        studentId: 5,
        studentName: "Eva Brown",
        studentEmail: "eva.brown@school.edu",
        status: "Graded",
        submissionDate: "2024-01-23",
        grade: 87,
        maxPoints: 100,
        feedback: "Well done, minor improvements needed",
        attachments: ["lab.pdf"],
      },
      {
        id: 4,
        studentId: 7,
        studentName: "Grace Lee",
        studentEmail: "grace.lee@school.edu",
        status: "Graded",
        submissionDate: "2024-01-23",
        grade: 85,
        maxPoints: 100,
        feedback: "Good effort",
        attachments: ["report.pdf"],
      },
      {
        id: 5,
        studentId: 8,
        studentName: "Henry Chen",
        studentEmail: "henry.chen@school.edu",
        status: "Graded",
        submissionDate: "2024-01-22",
        grade: 90,
        maxPoints: 100,
        feedback: "Complete and thorough",
        attachments: ["lab-report.pdf"],
      },
    ],
  },
  {
    id: 4,
    title: "Cell Structure Analysis",
    subject: "Biology",
    classId: 4,
    classCode: "BIO401",
    description:
      "Analyze and compare different cell structures. Create diagrams and explain the functions of major organelles.",
    maxPoints: 100,
    dueDate: "2024-01-27",
    status: "Assigned",
    creationDate: "2024-01-20",
    totalStudents: 4,
    submissions: [
      {
        id: 1,
        studentId: 2,
        studentName: "Bob Smith",
        studentEmail: "bob.smith@school.edu",
        status: "Not Submitted",
        maxPoints: 100,
        attachments: [],
      },
      {
        id: 2,
        studentId: 4,
        studentName: "David Wilson",
        studentEmail: "david.wilson@school.edu",
        status: "Not Submitted",
        maxPoints: 100,
        attachments: [],
      },
      {
        id: 3,
        studentId: 6,
        studentName: "Frank Miller",
        studentEmail: "frank.miller@school.edu",
        status: "Not Submitted",
        maxPoints: 100,
        attachments: [],
      },
      {
        id: 4,
        studentId: 9,
        studentName: "Isabella Garcia",
        studentEmail: "isabella.garcia@school.edu",
        status: "Not Submitted",
        maxPoints: 100,
        attachments: [],
      },
    ],
  },
];

// Teacher student roster data
export interface TeacherStudent {
  id: number;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
  classId: number;
  className: string;
  classCode: string;
  attendance: number;
  progress: number;
  totalAssignments: number;
  completedAssignments: number;
  grade: string;
  status: "Active" | "At Risk" | "Inactive";
  lastActive: string;
}

export const teacherStudentsData: TeacherStudent[] = [
  {
    id: 1,
    name: "Alice Johnson",
    studentId: "STU001",
    email: "alice.johnson@school.edu",
    avatar: "AJ",
    classId: 1,
    className: "Mathematics",
    classCode: "MATH101",
    attendance: 94,
    progress: 87,
    totalAssignments: 22,
    completedAssignments: 18,
    grade: "A",
    status: "Active",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Bob Smith",
    studentId: "STU002",
    email: "bob.smith@school.edu",
    avatar: "BS",
    classId: 2,
    className: "Physics",
    classCode: "PHYS201",
    attendance: 88,
    progress: 72,
    totalAssignments: 20,
    completedAssignments: 15,
    grade: "B+",
    status: "Active",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "Carol Davis",
    studentId: "STU003",
    email: "carol.davis@school.edu",
    avatar: "CD",
    classId: 1,
    className: "Mathematics",
    classCode: "MATH101",
    attendance: 96,
    progress: 95,
    totalAssignments: 19,
    completedAssignments: 19,
    grade: "A+",
    status: "Active",
    lastActive: "30 minutes ago",
  },
  {
    id: 4,
    name: "David Wilson",
    studentId: "STU004",
    email: "david.wilson@school.edu",
    avatar: "DW",
    classId: 2,
    className: "Physics",
    classCode: "PHYS201",
    attendance: 78,
    progress: 65,
    totalAssignments: 18,
    completedAssignments: 12,
    grade: "C+",
    status: "At Risk",
    lastActive: "3 days ago",
  },
  {
    id: 5,
    name: "Eva Brown",
    studentId: "STU005",
    email: "eva.brown@school.edu",
    avatar: "EB",
    classId: 1,
    className: "Mathematics",
    classCode: "MATH101",
    attendance: 92,
    progress: 89,
    totalAssignments: 19,
    completedAssignments: 17,
    grade: "A-",
    status: "Active",
    lastActive: "1 hour ago",
  },
  {
    id: 6,
    name: "Frank Miller",
    studentId: "STU006",
    email: "frank.miller@school.edu",
    avatar: "FM",
    classId: 3,
    className: "Chemistry",
    classCode: "CHEM301",
    attendance: 91,
    progress: 84,
    totalAssignments: 15,
    completedAssignments: 13,
    grade: "B+",
    status: "Active",
    lastActive: "4 hours ago",
  },
  {
    id: 7,
    name: "Grace Lee",
    studentId: "STU007",
    email: "grace.lee@school.edu",
    avatar: "GL",
    classId: 3,
    className: "Chemistry",
    classCode: "CHEM301",
    attendance: 85,
    progress: 76,
    totalAssignments: 15,
    completedAssignments: 11,
    grade: "C+",
    status: "At Risk",
    lastActive: "2 days ago",
  },
  {
    id: 8,
    name: "Henry Chen",
    studentId: "STU008",
    email: "henry.chen@school.edu",
    avatar: "HC",
    classId: 1,
    className: "Mathematics",
    classCode: "MATH101",
    attendance: 93,
    progress: 91,
    totalAssignments: 22,
    completedAssignments: 20,
    grade: "A",
    status: "Active",
    lastActive: "5 hours ago",
  },
  {
    id: 9,
    name: "Isabella Garcia",
    studentId: "STU009",
    email: "isabella.garcia@school.edu",
    avatar: "IG",
    classId: 2,
    className: "Physics",
    classCode: "PHYS201",
    attendance: 90,
    progress: 79,
    totalAssignments: 20,
    completedAssignments: 16,
    grade: "B",
    status: "Active",
    lastActive: "6 hours ago",
  },
  {
    id: 10,
    name: "Jack Williams",
    studentId: "STU010",
    email: "jack.williams@school.edu",
    avatar: "JW",
    classId: 4,
    className: "Biology",
    classCode: "BIO401",
    attendance: 89,
    progress: 82,
    totalAssignments: 12,
    completedAssignments: 10,
    grade: "B+",
    status: "Active",
    lastActive: "1 day ago",
  },
];

// Students data for attendance
export const studentsData = [
  {
    id: 1,
    name: "Alice Johnson",
    studentId: "STU001",
    email: "alice.johnson@school.edu",
    status: "Present" as "Present" | "Absent" | "Late",
  },
  {
    id: 2,
    name: "Bob Smith",
    studentId: "STU002",
    email: "bob.smith@school.edu",
    status: "Present" as "Present" | "Absent" | "Late",
  },
  {
    id: 3,
    name: "Carol Davis",
    studentId: "STU003",
    email: "carol.davis@school.edu",
    status: "Absent" as "Present" | "Absent" | "Late",
  },
  {
    id: 4,
    name: "David Wilson",
    studentId: "STU004",
    email: "david.wilson@school.edu",
    status: "Present" as "Present" | "Absent" | "Late",
  },
  {
    id: 5,
    name: "Eva Brown",
    studentId: "STU005",
    email: "eva.brown@school.edu",
    status: "Present" as "Present" | "Absent" | "Late",
  },
  {
    id: 6,
    name: "Frank Miller",
    studentId: "STU006",
    email: "frank.miller@school.edu",
    status: "Present" as "Present" | "Absent" | "Late",
  },
  {
    id: 7,
    name: "Grace Lee",
    studentId: "STU007",
    email: "grace.lee@school.edu",
    status: "Absent" as "Present" | "Absent" | "Late",
  },
  {
    id: 8,
    name: "Henry Chen",
    studentId: "STU008",
    email: "henry.chen@school.edu",
    status: "Present" as "Present" | "Absent" | "Late",
  },
  {
    id: 9,
    name: "Isabella Garcia",
    studentId: "STU009",
    email: "isabella.garcia@school.edu",
    status: "Absent" as "Present" | "Absent" | "Late",
  },
  {
    id: 10,
    name: "Jack Williams",
    studentId: "STU010",
    email: "jack.williams@school.edu",
    status: "Present" as "Present" | "Absent" | "Late",
  },
];

// Extended Class with detailed information
export interface ClassWithDetails {
  id: number;
  subject: string;
  classCode: string;
  totalStudents: number;
  schedule: string;
  room: string;
  status: "Active" | "Inactive" | "Completed";
  description?: string;
  grade?: string;
  section?: string;
  students: ClassStudent[];
  assignments: ClassAssignment[];
}

export interface ClassStudent {
  id: number;
  name: string;
  studentId: string;
  email: string;
}

export interface ClassAssignment {
  id: number;
  title: string;
  dueDate: string;
  status: "Draft" | "Active" | "Graded" | "Closed";
  submissions: number;
}

// Mock data for classes with students and assignments
export const detailedClassesData: ClassWithDetails[] = [
  {
    id: 1,
    subject: "Mathematics",
    classCode: "MATH101",
    totalStudents: 24,
    schedule: "Mon, Wed, Fri - 09:00 AM",
    room: "Room 101",
    status: "Active",
    description: "Introduction to Calculus and Algebra",
    grade: "Grade 10",
    section: "A",
    students: [
      {
        id: 1,
        name: "Alice Johnson",
        studentId: "STU001",
        email: "alice.johnson@school.edu",
      },
      {
        id: 2,
        name: "Bob Smith",
        studentId: "STU002",
        email: "bob.smith@school.edu",
      },
      {
        id: 3,
        name: "Carol Davis",
        studentId: "STU003",
        email: "carol.davis@school.edu",
      },
      {
        id: 4,
        name: "David Wilson",
        studentId: "STU004",
        email: "david.wilson@school.edu",
      },
      {
        id: 5,
        name: "Eva Brown",
        studentId: "STU005",
        email: "eva.brown@school.edu",
      },
      {
        id: 6,
        name: "Frank Miller",
        studentId: "STU006",
        email: "frank.miller@school.edu",
      },
      {
        id: 7,
        name: "Grace Lee",
        studentId: "STU007",
        email: "grace.lee@school.edu",
      },
      {
        id: 8,
        name: "Henry Chen",
        studentId: "STU008",
        email: "henry.chen@school.edu",
      },
    ],
    assignments: [
      {
        id: 1,
        title: "Quadratic Equations Practice",
        dueDate: "2024-01-25",
        status: "Active",
        submissions: 18,
      },
      {
        id: 2,
        title: "Derivatives Homework",
        dueDate: "2024-01-30",
        status: "Draft",
        submissions: 0,
      },
    ],
  },
  {
    id: 2,
    subject: "Physics",
    classCode: "PHYS201",
    totalStudents: 22,
    schedule: "Tue, Thu - 11:00 AM",
    room: "Room 102",
    status: "Active",
    description: "Mechanics and Thermodynamics",
    grade: "Grade 11",
    section: "B",
    students: [
      {
        id: 2,
        name: "Bob Smith",
        studentId: "STU002",
        email: "bob.smith@school.edu",
      },
      {
        id: 3,
        name: "Carol Davis",
        studentId: "STU003",
        email: "carol.davis@school.edu",
      },
      {
        id: 4,
        name: "David Wilson",
        studentId: "STU004",
        email: "david.wilson@school.edu",
      },
      {
        id: 5,
        name: "Eva Brown",
        studentId: "STU005",
        email: "eva.brown@school.edu",
      },
      {
        id: 9,
        name: "Isabella Garcia",
        studentId: "STU009",
        email: "isabella.garcia@school.edu",
      },
      {
        id: 10,
        name: "Jack Williams",
        studentId: "STU010",
        email: "jack.williams@school.edu",
      },
    ],
    assignments: [
      {
        id: 3,
        title: "Newton's Laws Problems",
        dueDate: "2024-01-26",
        status: "Active",
        submissions: 15,
      },
      {
        id: 4,
        title: "Energy Conservation Lab",
        dueDate: "2024-02-01",
        status: "Draft",
        submissions: 0,
      },
    ],
  },
  {
    id: 3,
    subject: "Chemistry",
    classCode: "CHEM301",
    totalStudents: 20,
    schedule: "Mon, Wed - 02:00 PM",
    room: "Lab 1",
    status: "Active",
    description: "Organic and Inorganic Chemistry",
    grade: "Grade 12",
    section: "C",
    students: [
      {
        id: 1,
        name: "Alice Johnson",
        studentId: "STU001",
        email: "alice.johnson@school.edu",
      },
      {
        id: 3,
        name: "Carol Davis",
        studentId: "STU003",
        email: "carol.davis@school.edu",
      },
      {
        id: 5,
        name: "Eva Brown",
        studentId: "STU005",
        email: "eva.brown@school.edu",
      },
      {
        id: 7,
        name: "Grace Lee",
        studentId: "STU007",
        email: "grace.lee@school.edu",
      },
      {
        id: 8,
        name: "Henry Chen",
        studentId: "STU008",
        email: "henry.chen@school.edu",
      },
    ],
    assignments: [
      {
        id: 5,
        title: "Chemical Bonding Lab Report",
        dueDate: "2024-01-24",
        status: "Graded",
        submissions: 20,
      },
      {
        id: 6,
        title: "Reaction Mechanisms",
        dueDate: "2024-01-31",
        status: "Draft",
        submissions: 0,
      },
    ],
  },
  {
    id: 4,
    subject: "Biology",
    classCode: "BIO401",
    totalStudents: 18,
    schedule: "Tue, Thu - 10:00 AM",
    room: "Lab 2",
    status: "Active",
    description: "Cell Biology and Genetics",
    grade: "Grade 11",
    section: "A",
    students: [
      {
        id: 2,
        name: "Bob Smith",
        studentId: "STU002",
        email: "bob.smith@school.edu",
      },
      {
        id: 4,
        name: "David Wilson",
        studentId: "STU004",
        email: "david.wilson@school.edu",
      },
      {
        id: 6,
        name: "Frank Miller",
        studentId: "STU006",
        email: "frank.miller@school.edu",
      },
      {
        id: 9,
        name: "Isabella Garcia",
        studentId: "STU009",
        email: "isabella.garcia@school.edu",
      },
    ],
    assignments: [
      {
        id: 7,
        title: "Cell Structure Analysis",
        dueDate: "2024-01-27",
        status: "Draft",
        submissions: 0,
      },
      {
        id: 8,
        title: "Genetics Problem Set",
        dueDate: "2024-02-02",
        status: "Draft",
        submissions: 0,
      },
    ],
  },
];

// Glassmorphism styles (same as admin)
export const glassStyles = {
  sidebar: "bg-sidebar/30 backdrop-blur-md border-r border-sidebar-border",
  navbar: "bg-card/60 backdrop-blur-md border-b border-border",
  card: "bg-card/60 backdrop-blur-sm border border-border/50",
  cardHover:
    "hover:bg-card/80 hover:backdrop-blur-lg transition-all duration-300",
  button:
    "bg-glass-medium backdrop-blur-sm border border-border/50 hover:bg-glass-strong",
};

// Animation classes (same as admin)
export const animationClasses = {
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in",
  scaleIn: "animate-scale-in",
  hover: "hover:scale-105 transition-transform duration-200",
};
