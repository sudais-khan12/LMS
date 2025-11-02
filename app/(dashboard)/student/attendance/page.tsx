"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { Calendar, TrendingUp, Clock, CheckCircle, Filter, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AttendanceCalendar,
  calculateAttendanceSummary,
} from "@/features/attendance";
import type { AttendanceRecord } from "@/features/attendance";
import { useStudentAttendanceRecords, useStudentCourses } from "@/lib/hooks/api/student";

export default function AttendancePage() {
  // Set default date range to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState("All");
  
  // Fetch attendance records
  const { data: attendanceData, isLoading: isLoadingAttendance } = useStudentAttendanceRecords({
    limit: 1000, // Get a large number to allow client-side filtering
  });
  
  // Fetch courses for filter dropdown
  const { data: coursesData } = useStudentCourses({ limit: 100 });
  
  // Get unique courses for filter
  const uniqueCourses = useMemo(() => {
    const courses = ["All"];
    if (attendanceData?.items) {
      const courseSet = new Set(
        attendanceData.items
          .map((a) => a.course?.title || a.courseId)
          .filter(Boolean)
      );
      courses.push(...Array.from(courseSet));
    }
    return courses;
  }, [attendanceData]);

  // Convert API data to AttendanceRecord format
  const allAttendanceData: AttendanceRecord[] = useMemo(() => {
    if (!attendanceData?.items) return [];
    
    return attendanceData.items.map((record) => ({
      id: record.id,
      date: new Date(record.date).toISOString().split('T')[0],
      course: record.course?.title || record.courseId,
      status: record.status.toLowerCase() as "present" | "absent" | "late" | "excused",
      time: new Date(record.date).toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit" 
      }),
    }));
  }, [attendanceData]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return allAttendanceData.filter((record) => {
      const dateInRange = record.date >= dateFrom && record.date <= dateTo;
      const courseMatches =
        selectedCourse === "All" || record.course === selectedCourse;
      return dateInRange && courseMatches;
    });
  }, [allAttendanceData, dateFrom, dateTo, selectedCourse]);

  // Calculate summary from filtered data using helper from feature module
  const summary = useMemo(
    () => calculateAttendanceSummary(filteredData),
    [filteredData]
  );

  // Generate chart data from filtered results
  const chartData = useMemo(() => {
    const dailyAttendance: Record<string, { present: number; total: number }> =
      {};

    filteredData.forEach((record) => {
      if (!dailyAttendance[record.date]) {
        dailyAttendance[record.date] = { present: 0, total: 0 };
      }
      dailyAttendance[record.date].total++;
      if (record.status === "present" || record.status === "excused") {
        dailyAttendance[record.date].present++;
      }
    });

    return Object.entries(dailyAttendance)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        attendance: Math.round((data.present / data.total) * 100),
      }));
  }, [filteredData]);

  if (isLoadingAttendance) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              Attendance 📅
            </h1>
            <p className="text-muted-foreground">
              Track your class attendance and view detailed attendance reports.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
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
            Filter Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Course / Subject
              </Label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <AttendanceCalendar attendanceData={filteredData} summary={summary} />

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
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(226, 232, 240, 0.3)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(100, 116, 139, 0.8)"
                  fontSize={12}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
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
                    backdropFilter: "blur(8px)",
                  }}
                  labelFormatter={(value) =>
                    `Date: ${new Date(value).toLocaleDateString()}`
                  }
                  formatter={(value) => [`${value}%`, "Attendance"]}
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
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No data available for selected filters
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Policies */}
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
            <CheckCircle className="h-5 w-5 text-primary" />
            Attendance Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Minimum Attendance Requirement
              </h4>
              <p className="text-sm text-blue-700">
                Students must maintain at least 75% attendance to be eligible
                for final examinations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">
                Late Arrival Policy
              </h4>
              <p className="text-sm text-yellow-700">
                Students arriving more than 15 minutes late will be marked as
                absent. Three late arrivals equal one absence.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">
                Excused Absences
              </h4>
              <p className="text-sm text-green-700">
                Medical emergencies and family emergencies are considered
                excused absences. Documentation may be required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
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
            <Clock className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>Request Excuse</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <CheckCircle className="h-6 w-6" />
              <span>Attendance History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
