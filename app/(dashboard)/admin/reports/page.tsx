"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { ReportFilters } from "@/types/report";
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
import { mockAttendanceData } from "@/data/reports/attendance";
import { mockPerformanceData } from "@/data/reports/performance";
import { mockActivityData } from "@/data/reports/activity";

type ReportType = "attendance" | "performance" | "activity";

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("attendance");
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const renderReport = () => {
    switch (activeReport) {
      case "attendance":
        return (
          <AttendanceReport
            data={mockAttendanceData}
            filters={attendanceFilters}
            onFiltersChange={setAttendanceFilters}
            isLoading={isLoading}
          />
        );
      case "performance":
        return (
          <PerformanceReport
            data={mockPerformanceData}
            filters={performanceFilters}
            onFiltersChange={setPerformanceFilters}
            isLoading={isLoading}
          />
        );
      case "activity":
        return (
          <ActivityReport
            data={mockActivityData}
            filters={activityFilters}
            onFiltersChange={setActivityFilters}
            isLoading={isLoading}
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
                <p className="text-2xl font-bold text-foreground">2,543</p>
                <p className="text-xs text-green-600">+12% from last month</p>
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
                  Course Completions
                </p>
                <p className="text-2xl font-bold text-foreground">1,240</p>
                <p className="text-xs text-green-600">+8% from last month</p>
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
                  Avg Performance
                </p>
                <p className="text-2xl font-bold text-foreground">87.5%</p>
                <p className="text-xs text-green-600">+3.2% from last month</p>
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
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-foreground">342</p>
                <p className="text-xs text-green-600">+15% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
