import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiSuccess } from "@/lib/api/response";

// Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  phone?: string;
  department?: string;
  joinDate?: string;
  status?: "Active" | "Pending" | "Inactive";
  verified?: boolean;
  avatar?: string;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  total: number;
  limit: number;
  skip: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  code: string;
  description?: string;
  teacherId?: string;
  instructor?: string;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  duration?: string;
  students?: number;
  maxStudents?: number;
  rating?: number;
  price?: number;
  status?: "Active" | "Draft" | "Archived" | "Suspended";
  startDate?: string;
  endDate?: string;
  lessons?: number;
  completedLessons?: number;
  thumbnail?: string;
}

export interface AdminCoursesResponse {
  items: AdminCourse[];
  total: number;
  limit: number;
  skip: number;
}

// Admin Users Hooks
export function useAdminUsers(params?: { limit?: number; skip?: number; role?: string; q?: string }) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      if (params?.role) searchParams.set("role", params.role);
      if (params?.q) searchParams.set("q", params.q);
      
      const response = await apiClient<ApiSuccess<AdminUsersResponse>>(
        `/api/admin/users?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: "ADMIN" | "TEACHER" | "STUDENT";
      specialization?: string;
      contact?: string;
      enrollmentNo?: string;
      semester?: number;
      section?: string;
    }) => {
      const response = await apiClient<ApiSuccess<AdminUser>>("/api/admin/users", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate both users and role-specific queries
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      if (variables.role === "STUDENT") {
        queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      } else if (variables.role === "TEACHER") {
        queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      }
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("useCreateAdminUser error:", error);
      const errorMessage = error.message || "Failed to create user";
      
      // Handle specific error messages
      let title = "Error";
      let description = errorMessage;
      
      if (errorMessage.includes("Email already exists")) {
        title = "Email Already Exists";
        description = "A user with this email already exists. Please use a different email address.";
      } else if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
        title = "Duplicate Entry";
        description = errorMessage;
      }
      
      toast({
        title,
        description,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds
      });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      email?: string;
      password?: string;
      role?: "ADMIN" | "TEACHER" | "STUDENT";
      specialization?: string;
      contact?: string;
      enrollmentNo?: string;
      semester?: number;
      section?: string;
    }) => {
      const response = await apiClient<ApiSuccess<AdminUser>>("/api/admin/users", {
        method: "PUT",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ApiSuccess<{ id: string }>>(
        `/api/admin/users?id=${id}`,
        { method: "DELETE" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });
}

// Admin Courses Hooks
export function useAdminCourses(params?: { limit?: number; skip?: number; teacherId?: string; q?: string }) {
  return useQuery({
    queryKey: ["admin", "courses", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      if (params?.teacherId) searchParams.set("teacherId", params.teacherId);
      if (params?.q) searchParams.set("q", params.q);
      
      const response = await apiClient<ApiSuccess<AdminCoursesResponse>>(
        `/api/admin/courses?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateAdminCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      code: string;
      description?: string;
      teacherId?: string;
    }) => {
      const response = await apiClient<ApiSuccess<AdminCourse>>("/api/admin/courses", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all course queries regardless of parameters
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAdminCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      code?: string;
      description?: string;
      teacherId?: string | null;
    }) => {
      const response = await apiClient<ApiSuccess<AdminCourse>>(`/api/admin/courses/${data.id}`, {
        method: "PATCH",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAdminCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ApiSuccess<{ id: string }>>(
        `/api/admin/courses/${id}`,
        { method: "DELETE" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
  });
}

// Admin Attendance Hook
export function useUpsertAdminAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      courseId: string;
      date: string;
      status: "PRESENT" | "ABSENT" | "LATE";
    }) => {
      const response = await apiClient<ApiSuccess<any>>("/api/admin/attendance", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attendance"] });
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive",
      });
    },
  });
}

// Admin Assignment Hook
export function useCreateAdminAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      courseId: string;
      dueDate: string;
      points: number;
    }) => {
      const response = await apiClient<ApiSuccess<any>>("/api/admin/assignments", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assignments"] });
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    },
  });
}

// Admin Teachers Hooks
export interface AdminTeacher {
  id: string;
  userId: string;
  specialization?: string;
  contact?: string;
  isActive: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminTeachersResponse {
  items: AdminTeacher[];
  total: number;
  limit: number;
  skip: number;
}

export function useAdminTeachers(params?: { limit?: number; skip?: number; active?: boolean; q?: string }) {
  return useQuery({
    queryKey: ["admin", "teachers", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      if (params?.active !== undefined) searchParams.set("active", String(params.active));
      if (params?.q) searchParams.set("q", params.q);
      
      const response = await apiClient<ApiSuccess<AdminTeachersResponse>>(
        `/api/admin/teachers?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateAdminTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      specialization?: string;
      contact?: string;
    }) => {
      const response = await apiClient<ApiSuccess<AdminTeacher>>("/api/admin/teachers", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAdminTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      specialization?: string;
      contact?: string;
      isActive?: boolean;
    }) => {
      const response = await apiClient<ApiSuccess<AdminTeacher>>("/api/admin/teachers", {
        method: "PUT",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAdminTeacher() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ApiSuccess<{ id: string }>>(
        `/api/admin/teachers?id=${id}`,
        { method: "DELETE" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    },
  });
}

// Admin Students Hooks
export interface AdminStudent {
  id: string;
  userId: string;
  enrollmentNo: string;
  semester: number;
  section: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  progress?: number | null;
}

export interface AdminStudentsResponse {
  items: AdminStudent[];
  total: number;
  limit: number;
  skip: number;
}

export function useAdminStudents(params?: { limit?: number; skip?: number; courseId?: string; q?: string }) {
  return useQuery({
    queryKey: ["admin", "students", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      if (params?.courseId) searchParams.set("courseId", params.courseId);
      if (params?.q) searchParams.set("q", params.q);
      
      const response = await apiClient<ApiSuccess<AdminStudentsResponse>>(
        `/api/admin/students?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateAdminStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      enrollmentNo: string;
      semester: number;
      section: string;
    }) => {
      const response = await apiClient<ApiSuccess<AdminStudent>>("/api/admin/students", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast({
        title: "Success",
        description: "Student created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAdminStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      enrollmentNo?: string;
      semester?: number;
      section?: string;
    }) => {
      const response = await apiClient<ApiSuccess<AdminStudent>>("/api/admin/students", {
        method: "PUT",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAdminStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ApiSuccess<{ id: string }>>(
        `/api/admin/students?id=${id}`,
        { method: "DELETE" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    },
  });
}

// Admin Reports Hooks
export interface AdminAttendanceReportResponse {
  overallAttendancePercentage: number;
  courseStats: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    attendancePercentage: number;
  }>;
  studentStats: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    enrollmentNo: string;
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    attendancePercentage: number;
  }>;
}

export function useAdminAttendanceReport(params?: { courseId?: string; studentId?: string }) {
  return useQuery({
    queryKey: ["admin", "reports", "attendance", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.courseId) searchParams.set("courseId", params.courseId);
      if (params?.studentId) searchParams.set("studentId", params.studentId);
      
      const response = await apiClient<ApiSuccess<AdminAttendanceReportResponse>>(
        `/api/reports/admin/attendance?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export interface AdminGradesReportResponse {
  overall: {
    totalSubmissions: number;
    averageGrade: number;
    distribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  };
  byCourse: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    totalSubmissions: number;
    uniqueStudents: number;
    averageGrade: number;
    distribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    };
  }>;
}

export function useAdminGradesReport() {
  return useQuery({
    queryKey: ["admin", "reports", "grades"],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<AdminGradesReportResponse>>(
        "/api/reports/admin/grades"
      );
      return response.data;
    },
  });
}

export interface AdminReportsResponse {
  usersByRole: Array<{ role: string; count: number }>;
  totals: {
    courses: number;
    assignments: number;
    submissions: number;
  };
  attendanceByStatus: Array<{ status: string; count: number }>;
  leavesByStatus: Array<{ status: string; count: number }>;
  avgGpa: number;
  studentsWithGpa: Array<{
    id: string;
    name: string;
    email: string;
    latestGpa: number | null;
    latestSemester: number | null;
  }>;
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<AdminReportsResponse>>(
        "/api/admin/reports"
      );
      return response.data;
    },
  });
}

// Admin Leave Request Hook
export function useUpdateAdminLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      const response = await apiClient<ApiSuccess<any>>(`/api/admin/leave-requests/${data.id}`, {
        method: "PATCH",
        body: { status: data.status },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leave-requests"] });
      toast({
        title: "Success",
        description: `Leave request ${variables.status.toLowerCase()} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update leave request",
        variant: "destructive",
      });
    },
  });
}

