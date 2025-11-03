"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";

// Course schema for validation - matches API schema
const courseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  description: z.string().optional(),
  teacherId: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  teacherId?: string;
  teacher?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  onSave: (courseData: CourseFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CourseForm({ isOpen, onClose, course, onSave, isLoading = false }: CourseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: string; user: { name: string; email: string } }>>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

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
      code: course.code || "",
      description: course.description || "",
      teacherId: course.teacherId || "",
    } : {
      title: "",
      code: "",
      description: "",
      teacherId: "",
    },
  });

  // Fetch teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchTeachers = async () => {
        setLoadingTeachers(true);
        try {
          const response = await apiClient<{
            success: boolean;
            data: {
              items: Array<{ id: string; user: { name: string; email: string } }>;
            };
          }>("/api/admin/teachers");
          
          if (response.success && response.data) {
            setTeachers(response.data.items);
          }
        } catch (error) {
          console.error("Failed to fetch teachers:", error);
        } finally {
          setLoadingTeachers(false);
        }
      };
      fetchTeachers();
    }
  }, [isOpen]);

  // Reset form when course changes
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        code: course.code || "",
        description: course.description || "",
        teacherId: course.teacherId || "",
      });
    } else {
      reset({
        title: "",
        code: "",
        description: "",
        teacherId: "",
      });
    }
  }, [course, reset]);

  const watchedTeacherId = watch("teacherId");

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      // The mutation hooks already show toast messages
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
              <Label htmlFor="title">Course Title *</Label>
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
              <Label htmlFor="code">Course Code *</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="e.g., CS101"
                className={cn(errors.code && "border-red-500")}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter course description (optional)"
              rows={3}
              className={cn(
                errors.description && "border-red-500"
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId">Teacher (Optional)</Label>
            <Select
              value={watchedTeacherId || undefined}
              onValueChange={(value) => setValue("teacherId", value || undefined)}
              disabled={loadingTeachers}
            >
              <SelectTrigger className={cn(errors.teacherId && "border-red-500")}>
                <SelectValue placeholder={loadingTeachers ? "Loading teachers..." : "Select a teacher (optional)"} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.user.name} ({teacher.user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teacherId && (
              <p className="text-sm text-red-500">{errors.teacherId.message}</p>
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
