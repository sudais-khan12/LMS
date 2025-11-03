"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { AttendanceReportProps, ExportOptions } from "@/types/report";
import ReportFiltersComponent from "@/components/admin/reports/ReportFilters";
import ExportButton from "@/components/admin/reports/ExportButton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Users,
  AlertTriangle,
  Award,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function AttendanceReport({
  data,
  filters,
  onFiltersChange,
  isLoading = false,
}: AttendanceReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    let filteredTrendData = data.trendData;
    let filteredCourseStats = data.courseStats;

    // Filter by course if selected
    if (filters.course) {
      filteredCourseStats = data.courseStats.filter(
        (course) => course.courseName === filters.course
      );
    }

    // Filter by time range
    if (filters.timeRange !== "all") {
      const monthsToShow =
        filters.timeRange === "30days"
          ? 1
          : filters.timeRange === "6months"
          ? 6
          : 12;
      filteredTrendData = data.trendData.slice(-monthsToShow);
    }

    return {
      trendData: filteredTrendData,
      courseStats: filteredCourseStats,
      kpis: data.kpis,
    };
  }, [data, filters]);

  // Paginate course stats
  const paginatedCourseStats = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.courseStats.slice(startIndex, endIndex);
  }, [filteredData.courseStats, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.courseStats.length / pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [filters.course]);

  const handleExport = (options: ExportOptions) => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Attendance Overview
          </h2>
          <p className="text-muted-foreground">
            Track attendance trends and course performance
          </p>
        </div>
        <ExportButton onExport={handleExport} isLoading={isExporting} />
      </div>

      {/* Filters */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableCourses={data.courseStats.map((c) => c.courseName)}
        showCourseFilter={true}
        showTimeRangeFilter={true}
        isLoading={isLoading}
      />

      {/* KPI Cards */}
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
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Attendance
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.kpis.averageAttendance}%
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
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top Course
                </p>
                <p className="text-lg font-bold text-foreground">
                  {filteredData.kpis.topCourse}
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
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Low Attendance Alerts
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.kpis.lowAttendanceAlerts}
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
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.kpis.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
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
              <TrendingUp className="h-5 w-5 text-primary" />
              Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData.trendData}>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    borderRadius: "8px",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Attendance Chart */}
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
              <Users className="h-5 w-5 text-primary" />
              Course Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData.courseStats}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(226, 232, 240, 0.3)"
                />
                <XAxis
                  dataKey="courseName"
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    borderRadius: "8px",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Bar
                  dataKey="averageAttendance"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Course Stats Table */}
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
            <Calendar className="h-5 w-5 text-primary" />
            Course Attendance Statistics
            {filteredData.courseStats.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredData.courseStats.length} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.courseStats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No course statistics available</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Students
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Avg Attendance
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Trend
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Alerts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCourseStats.map((course) => (
                      <tr
                        key={course.courseId}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">
                            {course.courseName}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-sm">
                            {course.totalStudents}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium text-foreground">
                            {course.averageAttendance}%
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              getTrendColor(course.attendanceTrend)
                            )}
                          >
                            {getTrendIcon(course.attendanceTrend)}
                            <span className="text-sm capitalize">
                              {course.attendanceTrend}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-sm",
                              course.lowAttendanceAlerts > 10
                                ? "bg-red-100 text-red-800 border-red-200"
                                : course.lowAttendanceAlerts > 5
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            )}
                          >
                            {course.lowAttendanceAlerts}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card
                  className={cn(
                    glassStyles.card,
                    "rounded-2xl shadow-glass-sm mt-6",
                    animationClasses.scaleIn
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredData.courseStats.length)} of {filteredData.courseStats.length} courses
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0 || isLoading}
                          className="flex items-center gap-1"
                        >
                          <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={(currentPage + 1) * pageSize >= filteredData.courseStats.length || isLoading}
                          className="flex items-center gap-1"
                        >
                          Next
                          <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
