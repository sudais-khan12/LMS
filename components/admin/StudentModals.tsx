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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Student } from "@/types/student";
import {
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  Phone,
  User,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Student form schema for validation
const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  year: z.enum(["Freshman", "Sophomore", "Junior", "Senior"]),
  status: z.enum(["Active", "Inactive", "At Risk", "Suspended"]),
  courses: z.array(z.string()),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEdit: (student: Student) => void;
}

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  onSave: (studentData: StudentFormData) => void;
  isLoading?: boolean;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: Student | null;
  isLoading?: boolean;
}

// Student Details Modal
export function StudentDetailsModal({
  isOpen,
  onClose,
  student,
  onEdit,
}: StudentDetailsModalProps) {
  if (!student) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "At Risk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "Suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A"))
      return "bg-green-100 text-green-800 border-green-200";
    if (grade.startsWith("B"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (grade.startsWith("C"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about {student.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Profile */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`/avatars/${student.name
                  .toLowerCase()
                  .replace(" ", "-")}.jpg`}
              />
              <AvatarFallback className="text-lg">
                {student.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{student.name}</h3>
                {student.verified && (
                  <Award className="h-5 w-5 text-green-600" />
                )}
              </div>
              <p className="text-muted-foreground">{student.email}</p>
              <p className="text-sm text-muted-foreground">
                Student ID: {student.studentId}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("text-sm", getStatusColor(student.status))}
            >
              {student.status}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Contact Information
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.phone}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Academic Information
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.year}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground">
              Academic Performance
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {student.gpa}
                </div>
                <div className="text-sm text-muted-foreground">GPA</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-lg px-3 py-1",
                    getGradeColor(student.grade)
                  )}
                >
                  {student.grade}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Current Grade
                </div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {student.attendance}%
                </div>
                <div className="text-sm text-muted-foreground">Attendance</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Course Progress
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium text-foreground">
                  {student.progress}%
                </span>
              </div>
              <Progress value={student.progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {student.assignmentsCompleted}/{student.totalAssignments}{" "}
                assignments completed
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Enrolled Courses
            </Label>
            <div className="flex flex-wrap gap-2">
              {student.courses.map((course) => (
                <Badge key={course} variant="outline" className="text-sm">
                  {course}
                </Badge>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last active: {student.lastActive}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined: {new Date(student.joinDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(student)}>Edit Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Student Form Modal
export function StudentFormModal({
  isOpen,
  onClose,
  student,
  onSave,
  isLoading = false,
}: StudentFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student
      ? {
          name: student.name,
          email: student.email,
          phone: student.phone,
          department: student.department,
          year: student.year,
          status: student.status,
          courses: student.courses,
        }
      : {
          name: "",
          email: "",
          phone: "",
          department: "",
          year: "Freshman",
          status: "Active",
          courses: [],
        },
  });

  const watchedYear = watch("year");
  const watchedStatus = watch("status");

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast({
        title: student
          ? "Student updated successfully"
          : "Student created successfully",
        description: student
          ? `${data.name} has been updated.`
          : `${data.name} has been added to the system.`,
      });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: student
          ? "Failed to update student"
          : "Failed to create student",
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
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {student ? "Edit Student" : "Add New Student"}
          </DialogTitle>
          <DialogDescription>
            {student
              ? "Update the student information below."
              : "Fill in the details to create a new student account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...register("department")}
              placeholder="Enter department"
              className={cn(errors.department && "border-red-500")}
            />
            {errors.department && (
              <p className="text-sm text-red-500">
                {errors.department.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Academic Year</Label>
            <Select
              value={watchedYear}
              onValueChange={(value) =>
                setValue(
                  "year",
                  value as "Freshman" | "Sophomore" | "Junior" | "Senior"
                )
              }
            >
              <SelectTrigger className={cn(errors.year && "border-red-500")}>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freshman">Freshman</SelectItem>
                <SelectItem value="Sophomore">Sophomore</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
              </SelectContent>
            </Select>
            {errors.year && (
              <p className="text-sm text-red-500">{errors.year.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) =>
                setValue(
                  "status",
                  value as "Active" | "Inactive" | "At Risk" | "Suspended"
                )
              }
            >
              <SelectTrigger className={cn(errors.status && "border-red-500")}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
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
              {isSubmitting
                ? "Saving..."
                : student
                ? "Update Student"
                : "Create Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Modal
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  student,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Student
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {student.name}? This action cannot
            be undone. All student data, including grades, attendance, and
            course enrollments will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`/avatars/${student.name
                  .toLowerCase()
                  .replace(" ", "-")}.jpg`}
              />
              <AvatarFallback className="text-sm">
                {student.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-foreground">{student.name}</div>
              <div className="text-sm text-muted-foreground">
                {student.email} • {student.studentId}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
