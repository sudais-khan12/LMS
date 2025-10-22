import { LucideIcon } from "lucide-react";

// Teacher-specific interfaces extending base types

// Class interface
export interface Class {
  id: number;
  subject: string;
  classCode: string;
  totalStudents: number;
  schedule: string;
  room: string;
  status: "Active" | "Inactive" | "Completed";
}

// Assignment interface
export interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: "Draft" | "Active" | "Graded" | "Closed";
  submissions: number;
  totalStudents: number;
}

// Student interface for teacher view
export interface Student {
  id: number;
  name: string;
  studentId: string;
  email: string;
  status: "Present" | "Absent" | "Late";
}

// Upcoming class interface
export interface UpcomingClass {
  id: number;
  subject: string;
  time: string;
  date: string;
  students: number;
  room: string;
}

// Teacher activity interface
export interface TeacherActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  icon: LucideIcon;
}

// Teacher sidebar props interface
export interface TeacherSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Teacher navbar props interface
export interface TeacherNavbarProps {
  pageTitle: string;
  onMenuClick: () => void;
}

// Class card props interface
export interface ClassCardProps {
  classData: Class;
}

// Assignment table props interface
export interface AssignmentTableProps {
  assignments: Assignment[];
}

// Attendance table props interface
export interface AttendanceTableProps {
  students: Student[];
  onStatusChange: (studentId: number, status: "Present" | "Absent" | "Late") => void;
}

// Report chart props interface
export interface ReportChartProps {
  title: string;
  data: any[];
  type: "line" | "bar";
}
