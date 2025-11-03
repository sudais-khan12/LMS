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
import { StudentFilters } from "@/types/student";
import { Search, Filter, X } from "lucide-react";

interface StudentFiltersProps {
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  availableCourses: string[] | Array<{ id: string; title: string }>;
  isLoading?: boolean;
}

export default function StudentFiltersComponent({
  filters,
  onFiltersChange,
  availableCourses,
  isLoading = false,
}: StudentFiltersProps) {
  const updateFilter = (key: keyof StudentFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "All",
      course: "All",
      attendanceRange: "All",
    });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "All" ||
    filters.course !== "All" ||
    filters.attendanceRange !== "All";

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
              placeholder="Search by name, email, student ID, or department..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
              disabled={isLoading}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Filter */}
            <div className="flex-1">
              <Select
                value={filters.course}
                onValueChange={(value) => updateFilter("course", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Courses</SelectItem>
                  {availableCourses.map((course) => {
                    const courseId = typeof course === 'string' ? course : course.id;
                    const courseName = typeof course === 'string' ? course : course.title;
                    return (
                      <SelectItem key={courseId} value={courseId}>
                        {courseName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Attendance Range Filter */}
            <div className="flex-1">
              <Select
                value={filters.attendanceRange}
                onValueChange={(value) =>
                  updateFilter("attendanceRange", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Filter by attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Attendance</SelectItem>
                  <SelectItem value="0-50">0-50%</SelectItem>
                  <SelectItem value="51-80">51-80%</SelectItem>
                  <SelectItem value="81-100">81-100%</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              {filters.status !== "All" && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs">
                  Status: {filters.status}
                </span>
              )}
              {filters.course !== "All" && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs">
                  Course: {availableCourses.length > 0 && typeof availableCourses[0] === 'object' 
                    ? (availableCourses as Array<{ id: string; title: string }>).find(c => c.id === filters.course)?.title || filters.course
                    : filters.course}
                </span>
              )}
              {filters.attendanceRange !== "All" && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs">
                  Attendance: {filters.attendanceRange}%
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
