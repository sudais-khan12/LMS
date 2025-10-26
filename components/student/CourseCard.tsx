"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { BookOpen, Clock, User } from "lucide-react";

interface CourseCardProps {
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  thumbnail?: string;
  onContinueLearning?: () => void;
  onReviewCourse?: () => void;
  isLoading?: boolean;
}

export default function CourseCard({
  title,
  instructor,
  progress,
  totalLessons,
  completedLessons,
  duration,
  thumbnail,
  onContinueLearning,
  onReviewCourse,
  isLoading = false,
}: CourseCardProps) {
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
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{instructor}</span>
            </div>
          </div>
          {thumbnail && (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ml-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completedLessons} of {totalLessons} lessons completed
            </span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{duration}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full group-hover:bg-primary/90 transition-colors duration-200"
          size="sm"
          onClick={progress === 100 ? onReviewCourse : onContinueLearning}
          disabled={isLoading}
        >
          {progress === 100 ? "Review Course" : "Continue Learning"}
        </Button>
      </CardContent>
    </Card>
  );
}
