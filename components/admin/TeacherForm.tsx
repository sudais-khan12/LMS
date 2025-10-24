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

// Teacher schema for validation
const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  specialization: z.string().min(2, "Specialization must be at least 2 characters"),
  experience: z.string().min(1, "Experience is required"),
  status: z.enum(["Active", "Pending", "Inactive", "Suspended"]),
  officeHours: z.string().min(1, "Office hours are required"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  specialization: string;
  experience: string;
  joinDate: string;
  lastActive: string;
  status: "Active" | "Pending" | "Inactive" | "Suspended";
  courses: string[];
  studentsCount: number;
  rating: number;
  officeHours: string;
  location: string;
  verified: boolean;
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
      department: teacher.department,
      specialization: teacher.specialization,
      experience: teacher.experience,
      status: teacher.status,
      officeHours: teacher.officeHours,
      location: teacher.location,
    } : {
      name: "",
      email: "",
      phone: "",
      department: "",
      specialization: "",
      experience: "",
      status: "Pending",
      officeHours: "",
      location: "",
    },
  });

  const watchedStatus = watch("status");

  const onSubmit = async (data: TeacherFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast({
        title: teacher ? "Teacher updated successfully" : "Teacher created successfully",
        description: teacher 
          ? `${data.name} has been updated.`
          : `${data.name} has been added to the system.`,
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: teacher ? "Failed to update teacher" : "Failed to create teacher",
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
              <Label htmlFor="phone">Phone Number</Label>
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter location"
                className={cn(errors.location && "border-red-500")}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register("department")}
                placeholder="Enter department"
                className={cn(errors.department && "border-red-500")}
              />
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                {...register("specialization")}
                placeholder="Enter specialization"
                className={cn(errors.specialization && "border-red-500")}
              />
              {errors.specialization && (
                <p className="text-sm text-red-500">{errors.specialization.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                {...register("experience")}
                placeholder="e.g., 5 years"
                className={cn(errors.experience && "border-red-500")}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">{errors.experience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeHours">Office Hours</Label>
              <Input
                id="officeHours"
                {...register("officeHours")}
                placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM"
                className={cn(errors.officeHours && "border-red-500")}
              />
              {errors.officeHours && (
                <p className="text-sm text-red-500">{errors.officeHours.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as "Active" | "Pending" | "Inactive" | "Suspended")}
            >
              <SelectTrigger className={cn(errors.status && "border-red-500")}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
              {isSubmitting ? "Saving..." : teacher ? "Update Teacher" : "Create Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
