import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiSuccess } from "@/lib/api/response";

// Types
export interface StudentCourse {
  id: string;
  title: string;
  code: string;
  description?: string;
  instructor?: string;
  category?: string;
  level?: string;
  progress?: number;
  status?: "Enrolled" | "Completed" | "In Progress";
}

export interface StudentCoursesResponse {
  items: StudentCourse[];
  total: number;
  limit: number;
  skip: number;
}

export interface StudentAssignment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  dueDate: string;
  points: number;
  status?: "pending" | "submitted" | "overdue";
  submittedDate?: string;
  submissions?: Array<{
    id: string;
    status: string;
    grade?: number;
  }>;
}

export interface StudentAssignmentsResponse {
  items: StudentAssignment[];
  total: number;
  limit: number;
  skip: number;
}

export interface StudentAttendance {
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

export interface StudentAttendanceResponse {
  items: StudentAttendance[];
  total: number;
}

// Student Courses Hooks
export function useStudentCourses(params?: { limit?: number; skip?: number }) {
  return useQuery({
    queryKey: ["student", "courses", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      
      const response = await apiClient<ApiSuccess<StudentCoursesResponse>>(
        `/api/student/courses?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

// Student Assignments Hooks
export function useStudentAssignments(params?: { limit?: number; skip?: number; courseId?: string }) {
  return useQuery({
    queryKey: ["student", "assignments", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      if (params?.courseId) searchParams.set("courseId", params.courseId);
      
      const response = await apiClient<ApiSuccess<StudentAssignmentsResponse>>(
        `/api/student/assignments?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useSubmitStudentAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      assignmentId: string;
      content?: string;
      fileUrl?: string;
    }) => {
      const response = await apiClient<ApiSuccess<any>>("/api/student/submissions", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student", "submissions"] });
      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit assignment",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateStudentSubmission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      submissionId: string;
      fileUrl?: string;
      content?: string;
    }) => {
      const response = await apiClient<ApiSuccess<any>>(
        `/api/student/submissions/${data.submissionId}`,
        {
          method: "PATCH",
          body: { fileUrl: data.fileUrl, content: data.content },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student", "submissions"] });
      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update submission",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteStudentSubmission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await apiClient<ApiSuccess<any>>(
        `/api/student/submissions/${submissionId}`,
        {
          method: "DELETE",
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "assignments"] });
      queryClient.invalidateQueries({ queryKey: ["student", "submissions"] });
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete submission",
        variant: "destructive",
      });
    },
  });
}

// Student Attendance Hook
export function useStudentAttendance() {
  return useQuery({
    queryKey: ["student", "attendance"],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<StudentAttendanceResponse>>(
        "/api/student/attendance"
      );
      return response.data;
    },
  });
}

// Student Leave Request Hook
export function useCreateStudentLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      startDate: string;
      endDate: string;
      reason: string;
      type: "SICK" | "PERSONAL" | "EMERGENCY";
    }) => {
      const response = await apiClient<ApiSuccess<any>>("/api/student/leave-requests", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "leave-requests"] });
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    },
  });
}

// Student Dashboard Hook
export interface StudentDashboardStats {
  totalCourses: number;
  completedAssignments: number;
  totalAssignments: number;
  attendancePercentage: number;
}

export interface StudentDashboardResponse {
  stats: StudentDashboardStats;
  upcomingAssignments: Array<{
    id: string;
    title: string;
    course: string;
    dueDate: string;
  }>;
  courseProgress: Array<{
    course: string;
    progress: number;
    attendancePercentage: number;
    totalAssignments: number;
    completedAssignments: number;
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: string;
    type: string;
  }>;
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<StudentDashboardResponse>>(
        "/api/student/dashboard"
      );
      return response.data;
    },
  });
}

// Student Reports Hook
export interface StudentReportsResponse {
  reports: Array<{
    id: string;
    semester: number;
    gpa: number;
    createdAt: string;
  }>;
  attendanceRate: number;
  averageGrade: number | null;
}

export function useStudentReports() {
  return useQuery({
    queryKey: ["student", "reports"],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<StudentReportsResponse>>(
        "/api/student/reports"
      );
      return response.data;
    },
  });
}

// Student Attendance with Details Hook
export interface StudentAttendanceRecord {
  id: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
}

export interface StudentAttendanceRecordsResponse {
  items: StudentAttendanceRecord[];
  total: number;
  limit: number;
  skip: number;
}

export function useStudentAttendanceRecords(params?: {
  limit?: number;
  skip?: number;
  courseId?: string;
}) {
  return useQuery({
    queryKey: ["student", "attendance", "records", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      if (params?.courseId) searchParams.set("courseId", params.courseId);
      
      const response = await apiClient<ApiSuccess<StudentAttendanceRecordsResponse>>(
        `/api/student/attendance?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

// Student Profile Hook
export interface StudentProfileResponse {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    studentId: string;
    enrollmentDate: string;
    program: string;
    gpa: string;
    credits: string;
    semester: string;
    enrollmentNo: string;
    section: string;
  };
  stats: {
    attendanceRate: number;
    averageGrade: number | null;
    currentGPA: number | null;
    credits: number;
  };
}

export function useStudentProfile() {
  return useQuery({
    queryKey: ["student", "profile"],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<StudentProfileResponse>>(
        "/api/student/profile"
      );
      return response.data;
    },
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      enrollmentNo?: string;
      semester?: number;
      section?: string;
    }) => {
      const response = await apiClient<ApiSuccess<{ profile: any; message: string }>>(
        "/api/student/profile",
        {
          method: "PATCH",
          body: data,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
}

