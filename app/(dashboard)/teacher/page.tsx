"use client";

import React from "react";
import { useSession } from "next-auth/react";
import StatCard from "@/components/ui/StatCard";
import ChartCard from "@/components/ui/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { glassStyles, animationClasses } from "@/config/teacher-constants";
import { cn } from "@/lib/utils";
import { useTeacherDashboard } from "@/lib/hooks/api/teacher";
import { 
  Activity, 
  Clock, 
  Calendar,
  BookOpen,
  Users,
  MapPin,
  FileText,
  Loader2,
  CheckCircle
} from "lucide-react";

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

// Icon mapping for activities
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText: FileText,
  BookOpen: BookOpen,
  Users: Users,
  Activity: Activity,
};

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const { data: dashboardData, isLoading, error } = useTeacherDashboard();

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

  const { stats, attendanceTrend, studentPerformance, upcomingClasses, recentActivities } = dashboardData;

  // Prepare stats data
  const teacherStatsData = [
    {
      title: "Total Classes",
      value: String(stats.totalClasses),
      change: "",
      changeType: "neutral" as const,
      icon: BookOpen,
    },
    {
      title: "Active Students",
      value: String(stats.activeStudents),
      change: "",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Assignments Given",
      value: String(stats.assignmentsGiven),
      change: "",
      changeType: "positive" as const,
      icon: FileText,
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      change: "",
      changeType: stats.attendanceRate >= 75 ? ("positive" as const) : ("negative" as const),
      icon: CheckCircle,
    },
  ];

  // Format student performance data for bar chart (ensure it matches CourseEngagementData format)
  const formattedStudentPerformance = (studentPerformance || []).map((item) => ({
    course: item.course,
    enrollments: item.enrollments || 0,
    completions: item.completions || 0,
  }));

  // Ensure attendance trend has data (fallback to empty array with default values if needed)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedAttendanceTrend = (attendanceTrend || []).length > 0 
    ? attendanceTrend 
    : Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: monthNames[date.getMonth()],
          users: 0,
        };
      });
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={cn(
        "rounded-2xl p-6",
        glassStyles.card,
        "shadow-glass-sm",
        animationClasses.fadeIn
      )}>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {session?.user?.name || "Teacher"}! 👨‍🏫
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your teaching overview for today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teacherStatsData.map((stat) => (
          <StatCard
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
          title="Attendance Trend"
          data={formattedAttendanceTrend}
          type="line"
        />
        <ChartCard
          title="Student Performance"
          data={formattedStudentPerformance}
          type="bar"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <div className="lg:col-span-1">
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground">
                            {classItem.subject}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {classItem.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{classItem.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{classItem.students} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{classItem.room}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming classes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => {
                    const Icon = iconMap[activity.icon] || Activity;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.message}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activities
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
