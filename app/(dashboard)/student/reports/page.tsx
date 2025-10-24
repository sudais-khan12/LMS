"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
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
import {
  ReportData,
  mockReportData,
  reportCourses,
  reportSemesters,
  reportTypes,
  calculateOverallStats,
} from "@/data/mock/studentReports";

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData>(mockReportData);
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");
  const [filterReportType, setFilterReportType] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    const filtered = { ...reportData };

    // Filter by course
    if (filterCourse !== "All") {
      filtered.courseProgress = filtered.courseProgress.filter(
        (course) => course.course === filterCourse
      );
      filtered.assignmentCompletion = filtered.assignmentCompletion.filter(
        (course) => course.course === filterCourse
      );
    }

    // Filter by date range (simplified - in real app would filter actual dates)
    if (dateFrom || dateTo) {
      // This would filter based on actual date ranges in a real implementation
      // For now, we'll just return the filtered data as is
    }

    return filtered;
  }, [
    reportData,
    filterCourse,
    filterSemester,
    filterReportType,
    dateFrom,
    dateTo,
  ]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    return calculateOverallStats(filteredData);
  }, [filteredData]);

  const handleExportPDF = () => {
    toast({
      title: "Export Successful",
      description: "Your report has been exported as PDF successfully.",
    });
  };

  const handleCustomRange = () => {
    toast({
      title: "Custom Range",
      description: "Custom date range selector opened.",
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
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  {reportCourses.map((course) => (
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
              <Select
                value={filterReportType}
                onValueChange={setFilterReportType}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="All Reports" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Course Progress Overview"
          data={filteredData.courseProgress}
          type="bar"
          dataKey="progress"
          xAxisKey="course"
          colors={["#3b82f6"]}
        />
        <ReportChart
          title="Monthly Performance Trend"
          data={filteredData.monthlyPerformance}
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
          data={filteredData.gradeDistribution}
          type="pie"
          dataKey="count"
          colors={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]}
        />
        <ReportChart
          title="Attendance Trend"
          data={filteredData.attendanceTrend}
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
                  {overallStats.averageGrade}%
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
                  {overallStats.completedAssignments}/
                  {overallStats.totalAssignments}
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
                  {overallStats.averageAttendance}%
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
                  Completion Rate
                </p>
                <p className="text-xl font-bold text-foreground">
                  {overallStats.completionRate}%
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
                {filteredData.courseProgress.map((course, index) => (
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
                      {course.averageGrade}%
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
