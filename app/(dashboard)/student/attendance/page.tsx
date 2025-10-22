"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { Calendar, TrendingUp, Clock, CheckCircle } from "lucide-react";
import AttendanceCalendar from "@/components/ui/student/AttendanceCalendar";

// Mock attendance data
const attendanceData = [
  {
    date: "2024-02-15",
    status: "present" as const,
    course: "React Fundamentals",
    time: "10:00 AM",
  },
  {
    date: "2024-02-14",
    status: "present" as const,
    course: "JavaScript Advanced",
    time: "2:00 PM",
  },
  {
    date: "2024-02-13",
    status: "late" as const,
    course: "Node.js Backend",
    time: "11:00 AM",
  },
  {
    date: "2024-02-12",
    status: "present" as const,
    course: "Database Design",
    time: "9:00 AM",
  },
  {
    date: "2024-02-11",
    status: "absent" as const,
    course: "UI/UX Design",
    time: "3:00 PM",
  },
  {
    date: "2024-02-10",
    status: "present" as const,
    course: "Python for Data Science",
    time: "1:00 PM",
  },
  {
    date: "2024-02-09",
    status: "present" as const,
    course: "React Fundamentals",
    time: "10:00 AM",
  },
  {
    date: "2024-02-08",
    status: "excused" as const,
    course: "JavaScript Advanced",
    time: "2:00 PM",
  },
];

// Calculate summary
const summary = {
  totalDays: attendanceData.length,
  presentDays: attendanceData.filter(a => a.status === "present").length,
  absentDays: attendanceData.filter(a => a.status === "absent").length,
  lateDays: attendanceData.filter(a => a.status === "late").length,
  excusedDays: attendanceData.filter(a => a.status === "excused").length,
  percentage: Math.round((attendanceData.filter(a => a.status === "present").length / attendanceData.length) * 100),
};

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
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className={cn(
        "rounded-2xl p-6",
        glassStyles.card,
        "shadow-glass-sm",
        animationClasses.fadeIn
      )}>
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

      {/* Attendance Overview */}
      <AttendanceCalendar attendanceData={attendanceData} summary={summary} />

      {/* Attendance Trend Chart */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monthly Attendance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
              <p className="text-sm text-muted-foreground">Using Recharts or similar library</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Policies */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <CheckCircle className="h-5 w-5 text-primary" />
            Attendance Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Minimum Attendance Requirement</h4>
              <p className="text-sm text-blue-700">
                Students must maintain at least 75% attendance to be eligible for final examinations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Late Arrival Policy</h4>
              <p className="text-sm text-yellow-700">
                Students arriving more than 15 minutes late will be marked as absent. 
                Three late arrivals equal one absence.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Excused Absences</h4>
              <p className="text-sm text-green-700">
                Medical emergencies and family emergencies are considered excused absences. 
                Documentation may be required.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Request Excuse</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <span>Attendance History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
