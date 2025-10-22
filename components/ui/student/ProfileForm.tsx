"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { User, Mail, GraduationCap, Lock, Camera, Save } from "lucide-react";

interface ProfileFormProps {
  initialData?: {
    name: string;
    email: string;
    studentId: string;
    phone: string;
    avatar?: string;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "John Doe",
    email: initialData?.email || "john.doe@student.com",
    studentId: initialData?.studentId || "STU-2024-001",
    phone: initialData?.phone || "+1 (555) 123-4567",
    avatar: initialData?.avatar || "/avatars/student.jpg"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving profile data:", formData);
  };

  const handlePasswordSave = () => {
    // Handle password change logic here
    console.log("Changing password:", passwordData);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar} alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{formData.name}</h3>
              <p className="text-sm text-muted-foreground">{formData.studentId}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId" className="text-sm font-medium text-foreground">
                Student ID
              </Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <Button onClick={handlePasswordSave} className="w-full md:w-auto">
            <Lock className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
