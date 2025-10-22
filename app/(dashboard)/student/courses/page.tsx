"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { Search, Filter, BookOpen, Plus } from "lucide-react";
import CourseCard from "@/components/ui/student/CourseCard";

// Mock course data
const courses = [
  {
    id: 1,
    title: "React Fundamentals",
    instructor: "Prof. Sarah Johnson",
    progress: 85,
    totalLessons: 20,
    completedLessons: 17,
    duration: "8 weeks",
    thumbnail: "/course-thumbnails/react.jpg",
  },
  {
    id: 2,
    title: "JavaScript Advanced",
    instructor: "Prof. Mike Chen",
    progress: 92,
    totalLessons: 15,
    completedLessons: 14,
    duration: "6 weeks",
    thumbnail: "/course-thumbnails/javascript.jpg",
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    instructor: "Prof. Emily Davis",
    progress: 78,
    totalLessons: 18,
    completedLessons: 14,
    duration: "10 weeks",
    thumbnail: "/course-thumbnails/nodejs.jpg",
  },
  {
    id: 4,
    title: "Database Design & Management",
    instructor: "Prof. David Wilson",
    progress: 100,
    totalLessons: 12,
    completedLessons: 12,
    duration: "6 weeks",
    thumbnail: "/course-thumbnails/database.jpg",
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    instructor: "Prof. Lisa Anderson",
    progress: 65,
    totalLessons: 16,
    completedLessons: 10,
    duration: "8 weeks",
    thumbnail: "/course-thumbnails/uiux.jpg",
  },
  {
    id: 6,
    title: "Python for Data Science",
    instructor: "Prof. Robert Brown",
    progress: 45,
    totalLessons: 20,
    completedLessons: 9,
    duration: "12 weeks",
    thumbnail: "/course-thumbnails/python.jpg",
  },
];

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className={cn(
        "rounded-2xl p-6",
        glassStyles.card,
        "shadow-glass-sm",
        animationClasses.fadeIn
      )}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Courses 📚
            </h1>
            <p className="text-muted-foreground">
              Manage and track your learning progress across all enrolled courses.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Enroll in Course
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-xl font-bold text-foreground">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-foreground">
                  {courses.filter(course => course.progress === 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <BookOpen className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold text-foreground">
                  {courses.filter(course => course.progress > 0 && course.progress < 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            instructor={course.instructor}
            progress={course.progress}
            totalLessons={course.totalLessons}
            completedLessons={course.completedLessons}
            duration={course.duration}
            thumbnail={course.thumbnail}
          />
        ))}
      </div>

      {/* Empty State (if no courses) */}
      {courses.length === 0 && (
        <Card className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses enrolled
            </h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t enrolled in any courses yet. Start your learning journey today!
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
