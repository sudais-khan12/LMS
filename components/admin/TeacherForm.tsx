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

// Teacher schema for validation - simplified to match API
const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  teacher?: Teacher | null;
  onSave: (teacherData: TeacherFormData) => void;
  isLoading?: boolean;
}

export default function TeacherForm({ isOpen, onClose, teacher, onSave, isLoading = false }: TeacherFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: teacher ? {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
    } : {
      name: "",
      email: "",
      phone: "",
      specialization: "",
    },
  });

  // No watchedStatus needed anymore

  const onSubmit = async (data: TeacherFormData) => {
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
            {teacher ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
          <DialogDescription>
            {teacher 
              ? "Update the teacher information below."
              : "Fill in the details to create a new teacher account."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter full name"
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Contact (Optional)</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Enter phone number"
                className={cn(errors.phone && "border-red-500")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization (Optional)</Label>
              <Input
                id="specialization"
                {...register("specialization")}
                placeholder="e.g., Web Development"
                className={cn(errors.specialization && "border-red-500")}
              />
              {errors.specialization && (
                <p className="text-sm text-red-500">{errors.specialization.message}</p>
              )}
            </div>
          </div>

          {!teacher && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Enter password (min 6 characters)"
                className={cn(errors.password && "border-red-500")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : teacher ? "Update Teacher" : "Create Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
