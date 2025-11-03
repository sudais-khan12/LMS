"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import StatCard from "@/components/ui/StatCard";
import ChartCard from "@/components/ui/ChartCard";
import DataTable from "@/components/ui/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  glassStyles,
  animationClasses 
} from "@/config/constants";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import { 
  Activity, 
  Clock, 
  TrendingUp,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalCourses: 0,
    activeTeachers: 0,
    activeStudents: 0,
  });
  const [userGrowthData, setUserGrowthData] = React.useState<any[]>([]);
  const [courseEngagementData, setCourseEngagementData] = React.useState<any[]>([]);
  const [recentActivities, setRecentActivities] = React.useState<any[]>([]);
  const [recentUsers, setRecentUsers] = React.useState<any[]>([]);
  const [newUsersToday, setNewUsersToday] = React.useState<number>(0);
  const [overviewData, setOverviewData] = React.useState<any>(null);

  React.useEffect(() => {
    console.log("Session status:", sessionStatus);
    console.log("Session data:", session);
    
    const fetchDashboardData = async () => {
      // Wait for session to load
      if (sessionStatus === "loading") {
        return;
      }
      
      // Since middleware allowed access to this page, we're authenticated
      // Proceed with API calls - they'll work or fail appropriately
      setLoading(true);
      setError(null);
      
      try {
        // Fetch overview data
        const overviewResponse = await apiClient<{
          success: boolean;
          data: {
            totals: {
              users: number;
              teachers: number;
              students: number;
              courses: number;
              assignments: number;
              submissions: number;
              avgGPA: number;
            };
            recentActivity: Array<{
              id: string;
              type: string;
              description: string;
              timestamp: string;
              user: { name: string; email: string };
            }>;
            userGrowth?: Array<{
              month: string;
              users: number;
            }>;
            newUsersToday?: number;
            courseEngagement?: Array<{
              course: string;
              enrollments: number;
              completions: number;
            }>;
          };
        }>("/api/reports/admin/overview");

        console.log("Overview response:", overviewResponse);

        if (overviewResponse.success && overviewResponse.data) {
          const { totals, recentActivity } = overviewResponse.data;
          setOverviewData(overviewResponse.data);
          
          if (overviewResponse.data.newUsersToday !== undefined) {
            setNewUsersToday(overviewResponse.data.newUsersToday);
          }
          
          setStats({
            totalUsers: totals.users,
            totalCourses: totals.courses,
            activeTeachers: totals.teachers,
            activeStudents: totals.students,
          });

          // Format recent activities
          const formattedActivities = recentActivity.slice(0, 5).map((activity) => {
            const timeAgo = new Date(activity.timestamp);
            const now = new Date();
            const diffMs = now.getTime() - timeAgo.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            let timestamp = "";
            if (diffMins < 60) {
              timestamp = `${diffMins} minutes ago`;
            } else if (diffHours < 24) {
              timestamp = `${diffHours} hours ago`;
            } else {
              timestamp = `${diffDays} days ago`;
            }

            return {
              id: activity.id,
              type: activity.type,
              message: activity.description,
              timestamp,
              icon: activity.type === "submission" ? BookOpen : Users,
            };
          });
          setRecentActivities(formattedActivities);

          // Use real user growth data from API
          if (overviewResponse.data.userGrowth) {
            setUserGrowthData(overviewResponse.data.userGrowth);
          }
        }

        // Fetch recent users (most recently created)
        const usersResponse = await apiClient<{
          success: boolean;
          data: {
            items: Array<{
              id: string;
              name: string;
              email: string;
              role: string;
              createdAt: string;
            }>;
          };
        }>("/api/admin/users?limit=5");

        console.log("Users response:", usersResponse);

        if (usersResponse.success && usersResponse.data) {
          const formattedUsers = usersResponse.data.items.map((user) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role === "ADMIN" ? "Admin" : user.role === "TEACHER" ? "Teacher" : "Student",
              status: "Active" as const,
              joinDate: new Date(user.createdAt).toLocaleDateString(),
              avatar: initials,
            };
          });
          setRecentUsers(formattedUsers);
        }

        // Use course engagement data from API if available
        if (overviewResponse.data.courseEngagement) {
          setCourseEngagementData(overviewResponse.data.courseEngagement);
        } else {
          // Fallback: fetch courses and calculate engagement
          const coursesResponse = await apiClient<{
            success: boolean;
            data: {
              items: Array<{
                id: string;
                title: string;
                code: string;
                _count?: {
                  assignments?: number;
                  attendance?: number;
                };
              }>;
            };
          }>("/api/admin/courses?limit=10");

          console.log("Courses response:", coursesResponse);

          if (coursesResponse.success && coursesResponse.data) {
            // Calculate simple engagement data based on counts
            const engagementData = coursesResponse.data.items.map((course) => {
              const enrollments = course._count?.attendance || 0;
              const assignmentsCount = course._count?.assignments || 0;
              // Estimate completions based on enrollments and assignments
              const completions = Math.round(enrollments * 0.7); // 70% completion rate estimate
              return {
                course: course.title,
                enrollments,
                completions: Math.min(completions, enrollments),
              };
            });
            setCourseEngagementData(engagementData);
          }
        }

      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        setError(error?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, sessionStatus]);

  // Format stats data for StatCard
  const statsData = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Total Courses",
      value: stats.totalCourses.toString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: BookOpen,
    },
    {
      title: "Active Teachers",
      value: stats.activeTeachers.toString(),
      change: "+5%",
      changeType: "positive" as const,
      icon: GraduationCap,
    },
    {
      title: "Active Students",
      value: stats.activeStudents.toString(),
      change: "+15%",
      changeType: "positive" as const,
      icon: UserCheck,
    },
  ];

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {sessionStatus === "loading" ? "Loading session..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please refresh the page or check your connection.
          </p>
        </div>
      </div>
    );
  }

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
          Welcome back, Admin! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your LMS today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
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
          title="User Growth"
          data={userGrowthData}
          type="line"
        />
        <ChartCard
          title="Course Engagement"
          data={courseEngagementData}
          type="bar"
        />
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
                        <Icon className="h-4 w-4 text-primary" />
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
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Overview
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
                      <p className="text-sm font-medium text-muted-foreground">New Users Today</p>
                      <p className="text-2xl font-bold text-foreground">
                        {newUsersToday}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-green-100">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalCourses}</p>
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
                      <p className="text-2xl font-bold text-foreground">{stats.activeTeachers}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-orange-100">
                      <UserCheck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeStudents}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Users Table */}
      {recentUsers.length > 0 && (
        <DataTable
          title="Recent Users"
          data={recentUsers}
          columns={["User", "Role", "Status", "Join Date"]}
        />
      )}
    </div>
  );
}
