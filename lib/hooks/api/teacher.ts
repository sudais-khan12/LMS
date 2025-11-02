import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiSuccess } from "@/lib/api/response";

// Types
export interface TeacherClass {
  id: string;
  title: string;
  code: string;
  description?: string;
  teacherId: string;
  instructor?: string;
  schedule?: string;
  room?: string;
  grade?: string;
  section?: string;
  status?: "Active" | "Inactive" | "Completed";
  totalStudents?: number;
}

export interface TeacherClassesResponse {
  items: TeacherClass[];
  total: number;
  limit: number;
  skip: number;
}

export interface TeacherSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  grade?: number;
  feedback?: string;
  submittedAt?: string;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  student?: {
    id: string;
    enrollmentNo?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  assignment?: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
      code: string;
    };
  };
}

export interface TeacherSubmissionsResponse {
  items: TeacherSubmission[];
  total: number;
}

// Teacher Classes Hooks
export function useTeacherClasses(params?: { limit?: number; skip?: number }) {
  return useQuery({
    queryKey: ["teacher", "classes", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      
      const response = await apiClient<ApiSuccess<TeacherClassesResponse>>(
        `/api/teacher/classes?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateTeacherClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      code: string;
      description?: string;
    }) => {
      const response = await apiClient<ApiSuccess<TeacherClass>>("/api/teacher/classes", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "classes"] });
      toast({
        title: "Success",
        description: "Class created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create class",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTeacherClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      code?: string;
      description?: string;
    }) => {
      const response = await apiClient<ApiSuccess<TeacherClass>>(`/api/teacher/classes/${data.id}`, {
        method: "PATCH",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "classes"] });
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update class",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTeacherClass() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ApiSuccess<{ id: string }>>(
        `/api/teacher/classes/${id}`,
        { method: "DELETE" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "classes"] });
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    },
  });
}

// Teacher Attendance Types
export interface TeacherAttendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  student?: {
    id: string;
    enrollmentNo?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  course?: {
    id: string;
    title: string;
    code: string;
  };
}

export interface TeacherAttendanceResponse {
  items: TeacherAttendance[];
  total: number;
  limit: number;
  skip: number;
}

// Teacher Attendance Hooks
export function useTeacherAttendance(params?: { 
  courseId?: string; 
  limit?: number; 
  skip?: number;
  date?: string;
}) {
  return useQuery({
    queryKey: ["teacher", "attendance", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.courseId) searchParams.set("courseId", params.courseId);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      if (params?.date) searchParams.set("date", params.date);
      
      const response = await apiClient<ApiSuccess<TeacherAttendanceResponse>>(
        `/api/teacher/attendance?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateTeacherAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      courseId: string;
      date: string;
      status: "PRESENT" | "ABSENT" | "LATE";
    }) => {
      const response = await apiClient<ApiSuccess<TeacherAttendance>>("/api/teacher/attendance", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTeacherAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      status?: "PRESENT" | "ABSENT" | "LATE";
      date?: string;
    }) => {
      const response = await apiClient<ApiSuccess<TeacherAttendance>>(
        `/api/teacher/attendance/${data.id}`,
        {
          method: "PATCH",
          body: {
            status: data.status,
            date: data.date,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
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

export function useDeleteTeacherAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ApiSuccess<{ id: string }>>(
        `/api/teacher/attendance/${id}`,
        { method: "DELETE" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
      toast({
        title: "Success",
        description: "Attendance deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete attendance",
        variant: "destructive",
      });
    },
  });
}

// Teacher Assignment Types
export interface TeacherAssignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
    code: string;
  };
  _count?: {
    submissions: number;
  };
}

export interface TeacherAssignmentsResponse {
  items: TeacherAssignment[];
  total: number;
  limit: number;
  skip: number;
}

// Teacher Assignment Hooks
export function useTeacherAssignments(params?: { 
  courseId?: string; 
  limit?: number; 
  skip?: number;
}) {
  return useQuery({
    queryKey: ["teacher", "assignments", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.courseId) searchParams.set("courseId", params.courseId);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.skip) searchParams.set("skip", String(params.skip));
      
      const response = await apiClient<ApiSuccess<TeacherAssignmentsResponse>>(
        `/api/teacher/assignments?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

export function useCreateTeacherAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      dueDate: string;
      courseId: string;
    }) => {
      const response = await apiClient<ApiSuccess<TeacherAssignment>>("/api/teacher/assignments", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "assignments"] });
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

export function useUpdateTeacherAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      description?: string;
      dueDate?: string;
    }) => {
      const response = await apiClient<ApiSuccess<TeacherAssignment>>(
        `/api/teacher/assignments/${data.id}`,
        {
          method: "PATCH",
          body: {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "assignments"] });
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTeacherAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient<ApiSuccess<{ id: string }>>(
        `/api/teacher/assignments/${id}`,
        { method: "DELETE" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "assignments"] });
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive",
      });
    },
  });
}

// Teacher Student Types
export interface TeacherStudent {
  id: string;
  userId: string;
  studentId: string;
  name: string;
  email: string;
  enrollmentNo: string;
  semester: number;
  section?: string;
  status: 'Active' | 'At Risk' | 'Inactive';
  grade: string;
  attendance: number;
  progress: number;
  averageGrade?: number;
  latestGpa?: number;
  completedAssignments: number;
  totalAssignments: number;
  courses: Array<{
    id: string;
    title: string;
    code: string;
  }>;
  lastActive?: string;
}

export interface TeacherStudentsResponse {
  items: TeacherStudent[];
  total: number;
  limit: number;
  skip: number;
}

// Teacher Students Hooks
export function useTeacherStudents(params?: {
  courseId?: string;
  limit?: number;
  skip?: number;
}) {
  return useQuery({
    queryKey: ['teacher', 'students', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.courseId) searchParams.set('courseId', params.courseId);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.skip) searchParams.set('skip', String(params.skip));

      const response = await apiClient<ApiSuccess<TeacherStudentsResponse>>(
        `/api/teacher/students?${searchParams.toString()}`
      );
      return response.data;
    },
  });
}

// Teacher Reports Types
export interface TeacherReportsStudent {
  id: string;
  name: string;
  email: string;
  enrollmentNo: string;
  semester: number;
  latestGpa?: number;
  latestSemester?: number;
  remarks?: string;
  attendanceRate: number;
  averageGrade?: number;
  coursesEnrolled: number;
}

export interface TeacherReportsResponse {
  courses: Array<{
    id: string;
    title: string;
    code: string;
  }>;
  students: TeacherReportsStudent[];
  summary: {
    totalStudents: number;
    totalCourses: number;
  };
}

// Teacher Reports Hooks
export function useTeacherReports() {
  return useQuery({
    queryKey: ['teacher', 'reports'],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<TeacherReportsResponse>>(
        '/api/teacher/reports'
      );
      return response.data;
    },
  });
}

// Teacher Submissions Hooks
export function useTeacherSubmissions(assignmentId?: string) {
  return useQuery({
    queryKey: ["teacher", "submissions", assignmentId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (assignmentId) searchParams.set("assignmentId", assignmentId);
      
      const response = await apiClient<ApiSuccess<TeacherSubmissionsResponse>>(
        `/api/teacher/submissions?${searchParams.toString()}`
      );
      return response.data;
    },
    enabled: !!assignmentId,
  });
}

export function useGradeTeacherSubmission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      grade: number;
      feedback?: string;
    }) => {
      const response = await apiClient<ApiSuccess<TeacherSubmission>>(
        `/api/teacher/submissions/${data.id}`,
        {
          method: "PATCH",
          body: { grade: data.grade, feedback: data.feedback },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "submissions"] });
      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
        variant: "destructive",
      });
    },
  });
}

// Teacher Leave Request Hook
export function useUpdateTeacherLeaveRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      const response = await apiClient<ApiSuccess<any>>(`/api/teacher/leave-requests/${data.id}`, {
        method: "PATCH",
        body: { status: data.status },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "leave-requests"] });
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

// Teacher Dashboard Hook
export interface TeacherDashboardStats {
  totalClasses: number;
  activeStudents: number;
  assignmentsGiven: number;
  attendanceRate: number;
}

export interface TeacherDashboardResponse {
  stats: TeacherDashboardStats;
  attendanceTrend: Array<{
    month: string;
    users: number;
  }>;
  studentPerformance: Array<{
    course: string;
    enrollments: number;
    completions: number;
    progress: number;
  }>;
  upcomingClasses: Array<{
    id: string;
    subject: string;
    time: string;
    date: string;
    students: number;
    room: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    icon: string;
  }>;
}

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["teacher", "dashboard"],
    queryFn: async () => {
      const response = await apiClient<ApiSuccess<TeacherDashboardResponse>>(
        "/api/teacher/dashboard"
      );
      return response.data;
    },
  });
}

