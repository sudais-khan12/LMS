"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Clock,
  User,
  Star,
  PlayCircle,
  CheckCircle,
  Calendar,
  GraduationCap,
  Loader2,
  Eye,
} from "lucide-react";
import { StudentCourse } from "@/data/mock/studentCourses";

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: StudentCourse | null;
  onContinueLearning?: (courseId: number) => Promise<void>;
  onReviewCourse?: (courseId: number) => Promise<void>;
  isLoading?: boolean;
}

export default function CourseDetailsModal({
  isOpen,
  onClose,
  course,
  onContinueLearning,
  onReviewCourse,
  isLoading = false,
}: CourseDetailsModalProps) {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!course) return null;

  const handleContinueLearning = async () => {
    if (!onContinueLearning) return;

    setActionLoading("continue");
    try {
      await onContinueLearning(course.id);
      toast({
        title: "Starting Course",
        description: `Continuing ${course.title}`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewCourse = async () => {
    if (!onReviewCourse) return;

    setActionLoading("review");
    try {
      await onReviewCourse(course.id);
      toast({
        title: "Course Review",
        description: `Opening review for ${course.title}`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open course review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Course Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Header */}
          <Card
            className={cn(
              glassStyles.card,
              "rounded-xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-foreground mb-2">
                    {course.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className={cn("text-sm", getStatusColor(course.status))}
                    >
                      {course.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm",
                        getLevelColor(course.level || "Beginner")
                      )}
                    >
                      {course.level || "Beginner"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(course.startDate)} -{" "}
                    {formatDate(course.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span>{course.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card
            className={cn(
              glassStyles.card,
              "rounded-xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Overall Progress
                  </span>
                  <span className="font-medium text-foreground">
                    {course.progress}%
                  </span>
                </div>
                <Progress value={course.progress} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {course.completedLessons} of {course.totalLessons} lessons
                    completed
                  </span>
                  <span>
                    {course.totalLessons - course.completedLessons} lessons
                    remaining
                  </span>
                </div>
              </div>

              {course.progress === 100 ? (
                <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Congratulations! You have completed this course.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Continue your learning journey!
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card
            className={cn(
              glassStyles.card,
              "rounded-xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardContent className="p-6">
              <div className="flex gap-3">
                {course.progress === 100 ? (
                  <Button
                    onClick={handleReviewCourse}
                    disabled={isLoading || actionLoading === "review"}
                    className="flex items-center gap-2"
                  >
                    {isLoading || actionLoading === "review" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {actionLoading === "review"
                      ? "Opening..."
                      : "Review Course"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleContinueLearning}
                    disabled={isLoading || actionLoading === "continue"}
                    className="flex items-center gap-2"
                  >
                    {isLoading || actionLoading === "continue" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                    {actionLoading === "continue"
                      ? "Starting..."
                      : "Continue Learning"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading || actionLoading !== null}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
