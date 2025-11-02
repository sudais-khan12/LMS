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
import {
  Search,
  Filter,
  BookOpen,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
} from "lucide-react";
import {
  StudentCourse,
  mockStudentCourses,
  courseCategories,
  CourseCard,
  CourseEnrollmentModal,
  CourseDetailsModal,
} from "@/features/courses";
import {
  useStudentCourses,
  type StudentCourse as ApiStudentCourse,
} from "@/lib/hooks/api/student";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

type SortField = "title" | "instructor" | "progress" | "status" | "category";
type SortDirection = "asc" | "desc";

function mapApiCourseToUI(course: ApiStudentCourse): StudentCourse {
  return {
    id: parseInt(course.id) || 0,
    title: course.title,
    instructor: course.instructor || "Unknown",
    category: course.category || "Uncategorized",
    description: course.description || "",
    progress: course.progress || 0,
    status: (course.status || "Enrolled") as
      | "Enrolled"
      | "Completed"
      | "In Progress",
    level: course.level || "Beginner",
  };
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
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isCourseDetailsModalOpen, setIsCourseDetailsModalOpen] =
    useState(false);

  // API hooks
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const {
    data: coursesData,
    isLoading,
    error,
  } = useStudentCourses({
    limit: 100,
  });

  const courses = useMemo(() => {
    return coursesData?.items.map(mapApiCourseToUI) || [];
  }, [coursesData]);

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

  const handleEnrollCourse = () => {
    toast({
      title: "Enrollment",
      description: "Course enrollment is managed by administrators. Please contact your administrator to enroll in courses.",
      variant: "default",
    });
  };

  const handleEnrollInCourse = async (courseId: number) => {
    // Enrollment is handled by admin - students cannot self-enroll
    toast({
      title: "Enrollment Not Available",
      description: "Please contact your administrator to enroll in courses.",
      variant: "default",
    });
  };

  const handleContinueLearning = async (courseId: number) => {
    // This would typically navigate to course content
    toast({
      title: "Opening Course",
      description: "Course content will open in a new window.",
      variant: "default",
    });
  };

  const handleReviewCourse = async (courseId: number) => {
    // This would typically open course review materials
    toast({
      title: "Course Review",
      description: "Opening course review materials...",
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => course.status === "Completed"
    ).length;
    const activeCourses = courses.filter(
      (course) => course.status === "Active"
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
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleEnrollCourse}
            disabled={isLoading}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Request Enrollment
          </Button>
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
                  <SelectItem value="Active">Active</SelectItem>
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCourses.map((course) => (
          <div key={course.id} className="relative group">
            <CourseCard
              title={course.title}
              instructor={course.instructor}
              progress={course.progress}
              totalLessons={course.totalLessons}
              completedLessons={course.completedLessons}
              duration={course.duration}
              thumbnail={course.thumbnail}
              onContinueLearning={() => handleContinueLearning(course.id)}
              onReviewCourse={() => handleReviewCourse(course.id)}
              isLoading={isLoading}
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleViewCourse(course)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Empty State (if no courses) */}
      {filteredAndSortedCourses.length === 0 && (
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
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CourseEnrollmentModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        onEnroll={handleEnrollInCourse}
        isLoading={isLoading}
      />

      <CourseDetailsModal
        isOpen={isCourseDetailsModalOpen}
        onClose={() => {
          setIsCourseDetailsModalOpen(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        onContinueLearning={handleContinueLearning}
        onReviewCourse={handleReviewCourse}
        isLoading={isLoading}
      />
    </div>
  );
}
