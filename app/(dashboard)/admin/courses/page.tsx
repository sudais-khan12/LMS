"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
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
  MoreHorizontal
} from "lucide-react";

// Mock courses data
const coursesData = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Learn the basics of React.js including components, state, and props.",
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
    description: "Master advanced JavaScript concepts including ES6+, async programming, and design patterns.",
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
    description: "Build scalable backend applications using Node.js and Express.",
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
    description: "Master user interface and user experience design fundamentals.",
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

export default function AdminCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredCourses = coursesData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || course.category === filterCategory;
    const matchesStatus = filterStatus === "All" || course.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditCourse = (courseId: number) => {
    // Mock edit functionality
    console.log("Edit course:", courseId);
  };

  const handleDeleteCourse = (courseId: number) => {
    // Mock delete functionality
    console.log("Delete course:", courseId);
  };

  const handleToggleStatus = (courseId: number, currentStatus: string) => {
    // Mock toggle status functionality
    console.log("Toggle status for course:", courseId, "from", currentStatus);
  };

  const categories = ["All", ...Array.from(new Set(coursesData.map(c => c.category)))];

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
              Course Management 📚
            </h1>
            <p className="text-muted-foreground">
              Manage all courses, instructors, and curriculum content.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold text-foreground">{coursesData.length}</p>
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
              <div className="p-3 rounded-xl bg-green-100">
                <PlayCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold text-foreground">
                  {coursesData.filter(c => c.status === "Active").length}
                </p>
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
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">
                  {coursesData.reduce((acc, c) => acc + c.students, 0)}
                </p>
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
              <div className="p-3 rounded-xl bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">
                  {(coursesData.reduce((acc, c) => acc + c.rating, 0) / coursesData.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className={cn(
        glassStyles.card,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
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
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            Courses ({filteredCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Instructor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Students</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
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
                          <div className="font-medium text-foreground">{course.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{course.description}</div>
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
                        <span className="text-sm text-foreground">{course.instructor}</span>
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
                          <span className="text-foreground">{course.students}</span>
                          <span className="text-muted-foreground">/{course.maxStudents}</span>
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
                          <span className="text-foreground">{course.completedLessons}</span>
                          <span className="text-muted-foreground">/{course.lessons}</span>
                        </div>
                        <Progress 
                          value={(course.completedLessons / course.lessons) * 100} 
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
                          onClick={() => handleEditCourse(course.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course.id)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(course.id, course.status)}
                          className={cn(
                            "flex items-center gap-1",
                            course.status === "Active" ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"
                          )}
                        >
                          {course.status === "Active" ? "Archive" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
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
    </div>
  );
}
