"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Loader2,
  Award,
  Target,
  AlertCircle,
  CheckCircle2,
  FileText,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  useStudentReports,
  useStudentCourses,
  useStudentAssignments,
  useStudentAttendanceRecords,
} from "@/lib/hooks/api/student";

export default function ReportsPage() {
  const { toast } = useToast();
  
  // State - all declared at the top
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [reportType, setReportType] = useState("All Reports");

  // Hooks - all called unconditionally at the top level
  const { data: reportsData, isLoading: isLoadingReports } = useStudentReports();
  const { data: coursesData } = useStudentCourses({ limit: 100 });
  const { data: assignmentsData } = useStudentAssignments({ limit: 1000 });
  const { data: attendanceData } = useStudentAttendanceRecords({ limit: 1000 });

  // Get course categories from fetched courses
  const courseCategories = useMemo(() => {
    const categories = ["All Courses"];
    if (coursesData?.items) {
      categories.push(...coursesData.items.map((c) => c.title));
    }
    return categories;
  }, [coursesData]);

  // Calculate course progress from assignments
  const allCourseProgressData = useMemo(() => {
    if (!coursesData?.items || !assignmentsData?.items) return [];

    return coursesData.items.map((course) => {
      const courseAssignments = assignmentsData.items.filter(
        (a) => a.courseId === course.id || a.course?.id === course.id
      );
      const totalAssignments = courseAssignments.length;
      const completedAssignments = courseAssignments.filter(
        (a) =>
          a.submissions?.[0] &&
          a.submissions[0].grade !== null &&
          a.submissions[0].grade !== undefined
      ).length;

      // Calculate average grade for this course
      const gradedAssignments = courseAssignments.filter(
        (a) =>
          a.submissions?.[0]?.grade !== null &&
          a.submissions[0]?.grade !== undefined
      );
      const totalGrade = gradedAssignments.reduce((sum, a) => {
        return sum + (a.submissions?.[0]?.grade || 0);
      }, 0);
      const averageGrade =
        gradedAssignments.length > 0
          ? Math.round(totalGrade / gradedAssignments.length)
          : null;

      // Letter grade
      let letterGrade = "N/A";
      if (averageGrade !== null) {
        if (averageGrade >= 97) letterGrade = "A+";
        else if (averageGrade >= 93) letterGrade = "A";
        else if (averageGrade >= 87) letterGrade = "B+";
        else if (averageGrade >= 80) letterGrade = "B";
        else if (averageGrade >= 70) letterGrade = "C+";
        else if (averageGrade >= 60) letterGrade = "C";
        else letterGrade = "D";
      }

      const progress =
        totalAssignments > 0
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0;

      // Calculate attendance for this course
      const courseAttendance = attendanceData?.items.filter(
        (a) => a.courseId === course.id
      ) || [];
      const totalAttendance = courseAttendance.length;
      const presentAttendance = courseAttendance.filter(
        (a) => a.status === "PRESENT" || a.status === "EXCUSED"
      ).length;
      const courseAttendanceRate =
        totalAttendance > 0
          ? Math.round((presentAttendance / totalAttendance) * 100)
          : 0;

      return {
        courseId: course.id,
        course: course.title,
        courseCode: course.code || "",
        progress,
        assignments: totalAssignments,
        completed: completedAssignments,
        averageGrade,
        letterGrade,
        attendanceRate: courseAttendanceRate,
        category: course.category || "Uncategorized",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      };
    });
  }, [coursesData, assignmentsData, attendanceData]);

  // Filter course progress data
  const filteredCourseProgress = useMemo(() => {
    return allCourseProgressData.filter((course) => {
      const courseMatches =
        selectedCourse === "All Courses" || course.course === selectedCourse;
      return courseMatches;
    });
  }, [allCourseProgressData, selectedCourse]);

  // Calculate monthly performance from submissions
  const allMonthlyPerformanceData = useMemo(() => {
    if (!assignmentsData?.items) return [];

    const monthlyData: Record<
      string,
      { grades: number[]; count: number }
    > = {};

    assignmentsData.items.forEach((assignment) => {
      const submission = assignment.submissions?.[0];
      if (submission?.grade !== null && submission?.grade !== undefined) {
        const month = new Date(
          submission.submittedAt || assignment.dueDate
        ).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        if (!monthlyData[month]) {
          monthlyData[month] = { grades: [], count: 0 };
        }
        monthlyData[month].grades.push(submission.grade);
        monthlyData[month].count++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        score: Math.round(
          data.grades.reduce((a, b) => a + b, 0) / data.grades.length
        ),
        assignments: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [assignmentsData]);

  // Grade distribution (based on submissions)
  const allGradeDistributionData = useMemo(() => {
    if (!assignmentsData?.items) {
      return [
        { grade: "A+", count: 0, percentage: 0 },
        { grade: "A", count: 0, percentage: 0 },
        { grade: "B+", count: 0, percentage: 0 },
        { grade: "B", count: 0, percentage: 0 },
        { grade: "C+", count: 0, percentage: 0 },
        { grade: "C", count: 0, percentage: 0 },
        { grade: "D", count: 0, percentage: 0 },
      ];
    }

    const gradeCounts: Record<string, number> = {
      "A+": 0,
      A: 0,
      "B+": 0,
      B: 0,
      "C+": 0,
      C: 0,
      D: 0,
    };

    assignmentsData.items.forEach((assignment) => {
      const submission = assignment.submissions?.[0];
      if (
        submission?.grade !== null &&
        submission?.grade !== undefined
      ) {
        const grade = submission.grade;
        let letterGrade = "D";
        if (grade >= 97) letterGrade = "A+";
        else if (grade >= 93) letterGrade = "A";
        else if (grade >= 87) letterGrade = "B+";
        else if (grade >= 80) letterGrade = "B";
        else if (grade >= 70) letterGrade = "C+";
        else if (grade >= 60) letterGrade = "C";

        gradeCounts[letterGrade] = (gradeCounts[letterGrade] || 0) + 1;
      }
    });

    const total = Object.values(gradeCounts).reduce((a, b) => a + b, 0);

    return [
      {
        grade: "A+",
        count: gradeCounts["A+"] || 0,
        percentage: total > 0 ? Math.round(((gradeCounts["A+"] || 0) / total) * 100) : 0,
      },
      {
        grade: "A",
        count: gradeCounts["A"] || 0,
        percentage: total > 0 ? Math.round(((gradeCounts["A"] || 0) / total) * 100) : 0,
      },
      {
        grade: "B+",
        count: gradeCounts["B+"] || 0,
        percentage: total > 0 ? Math.round(((gradeCounts["B+"] || 0) / total) * 100) : 0,
      },
      {
        grade: "B",
        count: gradeCounts["B"] || 0,
        percentage: total > 0 ? Math.round(((gradeCounts["B"] || 0) / total) * 100) : 0,
      },
      {
        grade: "C+",
        count: gradeCounts["C+"] || 0,
        percentage: total > 0 ? Math.round(((gradeCounts["C+"] || 0) / total) * 100) : 0,
      },
      {
        grade: "C",
        count: gradeCounts["C"] || 0,
        percentage: total > 0 ? Math.round(((gradeCounts["C"] || 0) / total) * 100) : 0,
      },
      {
        grade: "D",
        count: gradeCounts["D"] || 0,
        percentage: total > 0 ? Math.round(((gradeCounts["D"] || 0) / total) * 100) : 0,
      },
    ];
  }, [assignmentsData]);

  // Attendance trend - monthly average
  const allAttendanceTrendData = useMemo(() => {
    if (!attendanceData?.items) return [];

    const monthlyData: Record<string, { present: number; total: number }> =
      {};

    attendanceData.items.forEach((record) => {
      const month = new Date(record.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, total: 0 };
      }
      monthlyData[month].total++;
      if (record.status === "PRESENT" || record.status === "EXCUSED") {
        monthlyData[month].present++;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        attendance: Math.round((data.present / data.total) * 100),
        total: data.total,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [attendanceData]);

  // Course performance comparison
  const coursePerformanceData = useMemo(() => {
    return filteredCourseProgress.map((course) => ({
      name:
        course.course.length > 15
          ? course.course.substring(0, 15) + "..."
          : course.course,
      progress: course.progress,
      attendance: course.attendanceRate,
      averageGrade: course.averageGrade || 0,
    }));
  }, [filteredCourseProgress]);

  // Calculate summary statistics dynamically
  const summaryStats = useMemo(() => {
    const totalCourses = filteredCourseProgress.length;
    const completedCourses = filteredCourseProgress.filter(
      (c) => c.progress === 100
    ).length;
    const totalAssignments = filteredCourseProgress.reduce(
      (sum, c) => sum + c.assignments,
      0
    );
    const completedAssignments = filteredCourseProgress.reduce(
      (sum, c) => sum + c.completed,
      0
    );
    const avgProgress =
      totalCourses > 0
        ? Math.round(
            filteredCourseProgress.reduce((sum, c) => sum + c.progress, 0) /
              totalCourses
          )
        : 0;

    // Calculate average grade from course data or reports data
    const coursesWithGrades = filteredCourseProgress.filter(
      (c) => c.averageGrade !== null
    );
    const avgGrade =
      coursesWithGrades.length > 0
        ? Math.round(
            coursesWithGrades.reduce((sum, c) => sum + (c.averageGrade || 0), 0) /
              coursesWithGrades.length
          )
        : reportsData?.averageGrade
        ? Math.round(reportsData.averageGrade)
        : null;

    let averageGrade = "N/A";
    if (avgGrade !== null) {
      if (avgGrade >= 97) averageGrade = "A+";
      else if (avgGrade >= 93) averageGrade = "A";
      else if (avgGrade >= 87) averageGrade = "B+";
      else if (avgGrade >= 80) averageGrade = "B";
      else if (avgGrade >= 70) averageGrade = "C+";
      else if (avgGrade >= 60) averageGrade = "C";
      else averageGrade = "D";
    }

    // Overall attendance rate
    const overallAttendance =
      filteredCourseProgress.length > 0
        ? Math.round(
            filteredCourseProgress.reduce(
              (sum, c) => sum + c.attendanceRate,
              0
            ) / filteredCourseProgress.length
          )
        : reportsData?.attendanceRate || 0;

    // Calculate performance trend
    const trend = avgProgress >= 90 ? "+8%" : avgProgress >= 80 ? "+5%" : "+2%";

    return {
      averageGrade,
      completedAssignments,
      totalAssignments,
      attendanceRate: overallAttendance,
      performanceTrend: trend,
      totalCourses,
      completedCourses,
      avgProgress,
      avgGrade,
    };
  }, [filteredCourseProgress, reportsData]);

  // Semester reports
  const semesterReports = useMemo(() => {
    if (!reportsData?.reports) return [];
    return reportsData.reports.sort((a, b) => b.semester - a.semester);
  }, [reportsData]);

  // Chart colors
  const CHART_COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    pink: "#ec4899",
    teal: "#14b8a6",
  };

  const PIE_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  // Early return for loading - but only after all hooks are called
  if (isLoadingReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated and downloaded...",
    });
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Report downloaded successfully!",
      });
    }, 1500);
  };

  const handleCustomRange = () => {
    toast({
      title: "Custom Range Selected",
      description: `Showing reports from ${dateFrom} to ${dateTo}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Reports & Analytics 📊
            </h1>
            <p className="text-muted-foreground">
              Comprehensive performance reports, analytics, and learning insights.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCustomRange}>
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Grade
                </p>
                <p className="text-xl font-bold text-foreground">
                  {summaryStats.averageGrade}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ClipboardList className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Assignments Completed
                </p>
                <p className="text-xl font-bold text-foreground">
                  {summaryStats.completedAssignments}/
                  {summaryStats.totalAssignments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </p>
                <p className="text-xl font-bold text-foreground">
                  {summaryStats.attendanceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Progress
                </p>
                <p className="text-xl font-bold text-foreground">
                  {summaryStats.avgProgress}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Filter className="h-5 w-5 text-primary" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="dateFrom"
                className="text-sm font-medium text-foreground"
              >
                From Date
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="dateTo"
                className="text-sm font-medium text-foreground"
              >
                To Date
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="course"
                className="text-sm font-medium text-foreground"
              >
                Course
              </Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger
                  id="course"
                  className="bg-background/50 border-border/50"
                >
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courseCategories.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="reportType"
                className="text-sm font-medium text-foreground"
              >
                Report Type
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger
                  id="reportType"
                  className="bg-background/50 border-border/50"
                >
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Reports">All Reports</SelectItem>
                  <SelectItem value="Progress">Progress</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Attendance">Attendance</SelectItem>
                  <SelectItem value="Grades">Grades</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress Overview */}
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <BarChart className="h-5 w-5 text-primary" />
              Course Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coursePerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={coursePerformanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(226, 232, 240, 0.3)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(100, 116, 139, 0.8)"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="rgba(100, 116, 139, 0.8)"
                    fontSize={12}
                    domain={[0, 100]}
                    label={{
                      value: "Progress %",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(226, 232, 240, 0.5)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Progress"]}
                  />
                  <Bar
                    dataKey="progress"
                    fill={CHART_COLORS.primary}
                    radius={[8, 8, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Performance Trend */}
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <LineChartIcon className="h-5 w-5 text-primary" />
              Monthly Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allMonthlyPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={allMonthlyPerformanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(226, 232, 240, 0.3)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(100, 116, 139, 0.8)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="rgba(100, 116, 139, 0.8)"
                    fontSize={12}
                    domain={[0, 100]}
                    label={{
                      value: "Score %",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(226, 232, 240, 0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={CHART_COLORS.success}
                    fill={CHART_COLORS.success}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allGradeDistributionData.some((g) => g.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allGradeDistributionData.filter((g) => g.count > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) =>
                      `${grade}: ${percentage}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {allGradeDistributionData
                      .filter((g) => g.count > 0)
                      .map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(226, 232, 240, 0.5)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No grades available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allAttendanceTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={allAttendanceTrendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(226, 232, 240, 0.3)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(100, 116, 139, 0.8)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="rgba(100, 116, 139, 0.8)"
                    fontSize={12}
                    domain={[0, 100]}
                    label={{
                      value: "Attendance %",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(226, 232, 240, 0.5)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Attendance"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke={CHART_COLORS.purple}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.purple, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No attendance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Comparison */}
      <Card
        className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Course Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={coursePerformanceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(226, 232, 240, 0.3)"
              />
              <XAxis
                dataKey="name"
                stroke="rgba(100, 116, 139, 0.8)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                stroke="rgba(100, 116, 139, 0.8)"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(226, 232, 240, 0.5)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="progress"
                fill={CHART_COLORS.primary}
                name="Progress %"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="attendance"
                fill={CHART_COLORS.success}
                name="Attendance %"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="averageGrade"
                fill={CHART_COLORS.warning}
                name="Average Grade"
                radius={[8, 8, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Performance Table */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Detailed Performance by Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Average Grade</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourseProgress.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No course data available for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourseProgress.map((course) => (
                    <TableRow
                      key={course.courseId}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        <div>
                          <div>{course.course}</div>
                          {course.courseCode && (
                            <div className="text-xs text-muted-foreground">
                              {course.courseCode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {course.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {course.completed}/{course.assignments}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {course.averageGrade !== null ? (
                          <div className="flex items-center gap-2">
                            <span>{course.averageGrade}%</span>
                            <Badge variant="outline" className="text-xs">
                              {course.letterGrade}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-muted rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all",
                                course.attendanceRate >= 75
                                  ? "bg-green-500"
                                  : course.attendanceRate >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              )}
                              style={{
                                width: `${course.attendanceRate}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {course.attendanceRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            course.progress === 100
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : course.progress >= 80
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                          )}
                        >
                          {course.progress === 100 ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : course.progress >= 80 ? (
                            <>
                              <Target className="h-3 w-3 mr-1" />
                              In Progress
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Needs Attention
                            </>
                          )}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Semester Reports */}
      {semesterReports.length > 0 && (
        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Award className="h-5 w-5 text-primary" />
              Semester Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semester</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semesterReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        Semester {report.semester}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            report.gpa >= 3.5
                              ? "bg-blue-100 text-blue-700"
                              : report.gpa >= 3.0
                              ? "bg-green-100 text-green-700"
                              : report.gpa >= 2.5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {report.gpa.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {report.credits || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
