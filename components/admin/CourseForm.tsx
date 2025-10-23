"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Course schema for validation
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructor: z.string().min(2, "Instructor name must be at least 2 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  duration: z.string().min(1, "Duration is required"),
  maxStudents: z.number().min(1, "Max students must be at least 1"),
  price: z.number().min(0, "Price must be non-negative"),
  status: z.enum(["Active", "Draft", "Archived", "Suspended"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  lessons: z.number().min(1, "Lessons must be at least 1"),
});

type CourseFormData = z.infer<typeof courseSchema>;

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

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  onSave: (courseData: CourseFormData) => void;
  isLoading?: boolean;
}

export default function CourseForm({ isOpen, onClose, course, onSave, isLoading = false }: CourseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      duration: course.duration,
      maxStudents: course.maxStudents,
      price: course.price,
      status: course.status,
      startDate: course.startDate,
      endDate: course.endDate,
      lessons: course.lessons,
    } : {
      title: "",
      description: "",
      instructor: "",
      category: "",
      level: "Beginner",
      duration: "",
      maxStudents: 50,
      price: 0,
      status: "Draft",
      startDate: "",
      endDate: "",
      lessons: 1,
    },
  });

  const watchedLevel = watch("level");
  const watchedStatus = watch("status");

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast({
        title: course ? "Course updated successfully" : "Course created successfully",
        description: course 
          ? `${data.title} has been updated.`
          : `${data.title} has been added to the system.`,
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: course ? "Failed to update course" : "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course ? "Edit Course" : "Add New Course"}
          </DialogTitle>
          <DialogDescription>
            {course 
              ? "Update the course information below."
              : "Fill in the details to create a new course."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter course title"
                className={cn(errors.title && "border-red-500")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                {...register("instructor")}
                placeholder="Enter instructor name"
                className={cn(errors.instructor && "border-red-500")}
              />
              {errors.instructor && (
                <p className="text-sm text-red-500">{errors.instructor.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Enter course description"
              rows={3}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.description && "border-red-500"
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...register("category")}
                placeholder="Enter category"
                className={cn(errors.category && "border-red-500")}
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={watchedLevel}
                onValueChange={(value) => setValue("level", value as "Beginner" | "Intermediate" | "Advanced")}
              >
                <SelectTrigger className={cn(errors.level && "border-red-500")}>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                {...register("duration")}
                placeholder="e.g., 8 weeks"
                className={cn(errors.duration && "border-red-500")}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessons">Number of Lessons</Label>
              <Input
                id="lessons"
                type="number"
                {...register("lessons", { valueAsNumber: true })}
                placeholder="Enter number of lessons"
                className={cn(errors.lessons && "border-red-500")}
              />
              {errors.lessons && (
                <p className="text-sm text-red-500">{errors.lessons.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                id="maxStudents"
                type="number"
                {...register("maxStudents", { valueAsNumber: true })}
                placeholder="Enter max students"
                className={cn(errors.maxStudents && "border-red-500")}
              />
              {errors.maxStudents && (
                <p className="text-sm text-red-500">{errors.maxStudents.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="Enter price"
                className={cn(errors.price && "border-red-500")}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className={cn(errors.startDate && "border-red-500")}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                className={cn(errors.endDate && "border-red-500")}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as "Active" | "Draft" | "Archived" | "Suspended")}
            >
              <SelectTrigger className={cn(errors.status && "border-red-500")}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : course ? "Update Course" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
