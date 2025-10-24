export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  year: "Freshman" | "Sophomore" | "Junior" | "Senior";
  joinDate: string;
  lastActive: string;
  status: "Active" | "Inactive" | "At Risk" | "Suspended";
  courses: string[];
  attendance: number;
  progress: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  grade: string;
  gpa: number;
  verified: boolean;
  studentId: string; // Student ID for search
}

export interface StudentFilters {
  search: string;
  status: "All" | "Active" | "Inactive" | "At Risk" | "Suspended";
  course: string;
  attendanceRange: "All" | "0-50" | "51-80" | "81-100";
}

export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  year: "Freshman" | "Sophomore" | "Junior" | "Senior";
  status: "Active" | "Inactive" | "At Risk" | "Suspended";
  courses: string[];
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface SortState {
  field: keyof Student;
  direction: "asc" | "desc";
}

export interface BulkAction {
  type: "activate" | "deactivate" | "delete";
  studentIds: number[];
}
