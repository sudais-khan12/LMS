"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  GraduationCap,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

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

interface TeacherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onEdit: (teacher: Teacher) => void;
}

export default function TeacherDetailsModal({ isOpen, onClose, teacher, onEdit }: TeacherDetailsModalProps) {
  if (!teacher) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "Suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "Inactive":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Suspended":
        return <XCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/avatars/${teacher.name.toLowerCase().replace(' ', '-')}.jpg`} />
              <AvatarFallback className="text-lg">
                {teacher.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{teacher.name}</span>
                {teacher.verified && (
                  <Award className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={cn("text-sm", getStatusColor(teacher.status))}
                >
                  {getStatusIcon(teacher.status)}
                  <span className="ml-1">{teacher.status}</span>
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete teacher profile and performance information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{teacher.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{teacher.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Office Hours</p>
                  <p className="font-medium">{teacher.officeHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{teacher.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{teacher.specialization}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{new Date(teacher.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{teacher.experience}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Performance Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="font-medium text-xl">{teacher.studentsCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="font-medium text-xl">
                    {teacher.rating > 0 ? `${teacher.rating}/5.0` : "No rating"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Active</p>
                <p className="font-medium">{teacher.lastActive}</p>
              </div>
            </div>
          </div>

          {/* Courses */}
          {teacher.courses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Teaching Courses</h3>
              <div className="space-y-2">
                {teacher.courses.map((course, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium">{course}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(teacher)}>
            Edit Teacher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
