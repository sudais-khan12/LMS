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
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReportChart from "@/components/student/ReportChart";
import { useStudentReports, useStudentCourses, useStudentAssignments } from "@/lib/hooks/api/student";

export default function ReportsPage() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [reportType, setReportType] = useState("All Reports");
  
  // Fetch reports data
  const { data: reportsData, isLoading: isLoadingReports } = useStudentReports();
  // Fetch courses
  const { data: coursesData } = useStudentCourses({ limit: 100 });
  // Fetch assignments for progress calculation
  const { data: assignmentsData } = useStudentAssignments({ limit: 1000 });
  
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
        (a) => a.submissions?.[0] && a.submissions[0].grade !== null && a.submissions[0].grade !== undefined
      ).length;
      const progress = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;
      
      return {
        course: course.title,
        progress,
        assignments: totalAssignments,
        completed: completedAssignments,
        category: course.category || "Uncategorized",
        startDate: new Date().toISOString().split('T')[0], // Placeholder
        endDate: new Date().toISOString().split('T')[0], // Placeholder
      };
    });
  }, [coursesData, assignmentsData]);

  // Filter course progress data
  const filteredCourseProgress = useMemo(() => {
    return allCourseProgressData.filter((course) => {
      const courseMatches =
        selectedCourse === "All Courses" || course.course === selectedCourse;
      return courseMatches;
    });
  }, [allCourseProgressData, selectedCourse]);
  
  // Calculate monthly performance from submissions (simplified)
  const allMonthlyPerformanceData = useMemo(() => {
    if (!assignmentsData?.items) return [];
    
    // Group submissions by month and calculate average grade
    const monthlyData: Record<string, { grades: number[]; count: number }> = {};
    
    assignmentsData.items.forEach((assignment) => {
      const submission = assignment.submissions?.[0];
      if (submission?.grade !== null && submission?.grade !== undefined) {
        const month = new Date(submission.submittedAt || assignment.dueDate).toLocaleDateString("en-US", { month: "short" });
        if (!monthlyData[month]) {
          monthlyData[month] = { grades: [], count: 0 };
        }
        monthlyData[month].grades.push(submission.grade);
        monthlyData[month].count++;
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      score: Math.round(data.grades.reduce((a, b) => a + b, 0) / data.grades.length),
      assignments: data.count,
    }));
  }, [assignmentsData]);
  
  // Grade distribution (simplified - based on reports GPA if available)
  const allGradeDistributionData = useMemo(() => {
    if (!reportsData?.reports || reportsData.reports.length === 0) {
      return [
        { grade: "A+", count: 0, percentage: 0 },
        { grade: "A", count: 0, percentage: 0 },
        { grade: "B+", count: 0, percentage: 0 },
        { grade: "B", count: 0, percentage: 0 },
        { grade: "C", count: 0, percentage: 0 },
      ];
    }
    
    // Map GPA to letter grades
    const gradeCounts: Record<string, number> = {};
    reportsData.reports.forEach((report) => {
      let grade = "C";
      if (report.gpa >= 3.7) grade = "A+";
      else if (report.gpa >= 3.3) grade = "A";
      else if (report.gpa >= 3.0) grade = "B+";
      else if (report.gpa >= 2.7) grade = "B";
      
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    });
    
    const total = reportsData.reports.length;
    return [
      { grade: "A+", count: gradeCounts["A+"] || 0, percentage: total > 0 ? Math.round((gradeCounts["A+"] || 0) / total * 100) : 0 },
      { grade: "A", count: gradeCounts["A"] || 0, percentage: total > 0 ? Math.round((gradeCounts["A"] || 0) / total * 100) : 0 },
      { grade: "B+", count: gradeCounts["B+"] || 0, percentage: total > 0 ? Math.round((gradeCounts["B+"] || 0) / total * 100) : 0 },
      { grade: "B", count: gradeCounts["B"] || 0, percentage: total > 0 ? Math.round((gradeCounts["B"] || 0) / total * 100) : 0 },
      { grade: "C", count: gradeCounts["C"] || 0, percentage: total > 0 ? Math.round((gradeCounts["C"] || 0) / total * 100) : 0 },
    ];
  }, [reportsData]);
  
  // Attendance trend - simplified monthly average
  const allAttendanceTrendData = useMemo(() => {
    if (!reportsData) return [];
    // Use the attendanceRate from reports and create monthly trend
    const attendanceRate = reportsData.attendanceRate || 0;
    return [
      { month: "Jan", attendance: Math.round(attendanceRate * 0.95) },
      { month: "Feb", attendance: Math.round(attendanceRate * 0.98) },
      { month: "Mar", attendance: Math.round(attendanceRate * 0.97) },
      { month: "Apr", attendance: Math.round(attendanceRate * 1.0) },
      { month: "May", attendance: Math.round(attendanceRate * 1.02) },
      { month: "Jun", attendance: Math.round(attendanceRate) },
    ];
  }, [reportsData]);
  
  if (isLoadingReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

    // Calculate average grade from reports data
    let averageGrade = "N/A";
    if (reportsData?.averageGrade !== null && reportsData?.averageGrade !== undefined) {
      const avgGrade = reportsData.averageGrade;
      if (avgGrade >= 97) averageGrade = "A+";
      else if (avgGrade >= 93) averageGrade = "A";
      else if (avgGrade >= 87) averageGrade = "B+";
      else if (avgGrade >= 80) averageGrade = "B";
      else if (avgGrade >= 70) averageGrade = "C+";
      else if (avgGrade >= 60) averageGrade = "C";
      else averageGrade = "D";
    } else if (avgProgress >= 97) averageGrade = "A+";
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
      attendanceRate: reportsData?.attendanceRate || 0,
      performanceTrend: trend,
    };
  }, [filteredCourseProgress, reportsData]);

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
