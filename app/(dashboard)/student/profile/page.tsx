"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useStudentProfile, useUpdateStudentProfile } from "@/lib/hooks/api/student";
import ProfileForm from "@/components/student/ProfileForm";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  assignmentReminders: boolean;
  gradeUpdates: boolean;
}

interface ThemeSettings {
  theme: string;
  fontSize: string;
  colorScheme: string;
}

interface PrivacySettings {
  profileVisibility: string;
  showEmail: boolean;
  showPhone: boolean;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { data: profileData, isLoading, error } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      pushNotifications: true,
      assignmentReminders: true,
      gradeUpdates: true,
    });
  const [themeSettings, setThemeSettings] =
    useState<ThemeSettings>({
      theme: "system",
      fontSize: "medium",
      colorScheme: "blue",
    });
  const [privacySettings, setPrivacySettings] =
    useState<PrivacySettings>({
      profileVisibility: "public",
      showEmail: true,
      showPhone: false,
    });
  const [isEditing, setIsEditing] = useState(false);

  // Calculate achievements from profile data
  const achievements = React.useMemo(() => {
    const achievementsList = [];
    
    if (profileData?.stats?.currentGPA && profileData.stats.currentGPA >= 3.5) {
      achievementsList.push({
        id: 1,
        title: "Dean's List",
        description: `Achieved GPA of ${profileData.stats.currentGPA.toFixed(2)}`,
        date: new Date().toISOString().split('T')[0],
        icon: Award,
      });
    }
    
    if (profileData?.stats?.attendanceRate && profileData.stats.attendanceRate >= 95) {
      achievementsList.push({
        id: 2,
        title: "Perfect Attendance",
        description: `${profileData.stats.attendanceRate}% attendance rate`,
        date: new Date().toISOString().split('T')[0],
        icon: Clock,
      });
    }
    
    if (profileData?.stats?.averageGrade && profileData.stats.averageGrade >= 90) {
      achievementsList.push({
        id: 3,
        title: "Excellent Performance",
        description: `Average grade of ${profileData.stats.averageGrade.toFixed(2)}%`,
        date: new Date().toISOString().split('T')[0],
        icon: BookOpen,
      });
    }
    
    return achievementsList;
  }, [profileData]);

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

  const handleSaveProfile = async (formData: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    enrollmentNo?: string;
    semester?: number;
    section?: string;
  }) => {
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
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
            {profileData?.profile?.program && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {profileData.profile.program}
              </Badge>
            )}
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
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
                    {profileData?.profile?.studentId || "N/A"}
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
                    {profileData?.profile?.enrollmentDate 
                      ? new Date(profileData.profile.enrollmentDate).toLocaleDateString()
                      : "N/A"}
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
                    {profileData?.profile?.program || "N/A"}
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
                    {profileData?.profile?.gpa || "N/A"}
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
                    {profileData?.profile?.credits || "0"}
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
                    {profileData?.profile?.semester || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      {isLoading ? (
        <Card className={cn(glassStyles.card, "rounded-2xl shadow-glass-sm")}>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className={cn(glassStyles.card, "rounded-2xl shadow-glass-sm")}>
          <CardContent className="p-12 text-center">
            <p className="text-destructive">Error loading profile. Please try again.</p>
          </CardContent>
        </Card>
      ) : profileData ? (
        <ProfileForm 
          initialData={{
            name: profileData.profile.name,
            email: profileData.profile.email,
            studentId: profileData.profile.studentId,
            phone: profileData.profile.phone,
          }}
          isEditing={isEditing}
          onSave={handleSaveProfile}
          isLoading={updateProfile.isPending}
        />
      ) : null}

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
