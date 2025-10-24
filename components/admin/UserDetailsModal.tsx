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
  Shield, 
  Users, 
  BookOpen,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Student" | "Teacher" | "Admin";
  status: "Active" | "Pending" | "Inactive";
  joinDate: string;
  lastActive: string;
  avatar: string;
  phone: string;
  department: string;
  courses: string[];
  verified: boolean;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
}

export default function UserDetailsModal({ isOpen, onClose, user, onEdit }: UserDetailsModalProps) {
  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Teacher":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Student":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Admin":
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
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "Inactive":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`/avatars/${user.name.toLowerCase().replace(' ', '-')}.jpg`} />
              <AvatarFallback className="text-lg">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">{user.name}</span>
                {user.verified && (
                  <Shield className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={cn("text-sm", getRoleColor(user.role))}
                >
                  {user.role}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-sm", getStatusColor(user.status))}
                >
                  {getStatusIcon(user.status)}
                  <span className="ml-1">{user.status}</span>
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete user profile and account information
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
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{user.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Active</p>
                <p className="font-medium">{user.lastActive}</p>
              </div>
            </div>
          </div>

          {/* Courses */}
          {user.courses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Courses</h3>
              <div className="space-y-2">
                {user.courses.map((course, index) => (
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
          <Button onClick={() => onEdit(user)}>
            Edit User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
