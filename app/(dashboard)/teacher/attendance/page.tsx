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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useTeacherAttendance,
  useCreateTeacherAttendance,
  useTeacherClasses,
  type TeacherClass,
} from "@/lib/hooks/api/teacher";
import { apiClient } from "@/lib/apiClient";
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

  // API hooks
  const { data: coursesData, isLoading: coursesLoading } = useTeacherClasses({ limit: 100 });
  const createAttendance = useCreateTeacherAttendance();
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

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

    // Filter attendance for the selected date
    const dateAttendance = attendanceData.items.filter((att) => {
      const attDate = new Date(att.date).toISOString().split("T")[0];
      return attDate === selectedDate;
    });

    // Update student statuses based on existing attendance
    setStudents((prev) =>
      prev.map((student) => {
        const existing = dateAttendance.find((att) => att.studentId === student.id);
        return {
          ...student,
          attendanceStatus: existing ? existing.status : ("PRESENT" as const),
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

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const handleStatusChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE"
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, attendanceStatus: status }
          : student
      )
    );
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

  // Handle save attendance
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

    try {
      // Mark attendance for all students using the mutation hook
      const promises = students.map((student) =>
        createAttendance.mutateAsync({
          courseId: selectedCourseId,
          studentId: student.id,
          status: student.attendanceStatus || "PRESENT",
          date: selectedDate,
        })
      );

      await Promise.allSettled(promises);
      
      // Refetch attendance data
      await refetchAttendance();
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error("Error saving attendance:", error);
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
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleSaveAttendance} disabled={createAttendance.isPending || !selectedCourseId || students.length === 0}>
              {createAttendance.isPending ? (
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
          <CardTitle className="text-lg font-semibold text-foreground">
            Student Attendance - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
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
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                    >
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
    </div>
  );
}
