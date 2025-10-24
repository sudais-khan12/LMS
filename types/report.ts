// Common report types
export interface ReportFilters {
  timeRange: "30days" | "6months" | "1year" | "all";
  course?: string;
  userType?: "all" | "student" | "teacher" | "admin";
  search?: string;
}

export interface ExportOptions {
  format: "csv" | "pdf";
  filename?: string;
}

// Attendance Report Types
export interface AttendanceDataPoint {
  month: string;
  attendance: number;
  students: number;
}

export interface CourseAttendanceStats {
  courseId: string;
  courseName: string;
  totalStudents: number;
  averageAttendance: number;
  attendanceTrend: "up" | "down" | "stable";
  lowAttendanceAlerts: number;
}

export interface AttendanceKPIs {
  averageAttendance: number;
  topCourse: string;
  lowAttendanceAlerts: number;
  totalStudents: number;
}

export interface AttendanceReportData {
  trendData: AttendanceDataPoint[];
  courseStats: CourseAttendanceStats[];
  kpis: AttendanceKPIs;
}

// Performance Report Types
export interface CourseGradeData {
  courseName: string;
  averageGrade: number;
  totalStudents: number;
  passRate: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  courseName: string;
  grade: string;
  gpa: number;
  attendance: number;
  isBelowThreshold: boolean;
}

export interface PerformanceReportData {
  courseGrades: CourseGradeData[];
  gradeDistribution: GradeDistribution[];
  belowThresholdStudents: StudentPerformance[];
}

// Activity Report Types
export interface ActivityEvent {
  id: string;
  type:
    | "login"
    | "course_completion"
    | "assignment_submission"
    | "system_event";
  userId: string;
  userName: string;
  userType: "student" | "teacher" | "admin";
  description: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ActivityGroup {
  date: string;
  events: ActivityEvent[];
}

export interface ActivityReportData {
  recentEvents: ActivityEvent[];
  groupedEvents: ActivityGroup[];
  totalEvents: number;
  uniqueUsers: number;
}

// Chart data types for recharts
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface LineChartData {
  month: string;
  attendance: number;
  students?: number;
  [key: string]: string | number | undefined;
}

export interface BarChartData {
  course: string;
  averageGrade: number;
  passRate: number;
  [key: string]: string | number;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

// Report component props
export interface ReportComponentProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  isLoading?: boolean;
}

export interface AttendanceReportProps extends ReportComponentProps {
  data: AttendanceReportData;
}

export interface PerformanceReportProps extends ReportComponentProps {
  data: PerformanceReportData;
}

export interface ActivityReportProps extends ReportComponentProps {
  data: ActivityReportData;
}
