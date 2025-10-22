"use client";

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
} from "lucide-react";
import StudentStatCard from "@/components/ui/student/StatCard";

// Student-specific stats data
const studentStatsData = [
  {
    title: "Total Courses",
    value: "8",
    change: "+2",
    changeType: "positive" as const,
    icon: BookOpen,
  },
  {
    title: "Completed Assignments",
    value: "24",
    change: "+5",
    changeType: "positive" as const,
    icon: ClipboardList,
  },
  {
    title: "Attendance %",
    value: "94%",
    change: "+3%",
    changeType: "positive" as const,
    icon: Calendar,
  },
  {
    title: "Upcoming Classes",
    value: "3",
    change: "Today",
    changeType: "neutral" as const,
    icon: Clock,
  },
];

// Course progress data
const courseProgressData = [
  {
    course: "React Fundamentals",
    progress: 85,
    enrollments: 120,
    completions: 102,
  },
  {
    course: "JavaScript Advanced",
    progress: 92,
    enrollments: 95,
    completions: 87,
  },
  { course: "Node.js Backend", progress: 78, enrollments: 80, completions: 62 },
  {
    course: "Database Design",
    progress: 100,
    enrollments: 60,
    completions: 60,
  },
  { course: "UI/UX Design", progress: 65, enrollments: 45, completions: 29 },
];

// Attendance trend data
const attendanceTrendData = [
  { month: "Jan", users: 88 },
  { month: "Feb", users: 92 },
  { month: "Mar", users: 89 },
  { month: "Apr", users: 94 },
  { month: "May", users: 96 },
  { month: "Jun", users: 94 },
];

// Upcoming classes data
const upcomingClasses = [
  {
    id: 1,
    subject: "React Fundamentals",
    instructor: "Prof. Sarah Johnson",
    date: "Today",
    time: "10:00 AM",
    room: "Room 201",
  },
  {
    id: 2,
    subject: "JavaScript Advanced",
    instructor: "Prof. Mike Chen",
    date: "Tomorrow",
    time: "2:00 PM",
    room: "Room 105",
  },
  {
    id: 3,
    subject: "Database Design",
    instructor: "Prof. Emily Davis",
    date: "Friday",
    time: "11:00 AM",
    room: "Room 302",
  },
];

// Recent announcements data
const recentAnnouncements = [
  {
    id: 1,
    title: "Midterm Exam Schedule Released",
    content:
      "The midterm exam schedule for all courses has been published. Please check your course pages for details.",
    timestamp: "2 hours ago",
    type: "exam",
  },
  {
    id: 2,
    title: "Assignment Submission Deadline Extended",
    content:
      "The deadline for React Fundamentals assignment has been extended to next Friday.",
    timestamp: "1 day ago",
    type: "assignment",
  },
  {
    id: 3,
    title: "New Course Material Available",
    content:
      "New video lectures for JavaScript Advanced course are now available in the course portal.",
    timestamp: "2 days ago",
    type: "course",
  },
];

export default function StudentDashboard() {
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
          Welcome back, Student! 👋
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
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {classItem.subject}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {classItem.instructor}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {classItem.date} at {classItem.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {classItem.room}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1">
                          {announcement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {announcement.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
