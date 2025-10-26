"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Bell,
  Shield,
  Palette,
  Save,
  Camera,
  Edit,
  Check,
  X,
} from "lucide-react";

// Mock teacher profile data
const initialTeacherProfile = {
  id: 1,
  name: "Dr. Sarah Johnson",
  email: "sarah.johnson@lms.com",
  phone: "+1 (555) 123-4567",
  department: "Computer Science",
  specialization: "Web Development",
  experience: "8 years",
  joinDate: "2020-01-15",
  avatar: "SJ",
  bio: "Passionate educator with expertise in modern web technologies and software engineering principles.",
  location: "San Francisco, CA",
  timezone: "Pacific Standard Time",
  officeHours: "Mon-Fri 10:00 AM - 4:00 PM",
  courses: ["React Fundamentals", "JavaScript Advanced", "Node.js Backend"],
  studentsCount: 156,
  rating: 4.9,
};

export default function TeacherSettingsPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(initialTeacherProfile);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    gradeNotifications: true,
    attendanceAlerts: true,
    courseUpdates: false,
    systemAlerts: true,
  });
  const [theme, setTheme] = useState("light");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      toast({
        title: "Success",
        description: `Notification setting updated`,
      });
    } catch (error) {
      // Revert on error
      setNotifications((prev) => ({
        ...prev,
        [key]: !newValue,
      }));

      toast({
        title: "Error",
        description: "Failed to update notification setting",
        variant: "destructive",
      });
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Settings ⚙️
            </h1>
            <p className="text-muted-foreground">
              Manage your profile, preferences, and account settings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatars/teacher.jpg" />
                  <AvatarFallback className="text-lg">
                    {profile.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) =>
                      setProfile({ ...profile, department: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={profile.specialization}
                    onChange={(e) =>
                      setProfile({ ...profile, specialization: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    disabled={!isEditing}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                Password & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="bg-background/50 border-border/50"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Updating..."
                ) : (
                  <>
                    <Shield className="h-4 w-4" /> Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Experience
                </span>
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  {profile.experience}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Students</span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  {profile.studentsCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rating</span>
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  ⭐ {profile.rating}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Courses</span>
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-800 border-purple-200"
                >
                  {profile.courses.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preferences */}
          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Palette className="h-5 w-5 text-primary" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Appearance</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("light")}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("dark")}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("system")}
                    className="flex-1"
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm cursor-pointer">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())
                      .replace(/notifications/gi, "")
                      .trim()}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={() =>
                      handleNotificationToggle(
                        key as keyof typeof notifications
                      )
                    }
                    disabled={isLoading}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card
            className={cn(
              glassStyles.card,
              glassStyles.cardHover,
              "rounded-2xl shadow-glass-sm",
              animationClasses.scaleIn
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined: {new Date(profile.joinDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{profile.timezone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span>Office Hours: {profile.officeHours}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
