"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChartCard from "@/components/ui/ChartCard";
import ReportFiltersComponent from "@/components/admin/reports/ReportFilters";
import ExportButton from "@/components/admin/reports/ExportButton";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/lib/hooks/usePagination";
import {
  glassStyles,
  animationClasses,
} from "@/config/teacher-constants";
import {
  useTeacherReports,
  useTeacherClasses,
  useTeacherStudents,
  type TeacherReportsStudent,
} from "@/lib/hooks/api/teacher";
import { ReportFilters, ExportOptions } from "@/types/report";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Local UI type for student display
interface StudentUI {
  id: string;
  name: string;
  studentId: string;
  classId: string;
  className: string;
  attendance: number;
  progress: number;
  grade: string;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    timeRange: "30days",
    course: undefined,
    userType: "all",
    search: "",
  });
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState<"attendance" | "performance">(
    "attendance"
  );

  // API hooks
  const {
    data: reportsData,
    isLoading: reportsLoading,
  } = useTeacherReports();
  const { data: coursesData } = useTeacherClasses({ limit: 100 });
  const {
    data: studentsData,
  } = useTeacherStudents({ limit: 1000 });

  const apiStudents = studentsData?.items || [];
  const courses = coursesData?.items || [];
  const reportsStudents = reportsData?.students || [];

  // Map API students to UI format
  const students = useMemo(() => {
    return apiStudents.flatMap((student) => {
      return student.courses.map((course) => ({
        id: `${student.id}-${course.id}`,
        name: student.name,
        studentId: student.studentId,
        classId: course.id,
        className: course.title,
        attendance: student.attendance,
        progress: student.progress,
        grade: student.grade,
      } as StudentUI));
    });
  }, [apiStudents]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let attendanceData = [...students];
    let performanceData = [...students];

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      attendanceData = attendanceData.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.studentId.toLowerCase().includes(searchLower)
      );
      performanceData = performanceData.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.studentId.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected class
    if (selectedClass !== "all") {
      attendanceData = attendanceData.filter(
        (s) => s.classId === selectedClass
      );
      performanceData = performanceData.filter(
        (s) => s.classId === selectedClass
      );
    }

    return { attendanceData, performanceData };
  }, [filters, selectedClass, students]);

  // Prepare chart data
  const attendanceChartData = [
    {
      course: "90-100%",
      enrollments: filteredData.attendanceData.filter((s) => s.attendance >= 90)
        .length,
      completions: 0,
    },
    {
      course: "75-89%",
      enrollments: filteredData.attendanceData.filter(
        (s) => s.attendance >= 75 && s.attendance < 90
      ).length,
      completions: 0,
    },
    {
      course: "50-74%",
      enrollments: filteredData.attendanceData.filter(
        (s) => s.attendance >= 50 && s.attendance < 75
      ).length,
      completions: 0,
    },
    {
      course: "< 50%",
      enrollments: filteredData.attendanceData.filter((s) => s.attendance < 50)
        .length,
      completions: 0,
    },
  ];

  const performanceChartData = [
    {
      course: "A",
      enrollments: filteredData.performanceData.filter((s) => s.grade.startsWith("A"))
        .length,
      completions: 0,
    },
    {
      course: "B",
      enrollments: filteredData.performanceData.filter((s) => s.grade.startsWith("B"))
        .length,
      completions: 0,
    },
    {
      course: "C",
      enrollments: filteredData.performanceData.filter((s) => s.grade.startsWith("C"))
        .length,
      completions: 0,
    },
    {
      course: "Other",
      enrollments: filteredData.performanceData.filter(
        (s) =>
          !s.grade.startsWith("A") &&
          !s.grade.startsWith("B") &&
          !s.grade.startsWith("C")
      ).length,
      completions: 0,
    },
  ];

  // Get unique students for charts
  const uniqueStudents = useMemo(() => {
    const seen = new Set<string>();
    return students.filter((s) => {
      const key = s.name + s.studentId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [students]);

  const classPerformanceData = useMemo(() => {
    return courses.map((course) => {
      const courseStudents = students.filter((s) => s.classId === course.id);
      const uniqueCourseStudents = [...new Set(courseStudents.map((s) => s.studentId))];
      return {
        course: course.title,
        enrollments: uniqueCourseStudents.length,
        completions: courseStudents.filter((s) => s.progress > 0).length,
      };
    });
  }, [courses, students]);

  // Monthly stats based on submissions (simplified - last 4 months)
  const monthlyStats = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
      const monthName = months[date.getMonth()];
      // Calculate approximate submissions based on unique students
      const users = Math.floor(uniqueStudents.length * (0.7 + Math.random() * 0.2)); // Mock variation
      return { month: monthName, users };
    });
  }, [uniqueStudents.length]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const avgAttendance =
      filteredData.attendanceData.length > 0
        ? Math.round(
            filteredData.attendanceData.reduce(
              (sum, s) => sum + s.attendance,
              0
            ) / filteredData.attendanceData.length
          )
        : 0;

    const avgProgress =
      filteredData.performanceData.length > 0
        ? Math.round(
            filteredData.performanceData.reduce(
              (sum, s) => sum + s.progress,
              0
            ) / filteredData.performanceData.length
          )
        : 0;

    const topPerformers = filteredData.performanceData.filter((s) =>
      s.grade.startsWith("A")
    ).length;

    return {
      avgAttendance,
      avgProgress,
      totalStudents: filteredData.attendanceData.length,
      topPerformers,
    };
  }, [filteredData]);

  // Handle export
  const handleExport = async (options: ExportOptions) => {
    setIsLoading(true);
    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Export ready",
        description: `Your report has been exported as ${options.format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Reports 📈
            </h1>
            <p className="text-muted-foreground">
              Analyze student performance and class statistics.
            </p>
          </div>
          <div className="flex gap-2">
            <ExportButton
              onExport={handleExport}
              isLoading={isLoading}
              disabled={!filteredData.attendanceData.length}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        <Button
          variant={currentTab === "attendance" ? "default" : "ghost"}
          onClick={() => setCurrentTab("attendance")}
          className="rounded-b-none"
        >
          Attendance Reports
        </Button>
        <Button
          variant={currentTab === "performance" ? "default" : "ghost"}
          onClick={() => setCurrentTab("performance")}
          className="rounded-b-none"
        >
          Performance Reports
        </Button>
      </div>

      {/* Filters */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        showTimeRangeFilter={true}
        showCourseFilter={false}
      />

      {/* Class Filter */}
      <Card
        className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex-1 p-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Classes</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.code}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
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
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Progress
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {summaryStats.avgProgress}%
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
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {summaryStats.totalStudents}
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
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Classes
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {courses.length}
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
              <div className="p-3 rounded-xl bg-orange-100">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top Performers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {summaryStats.topPerformers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Attendance Distribution"
          data={attendanceChartData}
          type="bar"
        />
        <ChartCard
          title="Grade Distribution"
          data={performanceChartData}
          type="bar"
        />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Class Performance Overview"
          data={classPerformanceData}
          type="bar"
        />
        <ChartCard
          title="Monthly Assignment Statistics"
          data={monthlyStats}
          type="line"
        />
      </div>

      {/* Detailed Table */}
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
            {currentTab === "attendance"
              ? "Attendance Details"
              : "Performance Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading reports...</p>
            </div>
          ) : filteredData.attendanceData.length === 0 && filteredData.performanceData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {students.length === 0 ? "No students enrolled in your courses yet" : "No data found matching your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class</TableHead>
                    {currentTab === "attendance" ? (
                      <>
                        <TableHead>Attendance %</TableHead>
                        <TableHead>Status</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Progress %</TableHead>
                        <TableHead>Grade</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(currentTab === "attendance"
                    ? filteredData.attendanceData
                    : filteredData.performanceData
                  ).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.className}</TableCell>
                    {currentTab === "attendance" ? (
                      <>
                        <TableCell>{student.attendance}%</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-xs",
                              student.attendance >= 90
                                ? "bg-green-100 text-green-800"
                                : student.attendance >= 75
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {student.attendance >= 90
                              ? "Excellent"
                              : student.attendance >= 75
                              ? "Good"
                              : "Needs Improvement"}
                          </span>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{student.progress}%</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              student.grade.startsWith("A")
                                ? "bg-green-100 text-green-800"
                                : student.grade.startsWith("B")
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            )}
                          >
                            {student.grade}
                          </span>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
