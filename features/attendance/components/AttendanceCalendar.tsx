"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceData {
  date: string;
  status: "present" | "absent" | "late" | "excused";
  course: string;
  time: string;
}

interface AttendanceCalendarProps {
  attendanceData: AttendanceData[];
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    percentage: number;
  };
}

export default function AttendanceCalendar({ attendanceData, summary }: AttendanceCalendarProps) {
  const getStatusIcon = (status: AttendanceData["status"]) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "excused":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AttendanceData["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-50 border-green-200";
      case "absent":
        return "bg-red-50 border-red-200";
      case "late":
        return "bg-yellow-50 border-yellow-200";
      case "excused":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-xl font-bold text-foreground">{summary.presentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-xl font-bold text-foreground">{summary.absentDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late</p>
                <p className="text-xl font-bold text-foreground">{summary.lateDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance %</p>
                <p className="text-xl font-bold text-foreground">{summary.percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceData.map((record, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  getStatusColor(record.status)
                )}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-foreground">{record.course}</p>
                    <p className="text-sm text-muted-foreground">{record.date} at {record.time}</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-muted-foreground capitalize">
                  {record.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
