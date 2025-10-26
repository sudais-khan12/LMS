"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { User, Mail, GraduationCap, Lock, Camera, Save, Bell, Settings, BookOpen, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

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
  const { toast } = useToast();
  
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

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    assignmentReminders: true,
    deadlineAlerts: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Check if form has changed
      const hasChanged = JSON.stringify(newData) !== JSON.stringify({
        name: initialData?.name || "John Doe",
        email: initialData?.email || "john.doe@student.com",
        studentId: initialData?.studentId || "STU-2024-001",
        phone: initialData?.phone || "+1 (555) 123-4567",
        avatar: initialData?.avatar || "/avatars/student.jpg"
      });
      setIsDirty(hasChanged);
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      
      return newData;
    });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Validate password on change
    const newErrors = { ...passwordErrors };
    
    if (field === "newPassword" && value.length > 0 && value.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (field === "newPassword" && value.length >= 8) {
      delete newErrors.newPassword;
    }
    
    if (field === "confirmPassword") {
      if (value !== passwordData.newPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    setPasswordErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before saving.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate save
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully!",
    });
    
    setIsDirty(false);
    console.log("Saving profile data:", formData);
  };

  const handlePasswordSave = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Please enter your current password";
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = "Please enter a new password";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully!",
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the password errors before saving.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarClick = () => {
    // Simulate file upload
    toast({
      title: "Avatar Upload",
      description: "Avatar update simulated. In production, this would upload a file.",
    });
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
                onClick={handleAvatarClick}
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
                className={`bg-background/50 border-border/50 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                  className={`pl-10 bg-background/50 border-border/50 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
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
                  disabled
                  className="pl-10 bg-background/30 border-border/30 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">Student ID cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`bg-background/50 border-border/50 ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full md:w-auto"
            disabled={!isDirty}
          >
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
              className={`bg-background/50 border-border/50 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
            />
            {passwordErrors.currentPassword && <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>}
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
              className={`bg-background/50 border-border/50 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
            />
            {passwordErrors.newPassword && <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>}
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters</p>
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
              className={`bg-background/50 border-border/50 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>}
          </div>

          <Button onClick={handlePasswordSave} className="w-full md:w-auto">
            <Lock className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
            </div>
            <Switch
              checked={notificationPrefs.emailNotifications}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
            </div>
            <Switch
              checked={notificationPrefs.pushNotifications}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Course Updates</p>
                <p className="text-sm text-muted-foreground">Get notified about course changes</p>
              </div>
            </div>
            <Switch
              checked={notificationPrefs.courseUpdates}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, courseUpdates: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Assignment Reminders</p>
                <p className="text-sm text-muted-foreground">Reminders for upcoming assignments</p>
              </div>
            </div>
            <Switch
              checked={notificationPrefs.assignmentReminders}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, assignmentReminders: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Deadline Alerts</p>
                <p className="text-sm text-muted-foreground">Alerts for approaching deadlines</p>
              </div>
            </div>
            <Switch
              checked={notificationPrefs.deadlineAlerts}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, deadlineAlerts: checked }))}
            />
          </div>

          <Button 
            className="w-full md:w-auto"
            onClick={() => {
              toast({
                title: "Preferences Saved",
                description: "Your notification preferences have been updated!",
              });
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
