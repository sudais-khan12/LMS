"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Clock,
  Star,
  Calendar,
  GraduationCap,
  PlayCircle,
  BarChart3,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import CourseForm from "@/components/admin/CourseForm";
import CourseDetailsModal from "@/components/admin/CourseDetailsModal";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";

// Course interface
interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  students: number;
  maxStudents: number;
  rating: number;
  price: number;
  status: "Active" | "Draft" | "Archived" | "Suspended";
  startDate: string;
  endDate: string;
  lessons: number;
  completedLessons: number;
  thumbnail: string;
}

// Mock courses data
const initialCoursesData: Course[] = [
  {
    id: 1,
    title: "React Fundamentals",
    description:
      "Learn the basics of React.js including components, state, and props.",
    instructor: "Sarah Wilson",
    category: "Web Development",
    level: "Beginner",
    duration: "8 weeks",
    students: 156,
    maxStudents: 200,
    rating: 4.8,
    price: 299,
    status: "Active" as const,
    startDate: "2024-02-01",
    endDate: "2024-03-28",
    lessons: 24,
    completedLessons: 18,
    thumbnail: "/course-thumbnails/react-fundamentals.jpg",
  },
  {
    id: 2,
    title: "JavaScript Advanced",
    description:
      "Master advanced JavaScript concepts including ES6+, async programming, and design patterns.",
    instructor: "Mike Johnson",
    category: "Programming",
    level: "Intermediate",
    duration: "10 weeks",
    students: 98,
    maxStudents: 150,
    rating: 4.9,
    price: 399,
    status: "Active" as const,
    startDate: "2024-02-15",
    endDate: "2024-04-25",
    lessons: 30,
    completedLessons: 12,
    thumbnail: "/course-thumbnails/javascript-advanced.jpg",
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    description:
      "Build scalable backend applications using Node.js and Express.",
    instructor: "David Brown",
    category: "Backend Development",
    level: "Intermediate",
    duration: "12 weeks",
    students: 87,
    maxStudents: 120,
    rating: 4.7,
    price: 449,
    status: "Active" as const,
    startDate: "2024-03-01",
    endDate: "2024-05-23",
    lessons: 36,
    completedLessons: 8,
    thumbnail: "/course-thumbnails/nodejs-backend.jpg",
  },
  {
    id: 4,
    title: "Database Design",
    description: "Learn database design principles, SQL, and NoSQL databases.",
    instructor: "Emily Davis",
    category: "Database",
    level: "Beginner",
    duration: "6 weeks",
    students: 134,
    maxStudents: 180,
    rating: 4.6,
    price: 249,
    status: "Active" as const,
    startDate: "2024-01-15",
    endDate: "2024-02-26",
    lessons: 18,
    completedLessons: 18,
    thumbnail: "/course-thumbnails/database-design.jpg",
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    description:
      "Master user interface and user experience design fundamentals.",
    instructor: "Lisa Garcia",
    category: "Design",
    level: "Beginner",
    duration: "8 weeks",
    students: 76,
    maxStudents: 100,
    rating: 4.5,
    price: 279,
    status: "Draft" as const,
    startDate: "2024-04-01",
    endDate: "2024-05-27",
    lessons: 20,
    completedLessons: 5,
    thumbnail: "/course-thumbnails/ui-ux-design.jpg",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200";
    case "Draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Archived":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "Suspended":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-800 border-green-200";
    case "Intermediate":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Advanced":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

type SortField =
  | "title"
  | "instructor"
  | "category"
  | "level"
  | "status"
  | "price"
  | "students"
  | "rating";
type SortDirection = "asc" | "desc";

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>(initialCoursesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isCourseDetailsOpen, setIsCourseDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || course.category === filterCategory;
      const matchesStatus =
        filterStatus === "All" || course.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
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
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case "level":
          aValue = a.level;
          bValue = b.level;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "students":
          aValue = a.students;
          bValue = b.students;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
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
    filterCategory,
    filterStatus,
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

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsCourseFormOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseFormOpen(true);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsCourseDetailsOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (
    courseId: number,
    currentStatus: string
  ) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                status:
                  currentStatus === "Active"
                    ? "Archived"
                    : ("Active" as "Active" | "Archived"),
              }
            : course
        )
      );

      toast({
        title: "Status updated",
        description: `Course status has been ${
          currentStatus === "Active" ? "archived" : "activated"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async (courseData: Partial<Course>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingCourse) {
        // Update existing course
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === editingCourse.id
              ? {
                  ...course,
                  ...courseData,
                }
              : course
          )
        );
      } else {
        // Add new course
        const newCourse: Course = {
          id: Math.max(...courses.map((c) => c.id)) + 1,
          title: courseData.title || "Untitled Course",
          description: courseData.description || "No description provided",
          instructor: courseData.instructor || "Unknown Instructor",
          category: courseData.category || "Uncategorized",
          level: courseData.level || "Beginner",
          duration: courseData.duration || "0 weeks",
          maxStudents: courseData.maxStudents || 100,
          price: courseData.price || 0,
          status: courseData.status || "Draft",
          startDate:
            courseData.startDate || new Date().toISOString().split("T")[0],
          endDate: courseData.endDate || new Date().toISOString().split("T")[0],
          lessons: courseData.lessons || 0,
          students: 0,
          rating: 0,
          completedLessons: 0,
          thumbnail: "/course-thumbnails/default.jpg",
        };
        setCourses((prevCourses) => [...prevCourses, newCourse]);
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== selectedCourse.id)
      );

      toast({
        title: "Course deleted",
        description: `${selectedCourse.title} has been removed from the system.`,
      });

      setIsDeleteModalOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(courses.map((c) => c.category))),
  ];

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
              Course Management 📚
            </h1>
            <p className="text-muted-foreground">
              Manage all courses, instructors, and curriculum content.
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleAddCourse}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {courses.length}
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
                <PlayCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {courses.filter((c) => c.status === "Active").length}
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
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {courses.reduce((acc, c) => acc + c.students, 0)}
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
              <div className="p-3 rounded-xl bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Rating
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {(
                    courses.reduce((acc, c) => acc + c.rating, 0) /
                    courses.length
                  ).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card
        className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by title, description, or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button
                variant={filterStatus === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("All")}
              >
                All Status
              </Button>
              <Button
                variant={filterStatus === "Active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Active")}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "Draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Draft")}
              >
                Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
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
            <BookOpen className="h-5 w-5 text-primary" />
            Courses ({filteredAndSortedCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Course
                      {getSortIcon("title")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("instructor")}
                  >
                    <div className="flex items-center gap-2">
                      Instructor
                      {getSortIcon("instructor")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center gap-2">
                      Category
                      {getSortIcon("category")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("level")}
                  >
                    <div className="flex items-center gap-2">
                      Level
                      {getSortIcon("level")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("students")}
                  >
                    <div className="flex items-center gap-2">
                      Students
                      {getSortIcon("students")}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {course.title}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{course.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${course.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {course.instructor}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getLevelColor(course.level))}
                      >
                        {course.level}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">
                            {course.students}
                          </span>
                          <span className="text-muted-foreground">
                            /{course.maxStudents}
                          </span>
                        </div>
                        <Progress
                          value={(course.students / course.maxStudents) * 100}
                          className="h-2 w-20"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">
                            {course.completedLessons}
                          </span>
                          <span className="text-muted-foreground">
                            /{course.lessons}
                          </span>
                        </div>
                        <Progress
                          value={
                            (course.completedLessons / course.lessons) * 100
                          }
                          className="h-2 w-20"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={cn("text-sm", getStatusColor(course.status))}
                      >
                        {course.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCourse(course)}
                          className="flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                          className="flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(course.id, course.status)
                          }
                          className={cn(
                            "flex items-center gap-1",
                            course.status === "Active"
                              ? "text-yellow-600 hover:text-yellow-700"
                              : "text-green-600 hover:text-green-700"
                          )}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : course.status === "Active" ? (
                            "Archive"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CourseForm
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
        onSave={handleSaveCourse}
        isLoading={isLoading}
      />

      <CourseDetailsModal
        isOpen={isCourseDetailsOpen}
        onClose={() => {
          setIsCourseDetailsOpen(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        onEdit={(course) => {
          setIsCourseDetailsOpen(false);
          setEditingCourse(course);
          setIsCourseFormOpen(true);
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete ${selectedCourse?.title}? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </div>
  );
}
