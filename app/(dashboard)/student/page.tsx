"use client";

import React from "react";
import { useSession } from "next-auth/react";
import ChartCard from "@/components/ui/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import {
  BookOpen,
  ClipboardList,
  Calendar,
  Clock,
  Bell,
  CalendarDays,
  FileText,
  Loader2,
} from "lucide-react";
import StudentStatCard from "@/components/student/StatCard";
import { useStudentDashboard } from "@/lib/hooks/api/student";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatDueDate(dateString: string): { date: string; time: string } {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let dateLabel: string;
  if (diffInDays === 0) dateLabel = "Today";
  else if (diffInDays === 1) dateLabel = "Tomorrow";
  else if (diffInDays < 7) dateLabel = date.toLocaleDateString("en-US", { weekday: "long" });
  else dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  
  return { date: dateLabel, time };
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { data: dashboardData, isLoading, error } = useStudentDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className={cn("rounded-2xl p-6", glassStyles.card, "shadow-glass-sm")}>
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground">
            {error?.message || "Unable to load dashboard data. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const { stats, upcomingAssignments, courseProgress, recentNotifications } = dashboardData;

  // Prepare stats data
  const studentStatsData = [
    {
      title: "Total Courses",
      value: String(stats.totalCourses),
      change: "",
      changeType: "neutral" as const,
      icon: BookOpen,
    },
    {
      title: "Completed Assignments",
      value: `${stats.completedAssignments}/${stats.totalAssignments}`,
      change: "",
      changeType: "positive" as const,
      icon: ClipboardList,
    },
    {
      title: "Attendance %",
      value: `${stats.attendancePercentage}%`,
      change: "",
      changeType: stats.attendancePercentage >= 75 ? "positive" as const : "negative" as const,
      icon: Calendar,
    },
    {
      title: "Upcoming Assignments",
      value: String(upcomingAssignments.length),
      change: "",
      changeType: "neutral" as const,
      icon: Clock,
    },
  ];

  // Prepare course progress chart data
  const courseProgressData = courseProgress.map((cp) => ({
    course: cp.course,
    progress: cp.progress,
    enrollments: 1, // This is student's own progress
    completions: cp.completedAssignments,
  }));

  // Prepare attendance trend (using course progress attendance percentages)
  const attendanceTrendData = courseProgress.slice(0, 6).map((cp, index) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index] || `Course ${index + 1}`,
    users: cp.attendancePercentage,
  }));
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {session?.user?.name || "Student"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your learning progress and upcoming activities.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStatsData.map((stat, index) => (
          <StudentStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Course Progress"
          data={courseProgressData}
          type="bar"
        />
        <ChartCard
          title="Attendance Trend"
          data={attendanceTrendData}
          type="line"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <div className="lg:col-span-1">
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
                <CalendarDays className="h-5 w-5 text-primary" />
                Upcoming Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map((assignment) => {
                    const { date, time } = formatDueDate(assignment.dueDate);
                    return (
                      <div
                        key={assignment.id}
                        className="p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">
                              {assignment.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {assignment.course}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                Due: {date} at {time}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming assignments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Announcements */}
        <div className="lg:col-span-2">
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
                <Bell className="h-5 w-5 text-primary" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent announcements
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
