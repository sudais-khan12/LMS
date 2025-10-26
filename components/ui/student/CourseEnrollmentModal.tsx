"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Star,
  DollarSign,
  GraduationCap,
  Loader2,
  X,
} from "lucide-react";

interface AvailableCourse {
  id: number;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  price: number;
  rating: number;
  students: number;
  maxStudents: number;
  thumbnail: string;
  startDate: string;
  endDate: string;
}

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (courseId: number) => Promise<void>;
  isLoading?: boolean;
}

// Mock available courses for enrollment
const availableCourses: AvailableCourse[] = [
  {
    id: 101,
    title: "Advanced React Patterns",
    description:
      "Master advanced React patterns including HOCs, render props, and custom hooks.",
    instructor: "Prof. Alex Thompson",
    category: "Web Development",
    level: "Advanced",
    duration: "10 weeks",
    price: 399,
    rating: 4.9,
    students: 45,
    maxStudents: 100,
    thumbnail: "/course-thumbnails/advanced-react.jpg",
    startDate: "2024-04-01",
    endDate: "2024-06-10",
  },
  {
    id: 102,
    title: "Full-Stack Development",
    description:
      "Complete full-stack development course covering frontend, backend, and deployment.",
    instructor: "Prof. Maria Rodriguez",
    category: "Full-Stack",
    level: "Intermediate",
    duration: "16 weeks",
    price: 599,
    rating: 4.8,
    students: 78,
    maxStudents: 120,
    thumbnail: "/course-thumbnails/fullstack.jpg",
    startDate: "2024-04-15",
    endDate: "2024-08-01",
  },
  {
    id: 103,
    title: "DevOps Fundamentals",
    description:
      "Learn DevOps practices, CI/CD pipelines, and cloud deployment strategies.",
    instructor: "Prof. James Wilson",
    category: "DevOps",
    level: "Intermediate",
    duration: "8 weeks",
    price: 349,
    rating: 4.7,
    students: 32,
    maxStudents: 80,
    thumbnail: "/course-thumbnails/devops.jpg",
    startDate: "2024-05-01",
    endDate: "2024-06-26",
  },
  {
    id: 104,
    title: "Cybersecurity Essentials",
    description:
      "Introduction to cybersecurity concepts, threats, and protection strategies.",
    instructor: "Prof. Sarah Chen",
    category: "Security",
    level: "Beginner",
    duration: "12 weeks",
    price: 449,
    rating: 4.6,
    students: 56,
    maxStudents: 100,
    thumbnail: "/course-thumbnails/cybersecurity.jpg",
    startDate: "2024-04-20",
    endDate: "2024-07-12",
  },
  {
    id: 105,
    title: "Cloud Computing with AWS",
    description: "Master Amazon Web Services and cloud computing fundamentals.",
    instructor: "Prof. David Kumar",
    category: "Cloud Computing",
    level: "Intermediate",
    duration: "14 weeks",
    price: 549,
    rating: 4.8,
    students: 67,
    maxStudents: 90,
    thumbnail: "/course-thumbnails/aws.jpg",
    startDate: "2024-05-10",
    endDate: "2024-08-15",
  },
];

export default function CourseEnrollmentModal({
  isOpen,
  onClose,
  onEnroll,
  isLoading = false,
}: CourseEnrollmentModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [enrollingCourse, setEnrollingCourse] = useState<number | null>(null);

  const categories = [
    "All",
    ...Array.from(new Set(availableCourses.map((c) => c.category))),
  ];

  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnroll = async (courseId: number) => {
    setEnrollingCourse(courseId);
    try {
      await onEnroll(courseId);
      toast({
        title: "Enrollment Successful",
        description: "You have been successfully enrolled in the course!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourse(null);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Available Courses 📚
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className={cn(
                  glassStyles.card,
                  glassStyles.cardHover,
                  "rounded-xl shadow-glass-sm",
                  animationClasses.scaleIn
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <GraduationCap className="h-4 w-4" />
                        <span className="truncate">{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getLevelColor(course.level))}
                        >
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ml-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {course.students}/{course.maxStudents}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>{course.price}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleEnroll(course.id)}
                    disabled={isLoading || enrollingCourse === course.id}
                  >
                    {enrollingCourse === course.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="h-4 w-4 mr-2" />
                    )}
                    {enrollingCourse === course.id
                      ? "Enrolling..."
                      : "Enroll Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No courses found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
