"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { ReportFilters, AttendanceReportData, PerformanceReportData, ActivityReportData } from "@/types/report";
import AttendanceReport from "@/components/admin/reports/AttendanceReport";
import PerformanceReport from "@/components/admin/reports/PerformanceReport";
import ActivityReport from "@/components/admin/reports/ActivityReport";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Users,
  Award,
  Loader2,
} from "lucide-react";
import {
  useAdminAttendanceReport,
  useAdminGradesReport,
  useAdminReports,
} from "@/lib/hooks/api/admin";

type ReportType = "attendance" | "performance" | "activity";

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("attendance");

  // Report-specific filters
  const [attendanceFilters, setAttendanceFilters] = useState<ReportFilters>({
    timeRange: "6months",
    course: undefined,
  });

  const [performanceFilters, setPerformanceFilters] = useState<ReportFilters>({
    timeRange: "all",
    course: undefined,
    search: "",
  });

  const [activityFilters, setActivityFilters] = useState<ReportFilters>({
    timeRange: "30days",
    userType: "all",
    search: "",
  });

  // Fetch report data
  const { 
    data: attendanceReportData, 
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance,
  } = useAdminAttendanceReport({
    courseId: attendanceFilters.course,
  });

  const { 
    data: gradesReportData, 
    isLoading: isLoadingGrades,
    refetch: refetchGrades,
  } = useAdminGradesReport();

  const { 
    data: overviewData, 
    isLoading: isLoadingOverview,
    refetch: refetchOverview,
  } = useAdminReports();

  // Transform attendance API data to component format
  const attendanceData: AttendanceReportData | null = useMemo(() => {
    if (!attendanceReportData) return null;

    // Calculate monthly attendance trend (last 12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyData: Array<{ month: string; attendance: number; students: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];
      // For now, use overall percentage for all months (could be enhanced with actual monthly data)
      monthlyData.push({
        month: monthName,
        attendance: attendanceReportData.overallAttendancePercentage,
        students: attendanceReportData.studentStats.length,
      });
    }

    // Transform course stats
    const courseStats = attendanceReportData.courseStats.map((course) => {
      // Calculate trend (simplified - could compare with previous period)
      const trend = course.attendancePercentage >= 90 ? "up" : 
                    course.attendancePercentage < 80 ? "down" : "stable";
      
      // Estimate low attendance alerts (students with < 70% attendance)
      const lowAttendanceCount = attendanceReportData.studentStats.filter(
        (student) => student.attendancePercentage < 70
      ).length;

      return {
        courseId: course.courseId,
        courseName: course.courseName,
        totalStudents: attendanceReportData.studentStats.filter(
          (s) => attendanceReportData.courseStats.some(c => c.courseId === course.courseId)
        ).length || 0,
        averageAttendance: course.attendancePercentage,
        attendanceTrend: trend,
        lowAttendanceAlerts: Math.round(lowAttendanceCount * (course.totalClasses / attendanceReportData.studentStats.reduce((sum, s) => sum + s.totalClasses, 0))) || 0,
      };
    });

    // Calculate KPIs
    const topCourse = courseStats.length > 0 
      ? courseStats.reduce((top, course) => 
          course.averageAttendance > top.averageAttendance ? course : top
        ).courseName
      : "N/A";

    const lowAttendanceAlerts = attendanceReportData.studentStats.filter(
      (s) => s.attendancePercentage < 70
    ).length;

    return {
      trendData: monthlyData,
      courseStats,
      kpis: {
        averageAttendance: attendanceReportData.overallAttendancePercentage,
        topCourse,
        lowAttendanceAlerts,
        totalStudents: attendanceReportData.studentStats.length,
      },
    };
  }, [attendanceReportData]);

  // Transform performance API data to component format
  const performanceData: PerformanceReportData | null = useMemo(() => {
    if (!gradesReportData || !overviewData) return null;

    // Transform course grades
    const courseGrades = gradesReportData.byCourse.map((course) => {
      const passRate = course.totalSubmissions > 0
        ? ((course.distribution.A + course.distribution.B + course.distribution.C) / course.totalSubmissions) * 100
        : 0;

      return {
        courseName: course.courseName,
        averageGrade: course.averageGrade,
        totalStudents: course.uniqueStudents,
        passRate: Math.round(passRate * 10) / 10,
      };
    });

    // Calculate overall grade distribution
    const totalGrades = gradesReportData.overall.distribution.A +
                       gradesReportData.overall.distribution.B +
                       gradesReportData.overall.distribution.C +
                       gradesReportData.overall.distribution.D +
                       gradesReportData.overall.distribution.F;

    const gradeDistribution = [
      { grade: "A", count: gradesReportData.overall.distribution.A, percentage: totalGrades > 0 ? Math.round((gradesReportData.overall.distribution.A / totalGrades) * 100) : 0 },
      { grade: "B", count: gradesReportData.overall.distribution.B, percentage: totalGrades > 0 ? Math.round((gradesReportData.overall.distribution.B / totalGrades) * 100) : 0 },
      { grade: "C", count: gradesReportData.overall.distribution.C, percentage: totalGrades > 0 ? Math.round((gradesReportData.overall.distribution.C / totalGrades) * 100) : 0 },
      { grade: "D", count: gradesReportData.overall.distribution.D, percentage: totalGrades > 0 ? Math.round((gradesReportData.overall.distribution.D / totalGrades) * 100) : 0 },
      { grade: "F", count: gradesReportData.overall.distribution.F, percentage: totalGrades > 0 ? Math.round((gradesReportData.overall.distribution.F / totalGrades) * 100) : 0 },
    ];

    // Find below threshold students (GPA < 2.0 or attendance < 70%)
    const belowThresholdStudents = overviewData.studentsWithGpa
      .filter((student) => 
        (student.latestGpa !== null && student.latestGpa < 2.0) ||
        (attendanceReportData?.studentStats.find(s => s.studentId === student.id)?.attendancePercentage || 0) < 70
      )
      .map((student) => {
        const attendance = attendanceReportData?.studentStats.find(s => s.studentId === student.id);
        const grade = student.latestGpa !== null 
          ? student.latestGpa >= 3.5 ? "A" :
            student.latestGpa >= 3.0 ? "B" :
            student.latestGpa >= 2.5 ? "C" :
            student.latestGpa >= 2.0 ? "D" : "F"
          : "N/A";

        // Find which course they're in (simplified - could be improved)
        const course = gradesReportData.byCourse[0]?.courseName || "N/A";

        return {
          studentId: student.id,
          studentName: student.name,
          courseName: course,
          grade,
          gpa: student.latestGpa || 0,
          attendance: attendance?.attendancePercentage || 0,
          isBelowThreshold: true,
        };
      });

    return {
      courseGrades,
      gradeDistribution,
      belowThresholdStudents,
    };
  }, [gradesReportData, overviewData, attendanceReportData]);

  // Transform activity data from overview
  const activityData: ActivityReportData | null = useMemo(() => {
    // Use recent activities from overview endpoint
    // This would need to be fetched separately, for now we'll create a minimal structure
    return {
      recentEvents: [],
      groupedEvents: [],
      totalEvents: 0,
      uniqueUsers: overviewData?.usersByRole.reduce((sum, r) => sum + r.count, 0) || 0,
    };
  }, [overviewData]);

  const reportTabs = [
    {
      id: "attendance" as ReportType,
      label: "Attendance Overview",
      icon: Calendar,
      description: "Track attendance trends and course performance",
    },
    {
      id: "performance" as ReportType,
      label: "Student Performance",
      icon: TrendingUp,
      description: "Analyze academic performance and identify at-risk students",
    },
    {
      id: "activity" as ReportType,
      label: "Activity Report",
      icon: Activity,
      description: "Monitor user activity and system events",
    },
  ];

  const handleReportChange = (reportType: ReportType) => {
    setActiveReport(reportType);
  };

  const handleRefresh = async () => {
    // Refetch all reports data
    await Promise.all([
      refetchAttendance(),
      refetchGrades(),
      refetchOverview(),
    ]);
  };

  const isLoading = isLoadingAttendance || isLoadingGrades || isLoadingOverview;

  const renderReport = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading report data...</p>
          </div>
        </div>
      );
    }

    switch (activeReport) {
      case "attendance":
        if (!attendanceData) {
          return (
            <div className="flex items-center justify-center min-h-[600px]">
              <p className="text-muted-foreground">No attendance data available</p>
            </div>
          );
        }
        return (
          <AttendanceReport
            data={attendanceData}
            filters={attendanceFilters}
            onFiltersChange={setAttendanceFilters}
            isLoading={isLoadingAttendance}
          />
        );
      case "performance":
        if (!performanceData) {
          return (
            <div className="flex items-center justify-center min-h-[600px]">
              <p className="text-muted-foreground">No performance data available</p>
            </div>
          );
        }
        return (
          <PerformanceReport
            data={performanceData}
            filters={performanceFilters}
            onFiltersChange={setPerformanceFilters}
            isLoading={isLoadingGrades}
          />
        );
      case "activity":
        if (!activityData) {
          return (
            <div className="flex items-center justify-center min-h-[600px]">
              <p className="text-muted-foreground">No activity data available</p>
            </div>
          );
        }
        return (
          <ActivityReport
            data={activityData}
            filters={activityFilters}
            onFiltersChange={setActivityFilters}
            isLoading={isLoadingOverview}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Reports & Analytics 📊
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into platform performance and user
              engagement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <Card
        className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {reportTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeReport === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleReportChange(tab.id)}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 p-4 rounded-lg text-left transition-all duration-200",
                    "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isActive
                      ? "bg-primary/10 border-2 border-primary/20"
                      : "bg-muted/20 border-2 border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3
                      className={cn(
                        "font-semibold",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {tab.label}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="min-h-[600px]">{renderReport()}</div>

      {/* Quick Stats Footer */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {overviewData.usersByRole.reduce((sum, r) => sum + r.count, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {overviewData.usersByRole.map(r => `${r.role}: ${r.count}`).join(", ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-100">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {overviewData.totals.submissions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {overviewData.totals.assignments} assignments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-100">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg GPA
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {overviewData.avgGpa.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Across all students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-100">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Courses
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {overviewData.totals.courses}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active courses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
