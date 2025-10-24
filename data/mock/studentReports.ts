export interface ReportData {
  courseProgress: CourseProgressData[];
  monthlyPerformance: MonthlyPerformanceData[];
  gradeDistribution: GradeDistributionData[];
  attendanceTrend: AttendanceTrendData[];
  assignmentCompletion: AssignmentCompletionData[];
}

export interface CourseProgressData {
  course: string;
  progress: number;
  assignments: number;
  completed: number;
  averageGrade: number;
  lastActivity: string;
  [key: string]: unknown;
}

export interface MonthlyPerformanceData {
  month: string;
  score: number;
  assignments: number;
  attendance: number;
  participation: number;
  [key: string]: unknown;
}

export interface GradeDistributionData {
  grade: string;
  count: number;
  percentage: number;
  color: string;
  [key: string]: unknown;
}

export interface AttendanceTrendData {
  month: string;
  attendance: number;
  present: number;
  absent: number;
  late: number;
  [key: string]: unknown;
}

export interface AssignmentCompletionData {
  course: string;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  averageScore: number;
  [key: string]: unknown;
}

export const mockReportData: ReportData = {
  courseProgress: [
    {
      course: "React Fundamentals",
      progress: 85,
      assignments: 8,
      completed: 7,
      averageGrade: 92,
      lastActivity: "2 days ago",
    },
    {
      course: "JavaScript Advanced",
      progress: 92,
      assignments: 6,
      completed: 6,
      averageGrade: 88,
      lastActivity: "1 day ago",
    },
    {
      course: "Node.js Backend",
      progress: 78,
      assignments: 10,
      completed: 8,
      averageGrade: 85,
      lastActivity: "3 days ago",
    },
    {
      course: "Database Design",
      progress: 100,
      assignments: 5,
      completed: 5,
      averageGrade: 94,
      lastActivity: "1 week ago",
    },
    {
      course: "UI/UX Design",
      progress: 65,
      assignments: 7,
      completed: 4,
      averageGrade: 89,
      lastActivity: "4 days ago",
    },
    {
      course: "Python for Data Science",
      progress: 45,
      assignments: 12,
      completed: 5,
      averageGrade: 87,
      lastActivity: "5 days ago",
    },
  ],

  monthlyPerformance: [
    {
      month: "Jan",
      score: 85,
      assignments: 12,
      attendance: 88,
      participation: 90,
    },
    {
      month: "Feb",
      score: 92,
      assignments: 15,
      attendance: 94,
      participation: 95,
    },
    {
      month: "Mar",
      score: 88,
      assignments: 10,
      attendance: 91,
      participation: 88,
    },
    {
      month: "Apr",
      score: 95,
      assignments: 18,
      attendance: 89,
      participation: 92,
    },
    {
      month: "May",
      score: 90,
      assignments: 14,
      attendance: 95,
      participation: 89,
    },
    {
      month: "Jun",
      score: 94,
      assignments: 16,
      attendance: 92,
      participation: 93,
    },
  ],

  gradeDistribution: [
    { grade: "A+", count: 8, percentage: 25, color: "#10b981" },
    { grade: "A", count: 12, percentage: 37.5, color: "#3b82f6" },
    { grade: "B+", count: 6, percentage: 18.75, color: "#8b5cf6" },
    { grade: "B", count: 4, percentage: 12.5, color: "#f59e0b" },
    { grade: "C", count: 2, percentage: 6.25, color: "#ef4444" },
  ],

  attendanceTrend: [
    { month: "Jan", attendance: 88, present: 18, absent: 2, late: 1 },
    { month: "Feb", attendance: 94, present: 19, absent: 1, late: 1 },
    { month: "Mar", attendance: 91, present: 18, absent: 1, late: 2 },
    { month: "Apr", attendance: 89, present: 17, absent: 2, late: 1 },
    { month: "May", attendance: 95, present: 19, absent: 0, late: 1 },
    { month: "Jun", attendance: 92, present: 18, absent: 1, late: 1 },
  ],

  assignmentCompletion: [
    {
      course: "React Fundamentals",
      total: 8,
      completed: 7,
      pending: 1,
      overdue: 0,
      averageScore: 92,
    },
    {
      course: "JavaScript Advanced",
      total: 6,
      completed: 6,
      pending: 0,
      overdue: 0,
      averageScore: 88,
    },
    {
      course: "Node.js Backend",
      total: 10,
      completed: 8,
      pending: 2,
      overdue: 1,
      averageScore: 85,
    },
    {
      course: "Database Design",
      total: 5,
      completed: 5,
      pending: 0,
      overdue: 0,
      averageScore: 94,
    },
    {
      course: "UI/UX Design",
      total: 7,
      completed: 4,
      pending: 3,
      overdue: 0,
      averageScore: 89,
    },
    {
      course: "Python for Data Science",
      total: 12,
      completed: 5,
      pending: 7,
      overdue: 0,
      averageScore: 87,
    },
  ],
};

export const reportCourses = [
  "All",
  "React Fundamentals",
  "JavaScript Advanced",
  "Node.js Backend",
  "Database Design",
  "UI/UX Design",
  "Python for Data Science",
];

export const reportSemesters = [
  "All",
  "Fall 2023",
  "Spring 2024",
  "Summer 2024",
];

export const reportTypes = [
  "All",
  "Performance",
  "Attendance",
  "Assignments",
  "Grades",
];

export const calculateOverallStats = (data: ReportData) => {
  const totalAssignments = data.assignmentCompletion.reduce(
    (sum, course) => sum + course.total,
    0
  );
  const completedAssignments = data.assignmentCompletion.reduce(
    (sum, course) => sum + course.completed,
    0
  );
  const overdueAssignments = data.assignmentCompletion.reduce(
    (sum, course) => sum + course.overdue,
    0
  );
  const averageGrade =
    data.courseProgress.reduce((sum, course) => sum + course.averageGrade, 0) /
    data.courseProgress.length;
  const averageAttendance =
    data.attendanceTrend.reduce((sum, month) => sum + month.attendance, 0) /
    data.attendanceTrend.length;

  return {
    totalAssignments,
    completedAssignments,
    overdueAssignments,
    averageGrade: Math.round(averageGrade),
    averageAttendance: Math.round(averageAttendance),
    completionRate: Math.round((completedAssignments / totalAssignments) * 100),
  };
};
