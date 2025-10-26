"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { Calendar, TrendingUp, Clock, CheckCircle, Filter } from "lucide-react";
import AttendanceCalendar from "@/components/ui/student/AttendanceCalendar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late" | "excused";
  course: string;
  time: string;
}

// Mock attendance data - expanded dataset
const allAttendanceData: AttendanceRecord[] = [
  {
    date: "2024-02-20",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
  },
  {
    date: "2024-02-19",
    status: "present",
    course: "JavaScript Advanced",
    time: "2:00 PM",
  },
  {
    date: "2024-02-18",
    status: "late",
    course: "Node.js Backend",
    time: "11:00 AM",
  },
  {
    date: "2024-02-17",
    status: "present",
    course: "Database Design",
    time: "9:00 AM",
  },
  {
    date: "2024-02-16",
    status: "absent",
    course: "UI/UX Design",
    time: "3:00 PM",
  },
  {
    date: "2024-02-15",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
  },
  {
    date: "2024-02-14",
    status: "present",
    course: "JavaScript Advanced",
    time: "2:00 PM",
  },
  {
    date: "2024-02-13",
    status: "late",
    course: "Node.js Backend",
    time: "11:00 AM",
  },
  {
    date: "2024-02-12",
    status: "present",
    course: "Database Design",
    time: "9:00 AM",
  },
  {
    date: "2024-02-11",
    status: "absent",
    course: "UI/UX Design",
    time: "3:00 PM",
  },
  {
    date: "2024-02-10",
    status: "present",
    course: "Python for Data Science",
    time: "1:00 PM",
  },
  {
    date: "2024-02-09",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
  },
  {
    date: "2024-02-08",
    status: "excused",
    course: "JavaScript Advanced",
    time: "2:00 PM",
  },
  {
    date: "2024-02-07",
    status: "present",
    course: "Node.js Backend",
    time: "11:00 AM",
  },
  {
    date: "2024-02-06",
    status: "present",
    course: "Database Design",
    time: "9:00 AM",
  },
  {
    date: "2024-02-05",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
  },
  {
    date: "2024-02-04",
    status: "late",
    course: "JavaScript Advanced",
    time: "2:00 PM",
  },
  {
    date: "2024-02-03",
    status: "present",
    course: "UI/UX Design",
    time: "3:00 PM",
  },
  {
    date: "2024-02-02",
    status: "present",
    course: "Python for Data Science",
    time: "1:00 PM",
  },
  {
    date: "2024-02-01",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
  },
];

// Get unique courses for filter
const uniqueCourses = [
  "All",
  ...new Set(allAttendanceData.map((a) => a.course)),
];

// Monthly attendance trend data
const monthlyTrend = [
  { month: "Jan", attendance: 88 },
  { month: "Feb", attendance: 94 },
  { month: "Mar", attendance: 91 },
  { month: "Apr", attendance: 89 },
  { month: "May", attendance: 95 },
  { month: "Jun", attendance: 92 },
];

export default function AttendancePage() {
  const [dateFrom, setDateFrom] = useState("2024-02-01");
  const [dateTo, setDateTo] = useState("2024-02-20");
  const [selectedCourse, setSelectedCourse] = useState("All");

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return allAttendanceData.filter((record) => {
      const dateInRange = record.date >= dateFrom && record.date <= dateTo;
      const courseMatches =
        selectedCourse === "All" || record.course === selectedCourse;
      return dateInRange && courseMatches;
    });
  }, [dateFrom, dateTo, selectedCourse]);

  // Calculate summary from filtered data
  const summary = useMemo(() => {
    const presentDays = filteredData.filter(
      (a) => a.status === "present"
    ).length;
    const totalDays = filteredData.length;
    return {
      totalDays,
      presentDays,
      absentDays: filteredData.filter((a) => a.status === "absent").length,
      lateDays: filteredData.filter((a) => a.status === "late").length,
      excusedDays: filteredData.filter((a) => a.status === "excused").length,
      percentage:
        totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
    };
  }, [filteredData]);

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
