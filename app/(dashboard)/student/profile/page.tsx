"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  Shield,
  Award,
  BookOpen,
  Clock,
  Save,
  Lock,
  Bell,
  Palette,
  Eye,
} from "lucide-react";
import {
  StudentProfile,
  NotificationSettings,
  ThemeSettings,
  PrivacySettings,
  mockStudentProfile,
  mockNotificationSettings,
  mockThemeSettings,
  mockPrivacySettings,
  profileValidationSchema,
} from "@/data/mock/studentProfile";
import ProfileForm from "@/components/student/ProfileForm";

export default function ProfilePage() {
  const { toast } = useToast();
  const [profileData, setProfileData] =
    useState<StudentProfile>(mockStudentProfile);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(mockNotificationSettings);
  const [themeSettings, setThemeSettings] =
    useState<ThemeSettings>(mockThemeSettings);
  const [privacySettings, setPrivacySettings] =
    useState<PrivacySettings>(mockPrivacySettings);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const achievements = [
    {
      id: 1,
      title: "Dean's List",
      description: "Achieved GPA above 3.5 for Spring 2024",
      date: "2024-05-15",
      icon: Award,
    },
    {
      id: 2,
      title: "Perfect Attendance",
      description: "100% attendance for React Fundamentals course",
      date: "2024-04-30",
      icon: Clock,
    },
    {
      id: 3,
      title: "Course Completion",
      description: "Completed Database Design course with A+ grade",
      date: "2024-03-20",
      icon: BookOpen,
    },
  ];

  const validateField = (field: string, value: string): string | undefined => {
    const rules = profileValidationSchema[field];
    if (!rules) return undefined;

    if (rules.required && !value.trim()) {
      return `${field} is required`;
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `${field} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${field} must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return `${field} format is invalid`;
    }

    return undefined;
  };

  const handleProfileChange = (field: keyof StudentProfile, value: string) => {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || "" }));
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (
    field: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (field: keyof ThemeSettings, value: string) => {
    setThemeSettings((prev) => ({ ...prev, [field]: value as unknown }));
  };

  const handlePrivacyChange = (
    field: keyof PrivacySettings,
    value: string | boolean
  ) => {
    setPrivacySettings((prev) => ({ ...prev, [field]: value as unknown }));
  };

  const handleSaveProfile = () => {
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const handleEnable2FA = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "Two-factor authentication setup has been initiated.",
    });
  };

  const handleConfigureEmail = () => {
    toast({
      title: "Email Notifications",
      description: "Email notification preferences opened.",
    });
  };

  const handleManagePrivacy = () => {
    toast({
      title: "Privacy Settings",
      description: "Privacy settings panel opened.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Profile Settings 👤
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Active Student
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {profileData.program}
            </Badge>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Student Information Overview */}
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
            <User className="h-5 w-5 text-primary" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Student ID
                  </p>
                  <p className="font-semibold text-foreground">
                    {profileData.studentId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Enrollment Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {profileData.enrollmentDate}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Program
                  </p>
                  <p className="font-semibold text-foreground">
                    {profileData.program}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current GPA
                  </p>
                  <p className="font-semibold text-foreground">
                    {profileData.gpa}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Credits Earned
                  </p>
                  <p className="font-semibold text-foreground">
                    {profileData.credits}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Semester
                  </p>
                  <p className="font-semibold text-foreground">
                    {profileData.semester}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <ProfileForm initialData={profileData} />

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
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationChange("emailNotifications", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Push Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationChange("pushNotifications", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Assignment Reminders
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming assignments
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.assignmentReminders}
                onCheckedChange={(checked) =>
                  handleNotificationChange("assignmentReminders", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Grade Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Notify when grades are posted
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.gradeUpdates}
                onCheckedChange={(checked) =>
                  handleNotificationChange("gradeUpdates", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
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
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Theme Mode
              </Label>
              <Select
                value={themeSettings.theme}
                onValueChange={(value) => handleThemeChange("theme", value)}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Font Size
              </Label>
              <Select
                value={themeSettings.fontSize}
                onValueChange={(value) => handleThemeChange("fontSize", value)}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Color Scheme
              </Label>
              <Select
                value={themeSettings.colorScheme}
                onValueChange={(value) =>
                  handleThemeChange("colorScheme", value)
                }
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
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
            <Award className="h-5 w-5 text-primary" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className="p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
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
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleEnable2FA}>
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Manage your email notification preferences
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfigureEmail}
              >
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Privacy Settings
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your profile information
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleManagePrivacy}>
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
