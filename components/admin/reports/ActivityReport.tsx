"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { ActivityReportProps, ExportOptions } from "@/types/report";
import ReportFiltersComponent from "./ReportFilters";
import ExportButton from "./ExportButton";
import {
  Users,
  Activity,
  Clock,
  LogIn,
  BookOpen,
  FileText,
  Settings,
  Loader2,
  Calendar,
  User,
  GraduationCap,
  Shield,
} from "lucide-react";

export default function ActivityReport({
  data,
  filters,
  onFiltersChange,
  isLoading = false,
}: ActivityReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showGrouped, setShowGrouped] = useState(false);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    let filteredEvents = showGrouped
      ? data.groupedEvents
      : [{ date: "Recent", events: data.recentEvents }];

    // Filter by user type
    if (filters.userType && filters.userType !== "all") {
      filteredEvents = filteredEvents.map((group) => ({
        ...group,
        events: group.events.filter(
          (event) => event.userType === filters.userType
        ),
      }));
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredEvents = filteredEvents.map((group) => ({
        ...group,
        events: group.events.filter(
          (event) =>
            event.userName.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm)
        ),
      }));
    }

    // Filter by time range
    if (filters.timeRange !== "all") {
      const daysToShow =
        filters.timeRange === "30days"
          ? 30
          : filters.timeRange === "6months"
          ? 180
          : 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToShow);

      filteredEvents = filteredEvents.map((group) => ({
        ...group,
        events: group.events.filter(
          (event) => new Date(event.timestamp) >= cutoffDate
        ),
      }));
    }

    return filteredEvents.filter((group) => group.events.length > 0);
  }, [data, filters, showGrouped]);

  const handleExport = (options: ExportOptions) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login":
        return <LogIn className="h-4 w-4 text-blue-600" />;
      case "course_completion":
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case "assignment_submission":
        return <FileText className="h-4 w-4 text-purple-600" />;
      case "system_event":
        return <Settings className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "student":
        return <User className="h-4 w-4 text-blue-600" />;
      case "teacher":
        return <GraduationCap className="h-4 w-4 text-green-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "teacher":
        return "bg-green-100 text-green-800 border-green-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Activity Report
          </h2>
          <p className="text-muted-foreground">
            Monitor user activity and system events
          </p>
        </div>
        <ExportButton onExport={handleExport} isLoading={isExporting} />
      </div>

      {/* Filters */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        showUserTypeFilter={true}
        showTimeRangeFilter={true}
        isLoading={isLoading}
      />

      {/* KPI Cards */}
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
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {data.totalEvents}
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
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Unique Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {data.uniqueUsers}
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
                <LogIn className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Logins
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {data.recentEvents.filter((e) => e.type === "login").length}
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
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Course Completions
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    data.recentEvents.filter(
                      (e) => e.type === "course_completion"
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrouped(false)}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              !showGrouped
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Recent Events
          </button>
          <button
            onClick={() => setShowGrouped(true)}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium transition-colors",
              showGrouped
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Grouped by Date
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {filteredData.map((group) => (
          <Card
            key={group.date}
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                {group.date === "Recent"
                  ? "Recent Activity"
                  : new Date(group.date).toLocaleDateString()}
                <Badge variant="secondary" className="ml-2">
                  {group.events.length} events
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/30 transition-colors duration-200"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`/avatars/${event.userName
                              .toLowerCase()
                              .replace(" ", "-")}.jpg`}
                          />
                          <AvatarFallback className="text-xs">
                            {event.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {event.userName}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getUserTypeColor(event.userType)
                          )}
                        >
                          {getUserTypeIcon(event.userType)}
                          <span className="ml-1 capitalize">
                            {event.userType}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted/50">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No activity found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters to find activity
                  events.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
