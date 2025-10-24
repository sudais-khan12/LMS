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
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Filter,
  Search,
} from "lucide-react";
import AttendanceCalendar from "@/components/ui/student/AttendanceCalendar";
import ReportChart from "@/components/ui/student/ReportChart";
import {
  AttendanceRecord,
  AttendanceSummary,
  mockAttendanceData,
  mockAttendanceTrend,
  attendanceCourses,
  attendanceStatuses,
  calculateAttendanceSummary,
} from "@/data/mock/studentAttendance";

export default function AttendancePage() {
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] =
    useState<AttendanceRecord[]>(mockAttendanceData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filter attendance data
  const filteredAttendanceData = useMemo(() => {
    return attendanceData.filter((record) => {
      const matchesSearch =
        record.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.room.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        filterCourse === "All" || record.course === filterCourse;
      const matchesStatus =
        filterStatus === "All" || record.status === filterStatus;

      const matchesDateRange =
        (!dateFrom || record.date >= dateFrom) &&
        (!dateTo || record.date <= dateTo);

      return (
        matchesSearch && matchesCourse && matchesStatus && matchesDateRange
      );
    });
  }, [
    attendanceData,
    searchTerm,
    filterCourse,
    filterStatus,
    dateFrom,
    dateTo,
  ]);

  // Calculate summary for filtered data
  const summary = useMemo(() => {
    return calculateAttendanceSummary(filteredAttendanceData);
  }, [filteredAttendanceData]);

  // Prepare trend data for chart
  const trendData = useMemo(() => {
    return mockAttendanceTrend.map((item) => ({
      month: item.month,
      attendance: item.attendance,
      present: item.present,
      absent: item.absent,
      late: item.late,
      excused: item.excused,
    }));
  }, []);

  const handleExportReport = () => {
    toast({
      title: "Export Successful",
      description: "Your attendance report has been exported successfully.",
    });
  };

  const handleRequestExcuse = () => {
    toast({
      title: "Excuse Request",
      description: "Your excuse request has been submitted for review.",
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
              Attendance 📅
            </h1>
            <p className="text-muted-foreground">
              Track your class attendance and view detailed attendance reports.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
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
            Filter Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-foreground"
              >
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search courses, instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
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
                  {attendanceCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-foreground"
              >
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {attendanceStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All"
                        ? "All Status"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <AttendanceCalendar
        attendanceData={filteredAttendanceData}
        summary={summary}
      />

      {/* Attendance Trend Chart */}
      <ReportChart
        title="Monthly Attendance Trend"
        data={trendData}
        type="line"
        dataKey="attendance"
        xAxisKey="month"
        colors={["#3b82f6"]}
      />

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
              onClick={handleRequestExcuse}
            >
              <Calendar className="h-6 w-6" />
              <span>Request Excuse</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={handleExportReport}
            >
              <TrendingUp className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                toast({
                  title: "Attendance History",
                  description: "Opening detailed attendance history...",
                });
              }}
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
