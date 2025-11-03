"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search,
  BookOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  useStudentCourses,
  type StudentCourse as ApiStudentCourse,
} from "@/lib/hooks/api/student";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ApiSuccess } from "@/lib/api/response";

interface StudentCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  description: string;
  progress: number;
  status: "Enrolled" | "Completed" | "In Progress";
  level: string;
  assignmentsCount: number;
  completedAssignments: number;
  attendancePercentage: number;
}

type SortField = "title" | "instructor" | "progress" | "status" | "category";
type SortDirection = "asc" | "desc";

// Course Card Component
function CourseCard({
  course,
  onView,
  onUnenroll,
  isLoading,
}: {
  course: StudentCourse;
  onView: () => void;
  onUnenroll: () => void;
  isLoading?: boolean;
}) {
  return (
    <Card
      className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn,
        "group"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
              {course.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-2">
              {course.instructor}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                {course.category}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                {course.status}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{course.progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {course.completedAssignments} of {course.assignmentsCount} assignments completed
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onView}
            disabled={isLoading}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onUnenroll}
            disabled={isLoading}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyCoursesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(
    null
  );
  const [isCourseDetailsModalOpen, setIsCourseDetailsModalOpen] =
    useState(false);
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [courseToUnenroll, setCourseToUnenroll] = useState<StudentCourse | null>(null);

  // API hooks
  const {
    data: coursesData,
    isLoading,
    error,
  } = useStudentCourses({
    limit: 100,
  });

  const queryClient = useQueryClient();
  const [isUnenrolling, setIsUnenrolling] = useState<string | null>(null);

  const courses = useMemo(() => {
    return coursesData?.items || [];
  }, [coursesData]);

  // Extract unique categories from courses
  const courseCategories = useMemo(() => {
    const categories = new Set<string>(["All"]);
    courses.forEach((course) => {
      if (course.category) categories.add(course.category);
    });
    return Array.from(categories);
  }, [courses]);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || course.status === filterStatus;
      const matchesCategory =
        filterCategory === "All" || course.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort courses
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "instructor":
          aValue = a.instructor.toLowerCase();
          bValue = b.instructor.toLowerCase();
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    courses,
    searchTerm,
    filterStatus,
    filterCategory,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const handleViewCourse = (course: StudentCourse) => {
    setSelectedCourse(course);
    setIsCourseDetailsModalOpen(true);
  };

  const handleUnenrollClick = (course: StudentCourse) => {
    setCourseToUnenroll(course);
    setIsUnenrollModalOpen(true);
  };

  const handleConfirmUnenroll = async () => {
    if (!courseToUnenroll) return;

    setIsUnenrolling(courseToUnenroll.id);
    try {
      const response = await apiClient<ApiSuccess<{ message: string }>>(
        `/api/student/courses/${courseToUnenroll.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Successfully unenrolled from course",
        });
        queryClient.invalidateQueries({ queryKey: ["student", "courses"] });
        setIsUnenrollModalOpen(false);
        setCourseToUnenroll(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unenroll from course",
        variant: "destructive",
      });
    } finally {
      setIsUnenrolling(null);
    }
  };

  const handleContinueLearning = async (courseId: string) => {
    toast({
      title: "Opening Course",
      description: "Course content will open in assignments page.",
      variant: "default",
    });
    // Could navigate to assignments page filtered by course
    window.location.href = `/student/assignments?courseId=${courseId}`;
  };

  // Statistics
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => course.status === "Completed"
    ).length;
    const activeCourses = courses.filter(
      (course) => course.status === "In Progress"
    ).length;
    const avgProgress =
      courses.reduce((acc, course) => acc + course.progress, 0) / totalCourses;

    return {
      total: totalCourses,
      completed: completedCourses,
      active: activeCourses,
      avgProgress: Math.round(avgProgress),
    };
  }, [courses]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Courses 📚
            </h1>
            <p className="text-muted-foreground">
              Manage and track your learning progress across all enrolled
              courses.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by name, instructor, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Enrolled">Enrolled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40 bg-background/50 border-border/50">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {courseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stats.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <BookOpen className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stats.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Progress
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stats.avgProgress}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sorting Controls */}
      <Card
        className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Sort by:
            </span>
            <div className="flex gap-2">
              <Button
                variant={sortField === "title" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("title")}
                className="flex items-center gap-2"
              >
                Title {getSortIcon("title")}
              </Button>
              <Button
                variant={sortField === "progress" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("progress")}
                className="flex items-center gap-2"
              >
                Progress {getSortIcon("progress")}
              </Button>
              <Button
                variant={sortField === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("status")}
                className="flex items-center gap-2"
              >
                Status {getSortIcon("status")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {error.message || "Failed to load courses. Please try again later."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onView={() => handleViewCourse(course)}
              onUnenroll={() => handleUnenrollClick(course)}
              isLoading={isUnenrolling === course.id}
            />
          ))}
        </div>
      )}

      {/* Empty State (if no courses) */}
      {!isLoading && !error && filteredAndSortedCourses.length === 0 && courses.length === 0 && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "All" || filterCategory !== "All"
                ? "Try adjusting your search or filter criteria."
                : "You haven't enrolled in any courses yet. Start your learning journey today!"}
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = "/student"}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Unenroll Confirmation Modal */}
      {courseToUnenroll && (
        <Dialog open={isUnenrollModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsUnenrollModalOpen(false);
            setCourseToUnenroll(null);
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Unenroll from Course
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to unenroll from "{courseToUnenroll.title}"? This action will remove all your attendance records and submissions for this course. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsUnenrollModalOpen(false);
                  setCourseToUnenroll(null);
                }} 
                disabled={isUnenrolling !== null}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmUnenroll}
                disabled={isUnenrolling !== null}
              >
                {isUnenrolling !== null ? "Unenrolling..." : "Unenroll"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <Dialog open={isCourseDetailsModalOpen} onOpenChange={setIsCourseDetailsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Course Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Card className={cn(glassStyles.card, "rounded-xl shadow-glass-sm")}>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground mb-2">
                    {selectedCourse.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {selectedCourse.category}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                      {selectedCourse.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Instructor: {selectedCourse.instructor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{selectedCourse.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${selectedCourse.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {selectedCourse.completedAssignments} of {selectedCourse.assignmentsCount} assignments completed
                      </span>
                      <span>
                        Attendance: {selectedCourse.attendancePercentage}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleContinueLearning(selectedCourse.id)}
                  className="flex-1"
                >
                  View Assignments
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCourseDetailsModalOpen(false);
                    setSelectedCourse(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
