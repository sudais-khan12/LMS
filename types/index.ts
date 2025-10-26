/**
 * Centralized type definitions for the LMS platform.
 * Single source of truth for all domain models.
 *
 * @module types
 */

import { LucideIcon } from "lucide-react";

/**
 * Base user interface with common properties
 */
export interface BaseUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  joinDate: string;
  status: "Active" | "Pending" | "Inactive" | "Suspended";
  verified: boolean;
}

/**
 * Student user extending BaseUser
 */
export interface Student extends BaseUser {
  studentId: string;
  year: "Freshman" | "Sophomore" | "Junior" | "Senior";
  lastActive: string;
  courses: string[];
  attendance: number;
  progress: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  grade: string;
  gpa: number;
}

/**
 * Teacher user extending BaseUser
 */
export interface Teacher extends BaseUser {
  teacherId: string;
  subjects: string[];
  qualifications: string[];
  bio: string;
  location: string;
  timezone: string;
  officeHours: string;
}

/**
 * Admin user extending BaseUser
 */
export interface Admin extends BaseUser {
  adminId: string;
  permissions: string[];
  role: "Super Admin" | "Admin" | "Moderator";
}

/**
 * Course model
 */
export interface Course {
  id: number;
  title: string;
  instructor: string;
  instructorId: number;
  description: string;
  category: string;
  duration: string;
  startDate: string;
  endDate: string;
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  status: "Active" | "Completed" | "Upcoming";
  rating: number;
  level?: string;
  prerequisites?: string[];
}

/**
 * Assignment model
 */
export interface Assignment {
  id: number;
  title: string;
  courseId: number;
  courseTitle: string;
  subject: string;
  dueDate: string;
  status: "Draft" | "Active" | "Graded" | "Closed";
  submissions: number;
  totalStudents: number;
  description?: string;
  maxScore?: number;
}

/**
 * Class model for teachers
 */
export interface Class {
  id: number;
  subject: string;
  classCode: string;
  teacherId: number;
  totalStudents: number;
  schedule: string;
  room: string;
  status: "Active" | "Inactive" | "Completed";
}

/**
 * Attendance record model
 */
export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  remarks?: string;
}

/**
 * Report model
 */
export interface Report {
  id: number;
  title: string;
  type: "Attendance" | "Performance" | "Activity";
  dateRange: {
    start: string;
    end: string;
  };
  data: Record<string, unknown>;
  generatedAt: string;
  generatedBy: number;
}

// Utility types

/**
 * Filter state for search/filter operations
 */
export interface FilterState {
  search: string;
  status?: string;
  role?: string;
  category?: string;
  [key: string]: string | undefined;
}

/**
 * Sort state for table sorting
 */
export interface SortState<T = Record<string, unknown>> {
  field: keyof T;
  direction: "asc" | "desc";
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
}

/**
 * Stat card data interface
 */
export interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

// Legacy type exports for backward compatibility
export type User = BaseUser;

/**
 * User role type
 */
export type UserRole = "Student" | "Teacher" | "Admin";

/**
 * User status type
 */
export type UserStatus = "Active" | "Pending" | "Inactive" | "Suspended";

/**
 * Course status type
 */
export type CourseStatus = "Active" | "Completed" | "Upcoming";

/**
 * Assignment status type
 */
export type AssignmentStatus = "Draft" | "Active" | "Graded" | "Closed";

/**
 * Attendance status type
 */
export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";
