"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import ChartCard from "@/components/ui/ChartCard";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  GraduationCap,
  UserCheck,
  Calendar,
  Clock,
  Award,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  Target,
  Zap
} from "lucide-react";

// Mock analytics data
const userGrowthData = [
  { month: "Jan", users: 1200, students: 800, teachers: 50 },
  { month: "Feb", users: 1350, students: 920, teachers: 55 },
  { month: "Mar", users: 1420, students: 980, teachers: 58 },
  { month: "Apr", users: 1580, students: 1100, teachers: 62 },
  { month: "May", users: 1720, students: 1200, teachers: 65 },
  { month: "Jun", users: 1890, students: 1320, teachers: 68 },
  { month: "Jul", users: 2100, students: 1450, teachers: 72 },
  { month: "Aug", users: 2250, students: 1580, teachers: 75 },
  { month: "Sep", users: 2380, students: 1680, teachers: 78 },
  { month: "Oct", users: 2543, students: 1800, teachers: 82 },
];

const courseEngagementData = [
  { course: "React Fundamentals", enrollments: 450, completions: 380, revenue: 134550 },
  { course: "JavaScript Advanced", enrollments: 320, completions: 280, revenue: 127680 },
  { course: "Node.js Backend", enrollments: 280, completions: 240, revenue: 125720 },
  { course: "Database Design", enrollments: 200, completions: 180, revenue: 49800 },
  { course: "UI/UX Design", enrollments: 180, completions: 160, revenue: 50220 },
];

const attendanceTrendData = [
  { month: "Jan", attendance: 88 },
  { month: "Feb", attendance: 92 },
  { month: "Mar", attendance: 89 },
  { month: "Apr", attendance: 94 },
  { month: "May", attendance: 96 },
  { month: "Jun", attendance: 94 },
  { month: "Jul", attendance: 97 },
  { month: "Aug", attendance: 95 },
  { month: "Sep", attendance: 93 },
  { month: "Oct", attendance: 96 },
];

const performanceMetrics = [
  {
    title: "Total Revenue",
    value: "$487,970",
    change: "+23%",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Course Completion Rate",
    value: "84.2%",
    change: "+5.1%",
    changeType: "positive" as const,
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Student Satisfaction",
    value: "4.7/5",
    change: "+0.3",
    changeType: "positive" as const,
    icon: Award,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Active Users",
    value: "2,543",
    change: "+15%",
    changeType: "positive" as const,
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "course_completion",
    message: "Sarah completed React Fundamentals course",
    timestamp: "2 minutes ago",
    icon: BookOpen,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "user_registration",
    message: "New student John Doe registered",
    timestamp: "15 minutes ago",
    icon: Users,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "teacher_assignment",
    message: "Mike assigned to JavaScript Advanced course",
    timestamp: "1 hour ago",
    icon: GraduationCap,
    color: "text-purple-600",
  },
  {
    id: 4,
    type: "system_update",
    message: "System maintenance completed successfully",
    timestamp: "2 hours ago",
    icon: Zap,
    color: "text-orange-600",
  },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "rounded-2xl p-6",
        glassStyles.card,
        "shadow-glass-sm",
        animationClasses.fadeIn
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Analytics & Reports 📊
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into platform performance and user engagement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className={cn(
                glassStyles.card,
                glassStyles.cardHover,
                "rounded-2xl shadow-glass-sm",
                animationClasses.scaleIn
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", metric.bgColor)}>
                    <Icon className={cn("h-6 w-6", metric.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">{metric.change}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="User Growth Trend"
          data={userGrowthData}
          type="line"
        />
        <ChartCard
          title="Course Engagement"
          data={courseEngagementData}
          type="bar"
        />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Attendance Trend"
          data={attendanceTrendData}
          type="line"
        />
        
        {/* Revenue Breakdown */}
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseEngagementData.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{course.course}</span>
                    <span className="text-sm text-muted-foreground">${course.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(course.revenue / Math.max(...courseEngagementData.map(c => c.revenue))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-1">
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
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className={cn("h-4 w-4", activity.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Eye className="h-5 w-5 text-primary" />
                Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">New Users This Month</p>
                      <p className="text-2xl font-bold text-foreground">163</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-green-100">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Courses Completed</p>
                      <p className="text-2xl font-bold text-foreground">1,240</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-100">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Teachers</p>
                      <p className="text-2xl font-bold text-foreground">82</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-orange-100">
                      <UserCheck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Online Students</p>
                      <p className="text-2xl font-bold text-foreground">342</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">12.4%</p>
                <p className="text-xs text-green-600">+2.1% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Session Time</p>
                <p className="text-2xl font-bold text-foreground">24m</p>
                <p className="text-xs text-blue-600">+3m from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold text-foreground">78.5%</p>
                <p className="text-xs text-purple-600">+5.2% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
