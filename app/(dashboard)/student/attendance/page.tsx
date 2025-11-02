"use client";

import { useState, useMemo, useEffect } from "react";
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
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Filter,
  Loader2,
  BookOpen,
  AlertCircle,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";
import {
  BarChart,
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
} from "recharts";
import { AttendanceCalendar } from "@/features/attendance";
import { useStudentAttendanceRecords, useStudentCourses } from "@/lib/hooks/api/student";

interface CourseAttendanceStats {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
  status: "good" | "warning" | "critical";
  records: Array<{
    id: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  }>;
}

const COLORS = {
  good: "#22c55e", // green
  warning: "#f59e0b", // yellow
  critical: "#ef4444", // red
};

const STATUS_COLORS = {
  PRESENT: "#22c55e",
  ABSENT: "#ef4444",
  LATE: "#f59e0b",
  EXCUSED: "#3b82f6",
};

export default function AttendancePage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [dateFrom, setDateFrom] = useState(
    thirtyDaysAgo.toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(today.toISOString().split("T")[0]);
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const { data: attendanceData, isLoading: isLoadingAttendance } =
    useStudentAttendanceRecords({
      limit: 1000,
    });

  const { data: coursesData } = useStudentCourses({ limit: 100 });

  // Calculate course-wise statistics
  const courseStats = useMemo((): CourseAttendanceStats[] => {
    if (!attendanceData?.items) return [];

    // Filter by date range
    const filteredRecords = attendanceData.items.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      return recordDate >= dateFrom && recordDate <= dateTo;
    });

    // Group by course
    const courseMap = new Map<string, CourseAttendanceStats>();

    filteredRecords.forEach((record) => {
      const courseId = record.courseId;
      const courseTitle = record.course?.title || record.courseId || "Unknown";
      const courseCode = record.course?.code || "";

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseId,
          courseTitle,
          courseCode,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
          percentage: 0,
          status: "good",
          records: [],
        });
      }

      const stats = courseMap.get(courseId)!;
      stats.total++;
      stats.records.push({
        id: record.id,
        date: record.date,
        status: record.status,
      });

      switch (record.status) {
        case "PRESENT":
          stats.present++;
          break;
        case "ABSENT":
          stats.absent++;
          break;
        case "LATE":
          stats.late++;
          break;
        case "EXCUSED":
          stats.excused++;
          break;
      }
    });

    // Calculate percentages and status
    const statsArray = Array.from(courseMap.values()).map((stats) => {
      const effectivePresent = stats.present + stats.excused;
      stats.percentage = stats.total > 0 ? (effectivePresent / stats.total) * 100 : 0;

      // Determine status based on percentage
      if (stats.percentage >= 75) {
        stats.status = "good";
      } else if (stats.percentage >= 50) {
        stats.status = "warning";
      } else {
        stats.status = "critical";
      }

      return stats;
    });

    // Sort by course title
    return statsArray.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
  }, [attendanceData, dateFrom, dateTo]);

  // Filter course stats based on selected course
  const filteredCourseStats = useMemo(() => {
    if (selectedCourse === "All") return courseStats;
    return courseStats.filter(
      (stats) => stats.courseId === selectedCourse || stats.courseTitle === selectedCourse
    );
  }, [courseStats, selectedCourse]);

  // Overall statistics
  const overallStats = useMemo(() => {
    const totals = filteredCourseStats.reduce(
      (acc, stats) => ({
        present: acc.present + stats.present,
        absent: acc.absent + stats.absent,
        late: acc.late + stats.late,
        excused: acc.excused + stats.excused,
        total: acc.total + stats.total,
      }),
      { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
    );

    const effectivePresent = totals.present + totals.excused;
    const overallPercentage =
      totals.total > 0 ? (effectivePresent / totals.total) * 100 : 0;

    let overallStatus: "good" | "warning" | "critical" = "good";
    if (overallPercentage >= 75) {
      overallStatus = "good";
    } else if (overallPercentage >= 50) {
      overallStatus = "warning";
    } else {
      overallStatus = "critical";
    }

    return {
      ...totals,
      percentage: overallPercentage,
      status: overallStatus,
    };
  }, [filteredCourseStats]);

  // Get unique courses for filter
  const uniqueCourses = useMemo(() => {
    const courses = ["All"];
    if (attendanceData?.items) {
      const courseSet = new Map<string, string>();
      attendanceData.items.forEach((record) => {
        const courseId = record.courseId;
        const courseTitle = record.course?.title || courseId;
        if (!courseSet.has(courseId)) {
          courseSet.set(courseId, courseTitle);
          courses.push(courseTitle);
        }
      });
    }
    return courses;
  }, [attendanceData]);

  // Chart data for course comparison
  const courseComparisonData = useMemo(() => {
    return filteredCourseStats.map((stats) => ({
      name: stats.courseTitle.length > 15 
        ? stats.courseTitle.substring(0, 15) + "..." 
        : stats.courseTitle,
      percentage: Math.round(stats.percentage),
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      excused: stats.excused,
      total: stats.total,
    }));
  }, [filteredCourseStats]);

  // Pie chart data for overall distribution
  const pieChartData = useMemo(() => {
    return [
      { name: "Present", value: overallStats.present, color: STATUS_COLORS.PRESENT },
      { name: "Absent", value: overallStats.absent, color: STATUS_COLORS.ABSENT },
      { name: "Late", value: overallStats.late, color: STATUS_COLORS.LATE },
      { name: "Excused", value: overallStats.excused, color: STATUS_COLORS.EXCUSED },
    ].filter((item) => item.value > 0);
  }, [overallStats]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: "good" | "warning" | "critical") => {
    switch (status) {
      case "good":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Good
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
    }
  };

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
              Track your attendance by course and view detailed statistics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(overallStats.status)}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Statistics Cards */}
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
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overall Attendance
                </p>
                <p className="text-xl font-bold text-foreground">
                  {Math.round(overallStats.percentage)}%
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
              <div className="p-2 rounded-lg bg-blue-100">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Present
                </p>
                <p className="text-xl font-bold text-foreground">
                  {overallStats.present}
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
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Absent
                </p>
                <p className="text-xl font-bold text-foreground">
                  {overallStats.absent}
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
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Classes
                </p>
                <p className="text-xl font-bold text-foreground">
                  {overallStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger
                  id="course"
                  className="bg-background/50 border-border/50"
                >
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course-wise Attendance Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Attendance by Course / Subject
          </h2>
          <Badge variant="secondary">
            {filteredCourseStats.length} Course
            {filteredCourseStats.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {filteredCourseStats.length === 0 ? (
          <Card
            className={cn(
              glassStyles.card,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No attendance data found
              </h3>
              <p className="text-muted-foreground">
                {selectedCourse !== "All"
                  ? "No attendance records found for the selected course in this date range."
                  : "No attendance records found for the selected date range."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCourseStats.map((courseStat) => (
            <Card
              key={courseStat.courseId}
              className={cn(
                glassStyles.card,
                glassStyles.cardHover,
                "rounded-2xl shadow-glass-sm",
                animationClasses.scaleIn
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {courseStat.courseTitle}
                      {courseStat.courseCode && (
                        <Badge variant="outline" className="ml-2">
                          {courseStat.courseCode}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      {getStatusBadge(courseStat.status)}
                      <span className="text-2xl font-bold text-foreground">
                        {Math.round(courseStat.percentage)}%
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedCourse(
                        expandedCourse === courseStat.courseId
                          ? null
                          : courseStat.courseId
                      )
                    }
                  >
                    {expandedCourse === courseStat.courseId ? "Collapse" : "View Details"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xs font-medium text-green-700 mb-1">
                      Present
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {courseStat.present}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs font-medium text-red-700 mb-1">
                      Absent
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {courseStat.absent}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <p className="text-xs font-medium text-yellow-700 mb-1">
                      Late
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {courseStat.late}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Excused
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {courseStat.excused}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Attendance Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {courseStat.present + courseStat.excused} / {courseStat.total}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={cn(
                        "h-3 rounded-full transition-all duration-300",
                        courseStat.status === "good" && "bg-green-500",
                        courseStat.status === "warning" && "bg-yellow-500",
                        courseStat.status === "critical" && "bg-red-500"
                      )}
                      style={{ width: `${Math.min(courseStat.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Records Table */}
                {expandedCourse === courseStat.courseId && (
                  <div className="mt-4 border-t border-border/50 pt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      Attendance History
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courseStat.records
                            .sort((a, b) => b.date.localeCompare(a.date))
                            .map((record) => (
                              <TableRow key={record.id}>
                                <TableCell className="font-medium">
                                  {formatDate(record.date)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    style={{
                                      backgroundColor: `${STATUS_COLORS[record.status]}20`,
                                      color: STATUS_COLORS[record.status],
                                    }}
                                    className="border-0"
                                  >
                                    {record.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Charts Section */}
      {filteredCourseStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Comparison Bar Chart */}
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
                Attendance by Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseComparisonData}>
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
                    formatter={(value: number) => [`${value}%`, "Attendance"]}
                  />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Overall Distribution Pie Chart */}
          {pieChartData.length > 0 && (
            <Card
              className={cn(
                glassStyles.card,
                "rounded-2xl shadow-glass-sm",
                animationClasses.scaleIn
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  Overall Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Minimum Attendance Requirement
              </h4>
              <p className="text-sm text-blue-700">
                Students must maintain at least <strong>75%</strong> attendance to
                be eligible for final examinations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">
                Late Arrival Policy
              </h4>
              <p className="text-sm text-yellow-700">
                Students arriving more than <strong>15 minutes</strong> late will
                be marked as absent. Three late arrivals equal one absence.
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
    </div>
  );
}
