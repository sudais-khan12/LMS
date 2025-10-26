"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Calendar as CalendarIcon,
} from "lucide-react";
import ReportChart from "@/components/ui/student/ReportChart";
import { useToast } from "@/hooks/use-toast";

interface CourseProgress {
  course: string;
  progress: number;
  assignments: number;
  completed: number;
  category: string;
  startDate: string;
  endDate: string;
}

interface MonthlyPerformance {
  month: string;
  score: number;
  assignments: number;
}

// All mock data for reports
const allCourseProgressData: CourseProgress[] = [
  {
    course: "React Fundamentals",
    progress: 85,
    assignments: 8,
    completed: 7,
    category: "Web Development",
    startDate: "2024-01-15",
    endDate: "2024-03-10",
  },
  {
    course: "JavaScript Advanced",
    progress: 92,
    assignments: 6,
    completed: 6,
    category: "Programming",
    startDate: "2024-02-01",
    endDate: "2024-03-15",
  },
  {
    course: "Node.js Backend",
    progress: 78,
    assignments: 10,
    completed: 8,
    category: "Backend Development",
    startDate: "2024-01-20",
    endDate: "2024-04-01",
  },
  {
    course: "Database Design",
    progress: 100,
    assignments: 5,
    completed: 5,
    category: "Database",
    startDate: "2023-11-01",
    endDate: "2023-12-15",
  },
  {
    course: "UI/UX Design",
    progress: 65,
    assignments: 7,
    completed: 4,
    category: "Design",
    startDate: "2024-02-15",
    endDate: "2024-04-10",
  },
  {
    course: "Python for Data Science",
    progress: 85,
    assignments: 10,
    completed: 9,
    category: "Data Science",
    startDate: "2024-03-01",
    endDate: "2024-05-24",
  },
  {
    course: "Mobile App Development",
    progress: 100,
    assignments: 12,
    completed: 12,
    category: "Mobile Development",
    startDate: "2023-09-01",
    endDate: "2023-11-10",
  },
];

const allMonthlyPerformanceData: MonthlyPerformance[] = [
  { month: "Jan", score: 85, assignments: 12 },
  { month: "Feb", score: 92, assignments: 15 },
  { month: "Mar", score: 88, assignments: 10 },
  { month: "Apr", score: 95, assignments: 18 },
  { month: "May", score: 90, assignments: 14 },
  { month: "Jun", score: 94, assignments: 16 },
];

const allGradeDistributionData = [
  { grade: "A+", count: 8, percentage: 25 },
  { grade: "A", count: 12, percentage: 37.5 },
  { grade: "B+", count: 6, percentage: 18.75 },
  { grade: "B", count: 4, percentage: 12.5 },
  { grade: "C", count: 2, percentage: 6.25 },
];

const allAttendanceTrendData = [
  { month: "Jan", attendance: 88 },
  { month: "Feb", attendance: 94 },
  { month: "Mar", attendance: 91 },
  { month: "Apr", attendance: 89 },
  { month: "May", attendance: 95 },
  { month: "Jun", attendance: 92 },
];

const courseCategories = [
  "All Courses",
  ...new Set(allCourseProgressData.map((c) => c.course)),
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-06-30");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [reportType, setReportType] = useState("All Reports");

  // Filter course progress data
  const filteredCourseProgress = useMemo(() => {
    return allCourseProgressData.filter((course) => {
      const courseMatches =
        selectedCourse === "All Courses" || course.course === selectedCourse;
      return courseMatches;
    });
  }, [selectedCourse]);

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

    // Calculate average grade based on progress
    let averageGrade = "N/A";
    if (avgProgress >= 97) averageGrade = "A+";
    else if (avgProgress >= 93) averageGrade = "A";
    else if (avgProgress >= 87) averageGrade = "B+";
    else if (avgProgress >= 80) averageGrade = "B";
    else if (avgProgress >= 70) averageGrade = "C+";
    else if (avgProgress >= 60) averageGrade = "C";
    else averageGrade = "D";

    // Calculate performance trend (simulated change)
    const trend = avgProgress >= 90 ? "+8%" : avgProgress >= 80 ? "+5%" : "+2%";

    return {
      averageGrade,
      completedAssignments,
      totalAssignments,
      attendanceRate: avgProgress, // Using avgProgress as a proxy for attendance
      performanceTrend: trend,
    };
  }, [filteredCourseProgress]);

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated and downloaded...",
    });
    // Simulate download
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
              View detailed performance reports and learning analytics.
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
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {courseCategories.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="reportType"
                className="text-sm font-medium text-foreground"
              >
                Report Type
              </Label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="All Reports">All Reports</option>
                <option value="Progress">Progress</option>
                <option value="Performance">Performance</option>
                <option value="Attendance">Attendance</option>
                <option value="Grades">Grades</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Course Progress Overview"
          data={filteredCourseProgress.map((c) => ({
            course: c.course,
            progress: c.progress,
          }))}
          type="bar"
          dataKey="progress"
          xAxisKey="course"
          colors={["#3b82f6"]}
        />
        <ReportChart
          title="Monthly Performance Trend"
          data={allMonthlyPerformanceData.map((item) => ({
            ...item,
            [item.month]: item.score,
          }))}
          type="line"
          dataKey="score"
          xAxisKey="month"
          colors={["#10b981"]}
        />
      </div>

      {/* Grade Distribution and Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Grade Distribution"
          data={allGradeDistributionData.map((g) => ({
            name: g.grade,
            value: g.count,
          }))}
          type="pie"
          dataKey="value"
          colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
        />
        <ReportChart
          title="Attendance Trend"
          data={allAttendanceTrendData}
          type="line"
          dataKey="attendance"
          xAxisKey="month"
          colors={["#8b5cf6"]}
        />
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
                <BookOpen className="h-5 w-5 text-blue-600" />
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
                <CalendarIcon className="h-5 w-5 text-purple-600" />
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
                  Performance Trend
                </p>
                <p className="text-xl font-bold text-foreground">
                  {summaryStats.performanceTrend}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <BarChart3 className="h-5 w-5 text-primary" />
            Detailed Performance by Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Course
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Progress
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Assignments
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Average Grade
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourseProgress.map((course, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {course.course}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {course.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {course.completed}/{course.assignments}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {course.progress >= 90
                        ? "A+"
                        : course.progress >= 80
                        ? "A"
                        : course.progress >= 70
                        ? "B+"
                        : "B"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.progress === 100
                            ? "bg-green-100 text-green-700"
                            : course.progress >= 80
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {course.progress === 100
                          ? "Completed"
                          : course.progress >= 80
                          ? "In Progress"
                          : "Needs Attention"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
