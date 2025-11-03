"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  glassStyles,
  animationClasses,
} from "@/config/teacher-constants";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Save,
  Loader2,
  Edit,
  Trash2,
  History,
  CheckSquare,
  Square,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useTeacherAttendance,
  useCreateTeacherAttendance,
  useUpdateTeacherAttendance,
  useDeleteTeacherAttendance,
  useTeacherClasses,
  type TeacherClass,
} from "@/lib/hooks/api/teacher";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ApiSuccess } from "@/lib/api/response";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
}

interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  enrollmentNo: string;
  semester: number;
  section: string;
  attendanceStatus?: "PRESENT" | "ABSENT" | "LATE";
  attendanceRecordId?: string; // ID of existing attendance record
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export default function AttendancePage() {
  const { toast } = useToast();
  const { data: session } = useSession();

  const queryClient = useQueryClient();
  
  // API hooks
  const { data: coursesData, isLoading: coursesLoading } = useTeacherClasses({ limit: 100 });
  const createAttendance = useCreateTeacherAttendance();
  const updateAttendance = useUpdateTeacherAttendance();
  const deleteAttendance = useDeleteTeacherAttendance();
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // Map API courses to Course format
  const courses = useMemo(() => {
    return (coursesData?.items || []).map((course: TeacherClass) => ({
      id: course.id,
      title: course.title,
      code: course.code,
      description: course.description,
    }));
  }, [coursesData]);

  // Fetch students for selected course
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourseId) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient<{ success: boolean; data?: { students: any[] } }>(
          `/api/courses/${selectedCourseId}/students`
        );
        
        if (response.success && response.data?.students) {
          // Map API response to Student format
          const studentsWithStatus = response.data.students.map((s: any) => ({
            id: s.id,
            userId: s.user?.id || s.userId || "",
            name: s.user?.name || s.name || "Unknown",
            email: s.user?.email || s.email || "",
            enrollmentNo: s.enrollmentNo || s.studentId || "",
            semester: s.semester || 1,
            section: s.section || "",
            attendanceStatus: "PRESENT" as const,
          }));
          setStudents(studentsWithStatus);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students",
        });
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourseId) {
      fetchStudents();
    }
  }, [selectedCourseId, toast]);

  // Fetch existing attendance for selected date and course
  const { data: attendanceData, refetch: refetchAttendance } = useTeacherAttendance({
    courseId: selectedCourseId || undefined,
    limit: 1000, // Get all attendance for the course
  });

  // Load existing attendance for selected date
  useEffect(() => {
    if (!selectedCourseId || !selectedDate || students.length === 0 || !attendanceData) return;

    // Filter attendance for the selected date (normalize date comparison)
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    const selectedDateStr = selectedDateObj.toISOString().split("T")[0];

    const dateAttendance = attendanceData.items.filter((att) => {
      const attDate = new Date(att.date);
      attDate.setHours(0, 0, 0, 0);
      const attDateStr = attDate.toISOString().split("T")[0];
      return attDateStr === selectedDateStr;
    });


    // Map existing attendance records by student ID
    const attendanceMap = new Map(
      dateAttendance.map((att) => [att.studentId, att])
    );

    // Update student statuses based on existing attendance from database
    setStudents((prev) =>
      prev.map((student) => {
        const existing = attendanceMap.get(student.id);
        if (existing) {
          return {
            ...student,
            attendanceStatus: existing.status as "PRESENT" | "ABSENT" | "LATE",
            attendanceRecordId: existing.id, // Store record ID for update/delete
          };
        }
        // Reset to default if no existing record found
        return {
          ...student,
          attendanceStatus: "PRESENT" as const,
          attendanceRecordId: undefined,
        };
      })
    );
  }, [selectedCourseId, selectedDate, students.length, attendanceData]);

  // Auto-select first course
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Paginate filtered students
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCourseId, selectedDate]);

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const handleStatusChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE"
  ) => {
    // Update local state immediately for UI responsiveness
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, attendanceStatus: status }
          : student
      )
    );
    
    // Optionally auto-save to database
    // Uncomment below if you want auto-save on status change
    /*
    if (selectedCourseId) {
      const student = students.find((s) => s.id === studentId);
      if (student) {
        createAttendance.mutateAsync({
          courseId: selectedCourseId,
          studentId: student.id,
          status,
          date: selectedDate,
        }).catch((error) => {
          console.error("Error auto-saving attendance:", error);
        });
      }
    }
    */
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "LATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle className="h-4 w-4" />;
      case "ABSENT":
        return <XCircle className="h-4 w-4" />;
      case "LATE":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const presentCount = students.filter(
    (s) => s.attendanceStatus === "PRESENT"
  ).length;
  const absentCount = students.filter(
    (s) => s.attendanceStatus === "ABSENT"
  ).length;
  const lateCount = students.filter(
    (s) => s.attendanceStatus === "LATE"
  ).length;
  const totalStudents = students.length;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Prepare chart data
  const chartData = [
    {
      name: "Attendance",
      Present: presentCount,
      Absent: absentCount,
      Late: lateCount,
    },
  ];

  // Handle save attendance (upsert - create or update)
  const handleSaveAttendance = async () => {
    if (!selectedCourseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a course",
      });
      return;
    }

    if (students.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No students to mark attendance for",
      });
      return;
    }

    setLoading(true);
    try {
      // Mark attendance for all students - POST endpoint handles upsert
      // Use direct API call to avoid toast spam from mutation hooks
      const promises = students.map(async (student) => {
        const status = student.attendanceStatus || "PRESENT";
        
        try {
          // Call API directly to have better control over the response
          const response = await apiClient<ApiSuccess<any>>("/api/teacher/attendance", {
            method: "POST",
            body: {
              courseId: selectedCourseId,
              studentId: student.id,
              status,
              date: selectedDate,
            },
          });
          
          // apiClient returns the full response which is ApiSuccess<Attendance>
          // So response.data contains the attendance object
          return response.data;
        } catch (error) {
          console.error(`Failed to save attendance for student ${student.id}:`, error);
          throw error;
        }
      });

      const results = await Promise.allSettled(promises);
      
      // Check for errors
      const errors = results.filter((r) => r.status === "rejected");
      if (errors.length > 0) {
        console.error("Some attendance records failed to save:", errors);
        errors.forEach((error) => {
          if (error.status === "rejected") {
            console.error("Error details:", error.reason);
          }
        });
      }
      
      // Update local state with returned attendance record IDs
      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => {
          const result = (r as PromiseFulfilledResult<any>).value;
          // The API returns { success: true, data: attendanceObject }
          // apiClient unwraps it, so result is the attendance object directly
          return result;
        })
        .filter(Boolean); // Filter out any null/undefined values

      // Invalidate and refetch attendance data immediately
      await queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
      
      // Refetch attendance to get fresh data from database
      const freshAttendanceResponse = await refetchAttendance();
      const freshAttendanceData = freshAttendanceResponse.data;
      
      // Update students list with fresh data from database to ensure sync
      if (freshAttendanceData && freshAttendanceData.items) {
        const selectedDateObj = new Date(selectedDate);
        selectedDateObj.setHours(0, 0, 0, 0);
        const selectedDateStr = selectedDateObj.toISOString().split("T")[0];
        
        const dateAttendance = freshAttendanceData.items.filter((att: any) => {
          const attDate = new Date(att.date);
          attDate.setHours(0, 0, 0, 0);
          const attDateStr = attDate.toISOString().split("T")[0];
          return attDateStr === selectedDateStr;
        });
        
        const attendanceMap = new Map(
          dateAttendance.map((att: any) => [att.studentId, att])
        );
        
        // Update students with fresh data from database - this ensures UI is synced
        setStudents((prev) =>
          prev.map((student) => {
            const existing = attendanceMap.get(student.id);
            if (existing) {
              return {
                ...student,
                attendanceStatus: existing.status as "PRESENT" | "ABSENT" | "LATE",
                attendanceRecordId: existing.id,
              };
            }
            // If no existing record, reset to default
            return {
              ...student,
              attendanceStatus: "PRESENT" as const,
              attendanceRecordId: undefined,
            };
          })
        );
      }
      
      if (errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: `Saved ${successful.length} of ${students.length} students. ${errors.length} failed.`,
        });
      } else {
        toast({
          title: "Success",
          description: `Attendance saved for ${successful.length} student(s)`,
        });
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save attendance. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (status: "PRESENT" | "ABSENT" | "LATE") => {
    if (selectedStudents.size === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one student",
      });
      return;
    }

    if (!selectedCourseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a course",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedCount = selectedStudents.size;
      const promises = Array.from(selectedStudents).map(async (studentId) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return null;

        // Always use POST endpoint which handles upsert - call API directly
        const response = await apiClient<ApiSuccess<any>>("/api/teacher/attendance", {
          method: "POST",
          body: {
            courseId: selectedCourseId,
            studentId: student.id,
            status,
            date: selectedDate,
          },
        });
        return response.data;
      });

      const results = await Promise.allSettled(promises.filter(Boolean));
      
      // Check for errors
      const errors = results.filter((r) => r.status === "rejected");
      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<any>).value);

      // Update local state with returned data
      setStudents((prev) =>
        prev.map((student) => {
          if (selectedStudents.has(student.id)) {
            const result = successful.find(
              (r) => r && r.studentId === student.id
            );
            if (result) {
              return {
                ...student,
                attendanceStatus: status,
                attendanceRecordId: result.id,
              };
            }
            return {
              ...student,
              attendanceStatus: status,
            };
          }
          return student;
        })
      );

      // Clear selection
      setSelectedStudents(new Set());
      
      // Refetch attendance data to sync with database
      await queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
      await refetchAttendance();
      
      toast({
        title: "Success",
        description: `Marked ${successful.length} student(s) as ${status}`,
      });
    } catch (error) {
      console.error("Error in bulk action:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update attendance. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete attendance record
  const handleDeleteAttendance = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student || !student.attendanceRecordId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No attendance record found to delete",
      });
      return;
    }

    try {
      await deleteAttendance.mutateAsync(student.attendanceRecordId);
      
      // Update local state - remove record ID and reset status
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, attendanceStatus: "PRESENT" as const, attendanceRecordId: undefined }
            : s
        )
      );
      
      // Refetch attendance data to sync with database
      await queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
      await refetchAttendance();
      
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete attendance. Please try again.",
      });
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Select all students
  const selectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  // Handle export
  const handleExport = () => {
    toast({
      title: "Exporting",
      description: "Downloading attendance report...",
    });
    // In a real app, this would generate and download a CSV/PDF
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Attendance 📊
            </h1>
            <p className="text-muted-foreground">
              Mark and track student attendance for your classes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Hide History" : "Show History"}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleSaveAttendance} disabled={loading || !selectedCourseId || students.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label>Course</Label>
            <Select
              value={selectedCourseId}
              onValueChange={(val) => setSelectedCourseId(val)}
              disabled={coursesLoading || courses.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title} - {course.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Search Students</Label>
            <Input
              withSearchIcon={true}
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Present Today
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {presentCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Late
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {lateCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {attendanceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Attendance Overview - {selectedCourse?.title || "No Course Selected"} (
            {new Date(selectedDate).toLocaleDateString()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(226, 232, 240, 0.3)"
              />
              <XAxis
                dataKey="name"
                stroke="rgba(100, 116, 139, 0.8)"
                fontSize={12}
              />
              <YAxis stroke="rgba(100, 116, 139, 0.8)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(226, 232, 240, 0.5)",
                  borderRadius: "8px",
                  backdropFilter: "blur(8px)",
                }}
              />
              <Legend />
              <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedStudents.size > 0 && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedStudents.size} student(s) selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("PRESENT")}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("ABSENT")}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark All Absent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("LATE")}
                  disabled={loading}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark All Late
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudents(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Attendance Table */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Student Attendance - {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
            {filteredStudents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllStudents}
              >
                {selectedStudents.size === filteredStudents.length ? (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {students.length === 0 ? "No students enrolled in this course" : "No students found"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-12">
                        <input
                          type="checkbox"
                          checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                          onChange={selectAllStudents}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Student ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className={cn(
                        "border-b border-border/30 hover:bg-muted/30 transition-colors duration-200",
                        selectedStudents.has(student.id) && "bg-primary/5"
                      )}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {student.enrollmentNo}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs flex items-center gap-1 w-fit",
                            getStatusColor(student.attendanceStatus)
                          )}
                        >
                          {getStatusIcon(student.attendanceStatus)}
                          {student.attendanceStatus || "PRESENT"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              handleStatusChange(student.id, "PRESENT")
                            }
                            disabled={student.attendanceStatus === "PRESENT"}
                          >
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              handleStatusChange(student.id, "ABSENT")
                            }
                            disabled={student.attendanceStatus === "ABSENT"}
                          >
                            Absent
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              handleStatusChange(student.id, "LATE")
                            }
                            disabled={student.attendanceStatus === "LATE"}
                          >
                            Late
                          </Button>
                          {student.attendanceRecordId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAttendance(student.id)}
                              disabled={deleteAttendance.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between px-4 pb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredStudents.length)} of {filteredStudents.length} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={(currentPage + 1) * pageSize >= filteredStudents.length}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
      {showHistory && attendanceData && (
        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Attendance History - {selectedCourse?.title || "All Courses"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.items.slice(0, 50).map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                      >
                        <td className="py-3 px-4 text-sm">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">
                          {record.student?.user?.name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {record.course?.title || "Unknown"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs flex items-center gap-1 w-fit",
                              getStatusColor(record.status)
                            )}
                          >
                            {getStatusIcon(record.status)}
                            {record.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const newStatus = record.status === "PRESENT" ? "ABSENT" : "PRESENT";
                                try {
                                  await updateAttendance.mutateAsync({
                                    id: record.id,
                                    status: newStatus,
                                  });
                                  await queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
                                  await refetchAttendance();
                                } catch (error) {
                                  console.error("Error updating attendance:", error);
                                }
                              }}
                              disabled={updateAttendance.isPending}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={async () => {
                                try {
                                  await deleteAttendance.mutateAsync(record.id);
                                  await queryClient.invalidateQueries({ queryKey: ["teacher", "attendance"] });
                                  await refetchAttendance();
                                } catch (error) {
                                  console.error("Error deleting attendance:", error);
                                }
                              }}
                              disabled={deleteAttendance.isPending}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
