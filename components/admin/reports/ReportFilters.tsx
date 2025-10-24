"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { ReportFilters } from "@/types/report";
import { Search, Filter, X, Calendar, Users } from "lucide-react";

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  availableCourses?: string[];
  showUserTypeFilter?: boolean;
  showCourseFilter?: boolean;
  showTimeRangeFilter?: boolean;
  isLoading?: boolean;
}

export default function ReportFiltersComponent({
  filters,
  onFiltersChange,
  availableCourses = [],
  showUserTypeFilter = false,
  showCourseFilter = false,
  showTimeRangeFilter = true,
  isLoading = false,
}: ReportFiltersProps) {
  const updateFilter = (
    key: keyof ReportFilters,
    value: ReportFilters[keyof ReportFilters]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      timeRange: "30days",
      course: undefined,
      userType: "all",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.course !== undefined ||
    filters.userType !== "all" ||
    filters.timeRange !== "30days";

  return (
    <Card
      className={cn(
        glassStyles.card,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, course, or event..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
              disabled={isLoading}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Time Range Filter */}
            {showTimeRangeFilter && (
              <div className="flex-1">
                <Select
                  value={filters.timeRange}
                  onValueChange={(value) => updateFilter("timeRange", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                    <SelectItem value="1year">Last 1 year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Course Filter */}
            {showCourseFilter && availableCourses.length > 0 && (
              <div className="flex-1">
                <Select
                  value={filters.course || "all"}
                  onValueChange={(value) =>
                    updateFilter("course", value === "all" ? undefined : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {availableCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* User Type Filter */}
            {showUserTypeFilter && (
              <div className="flex-1">
                <Select
                  value={filters.userType || "all"}
                  onValueChange={(value) => updateFilter("userType", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                  Search: &quot;{filters.search}&quot;
                </span>
              )}
              {filters.timeRange && filters.timeRange !== "30days" && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {filters.timeRange === "6months"
                    ? "6 months"
                    : filters.timeRange === "1year"
                    ? "1 year"
                    : filters.timeRange === "all"
                    ? "All time"
                    : "30 days"}
                </span>
              )}
              {filters.course && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs">
                  Course: {filters.course}
                </span>
              )}
              {filters.userType && filters.userType !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {filters.userType}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
