"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  AdminProfile,
  PlatformSettings,
  NotificationSettings,
  PasswordForm,
  FormErrors,
} from "@/lib/types";
import {
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bell,
  Shield,
  Palette,
  Save,
  Camera,
  Edit,
  Check,
  X,
  Globe,
  Database,
  Server,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

// Mock admin profile data
const initialAdminProfile: AdminProfile = {
  id: 1,
  name: "Admin User",
  email: "admin@lms.com",
  phone: "+1 (555) 000-0000",
  department: "Administration",
  role: "System Administrator",
  joinDate: "2020-01-01",
  avatar: "AU",
  bio: "System administrator responsible for platform management and user support.",
  location: "San Francisco, CA",
  timezone: "Pacific Standard Time",
  officeHours: "Mon-Fri 9:00 AM - 5:00 PM",
};

// Mock platform settings
const initialPlatformSettings: PlatformSettings = {
  siteName: "Learning Management System",
  siteDescription: "Comprehensive online learning platform",
  siteUrl: "https://lms.example.com",
  contactEmail: "support@lms.com",
  maxFileSize: "10MB",
  allowedFileTypes: "PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, MP4",
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotifications: true,
  systemLogs: true,
};

// Mock notification settings
const initialNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  systemAlerts: true,
  userRegistration: true,
  courseUpdates: true,
  maintenanceAlerts: true,
  securityAlerts: true,
  performanceAlerts: false,
};

// Validation functions
const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return undefined;
};

const validatePasswordStrength = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }
  return undefined;
};

const validatePhone = (phone: string): string | undefined => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phone) return "Phone number is required";
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""))) {
    return "Please enter a valid phone number";
  }
  return undefined;
};

const validateUrl = (url: string): string | undefined => {
  try {
    new URL(url);
    return undefined;
  } catch {
    return "Please enter a valid URL";
  }
};

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // State management
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPlatform, setIsEditingPlatform] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>(initialAdminProfile);
  const [platform, setPlatform] = useState<PlatformSettings>(
    initialPlatformSettings
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(
    initialNotificationSettings
  );
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPlatform, setIsSavingPlatform] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Error states
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [platformErrors, setPlatformErrors] = useState<FormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Validation functions
  const validateProfile = (): boolean => {
    const errors: FormErrors = {};

    if (!profile.name.trim()) errors.name = "Name is required";
    if (!profile.email.trim()) errors.email = "Email is required";
    else {
      const emailError = validateEmail(profile.email);
      if (emailError) errors.email = emailError;
    }
    if (!profile.phone.trim()) errors.phone = "Phone is required";
    else {
      const phoneError = validatePhone(profile.phone);
      if (phoneError) errors.phone = phoneError;
    }
    if (!profile.department.trim())
      errors.department = "Department is required";
    if (!profile.role.trim()) errors.role = "Role is required";

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePlatform = (): boolean => {
    const errors: FormErrors = {};

    if (!platform.siteName.trim()) errors.siteName = "Site name is required";
    if (!platform.siteUrl.trim()) errors.siteUrl = "Site URL is required";
    else {
      const urlError = validateUrl(platform.siteUrl);
      if (urlError) errors.siteUrl = urlError;
    }
    if (!platform.contactEmail.trim())
      errors.contactEmail = "Contact email is required";
    else {
      const emailError = validateEmail(platform.contactEmail);
      if (emailError) errors.contactEmail = emailError;
    }

    setPlatformErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    const errors: FormErrors = {};

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else {
      const passwordError = validatePasswordStrength(passwordForm.newPassword);
      if (passwordError) errors.newPassword = passwordError;
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save handlers with loading states and toast notifications
  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingProfile(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSavingProfile(false);
    setIsEditingProfile(false);
    setProfileErrors({});

    toast({
      title: "Settings Saved Successfully",
      description: "Your profile has been updated.",
    });
  };

  const handleSavePlatform = async () => {
    if (!validatePlatform()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingPlatform(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSavingPlatform(false);
    setIsEditingPlatform(false);
    setPlatformErrors({});

    toast({
      title: "Settings Saved Successfully",
      description: "Platform settings have been updated.",
    });
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before updating password.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications((prev: NotificationSettings) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // Show instant feedback
    toast({
      title: "Notification Updated",
      description: `${key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} ${
        !notifications[key] ? "enabled" : "disabled"
      }.`,
    });
  };

  const handlePlatformToggle = (key: keyof PlatformSettings) => {
    setPlatform((prev: PlatformSettings) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // Show instant feedback
    toast({
      title: "Platform Setting Updated",
      description: `${key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} ${
        !platform[key] ? "enabled" : "disabled"
      }.`,
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme}.`,
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev: typeof showPasswords) => ({
      ...prev,
      [field]: !prev[field],
    }));
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
              Platform Settings ⚙️
            </h1>
            <p className="text-muted-foreground">
              Manage platform configuration, admin profile, and system
              preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Settings */}
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
                  <Globe className="h-5 w-5 text-primary" />
                  Platform Configuration
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPlatform(!isEditingPlatform)}
                  className="flex items-center gap-2"
                >
                  {isEditingPlatform ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                  {isEditingPlatform ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={platform.siteName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPlatform({ ...platform, siteName: e.target.value });
                      if (platformErrors.siteName) {
                        setPlatformErrors((prev: FormErrors) => ({
                          ...prev,
                          siteName: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingPlatform}
                    className={cn(
                      "bg-background/50 border-border/50",
                      platformErrors.siteName &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {platformErrors.siteName && (
                    <p className="text-sm text-red-500">
                      {platformErrors.siteName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={platform.siteUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPlatform({ ...platform, siteUrl: e.target.value });
                      if (platformErrors.siteUrl) {
                        setPlatformErrors((prev: FormErrors) => ({
                          ...prev,
                          siteUrl: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingPlatform}
                    className={cn(
                      "bg-background/50 border-border/50",
                      platformErrors.siteUrl &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {platformErrors.siteUrl && (
                    <p className="text-sm text-red-500">
                      {platformErrors.siteUrl}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    value={platform.contactEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPlatform({
                        ...platform,
                        contactEmail: e.target.value,
                      });
                      if (platformErrors.contactEmail) {
                        setPlatformErrors((prev: FormErrors) => ({
                          ...prev,
                          contactEmail: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingPlatform}
                    className={cn(
                      "bg-background/50 border-border/50",
                      platformErrors.contactEmail &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {platformErrors.contactEmail && (
                    <p className="text-sm text-red-500">
                      {platformErrors.contactEmail}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size</Label>
                  <Input
                    id="maxFileSize"
                    value={platform.maxFileSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPlatform({ ...platform, maxFileSize: e.target.value })
                    }
                    disabled={!isEditingPlatform}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <textarea
                  id="siteDescription"
                  value={platform.siteDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setPlatform({
                      ...platform,
                      siteDescription: e.target.value,
                    })
                  }
                  disabled={!isEditingPlatform}
                  rows={3}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={platform.allowedFileTypes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPlatform({
                      ...platform,
                      allowedFileTypes: e.target.value,
                    })
                  }
                  disabled={!isEditingPlatform}
                  className="bg-background/50 border-border/50"
                />
              </div>

              {/* Platform Toggles */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">
                  Platform Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenanceMode" className="text-sm">
                      Maintenance Mode
                    </Label>
                    <Button
                      variant={platform.maintenanceMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformToggle("maintenanceMode")}
                      disabled={!isEditingPlatform}
                      className="h-6 w-12 p-0"
                    >
                      {platform.maintenanceMode ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="registrationEnabled" className="text-sm">
                      User Registration
                    </Label>
                    <Button
                      variant={
                        platform.registrationEnabled ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handlePlatformToggle("registrationEnabled")
                      }
                      disabled={!isEditingPlatform}
                      className="h-6 w-12 p-0"
                    >
                      {platform.registrationEnabled ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications" className="text-sm">
                      Email Notifications
                    </Label>
                    <Button
                      variant={
                        platform.emailNotifications ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePlatformToggle("emailNotifications")}
                      disabled={!isEditingPlatform}
                      className="h-6 w-12 p-0"
                    >
                      {platform.emailNotifications ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemLogs" className="text-sm">
                      System Logs
                    </Label>
                    <Button
                      variant={platform.systemLogs ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformToggle("systemLogs")}
                      disabled={!isEditingPlatform}
                      className="h-6 w-12 p-0"
                    >
                      {platform.systemLogs ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {isEditingPlatform && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingPlatform(false);
                      setPlatformErrors({});
                    }}
                    disabled={isSavingPlatform}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePlatform}
                    disabled={isSavingPlatform}
                    className="flex items-center gap-2"
                  >
                    {isSavingPlatform ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSavingPlatform ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Profile */}
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
                  Admin Profile
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-2"
                >
                  {isEditingProfile ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                  {isEditingProfile ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatars/admin.jpg" />
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setProfile({ ...profile, name: e.target.value });
                      if (profileErrors.name) {
                        setProfileErrors((prev: FormErrors) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingProfile}
                    className={cn(
                      "bg-background/50 border-border/50",
                      profileErrors.name &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-red-500">{profileErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setProfile({ ...profile, email: e.target.value });
                      if (profileErrors.email) {
                        setProfileErrors((prev: FormErrors) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingProfile}
                    className={cn(
                      "bg-background/50 border-border/50",
                      profileErrors.email &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-red-500">
                      {profileErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setProfile({ ...profile, phone: e.target.value });
                      if (profileErrors.phone) {
                        setProfileErrors((prev: FormErrors) => ({
                          ...prev,
                          phone: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingProfile}
                    className={cn(
                      "bg-background/50 border-border/50",
                      profileErrors.phone &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {profileErrors.phone && (
                    <p className="text-sm text-red-500">
                      {profileErrors.phone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setProfile({ ...profile, department: e.target.value });
                      if (profileErrors.department) {
                        setProfileErrors((prev: FormErrors) => ({
                          ...prev,
                          department: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingProfile}
                    className={cn(
                      "bg-background/50 border-border/50",
                      profileErrors.department &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {profileErrors.department && (
                    <p className="text-sm text-red-500">
                      {profileErrors.department}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setProfile({ ...profile, role: e.target.value });
                      if (profileErrors.role) {
                        setProfileErrors((prev: FormErrors) => ({
                          ...prev,
                          role: undefined,
                        }));
                      }
                    }}
                    disabled={!isEditingProfile}
                    className={cn(
                      "bg-background/50 border-border/50",
                      profileErrors.role &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  {profileErrors.role && (
                    <p className="text-sm text-red-500">{profileErrors.role}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    disabled={!isEditingProfile}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  disabled={!isEditingProfile}
                  rows={3}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>

              {isEditingProfile && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileErrors({});
                    }}
                    disabled={isSavingProfile}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSavingProfile ? "Saving..." : "Save Changes"}
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
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      });
                      if (passwordErrors.currentPassword) {
                        setPasswordErrors((prev: FormErrors) => ({
                          ...prev,
                          currentPassword: undefined,
                        }));
                      }
                    }}
                    className={cn(
                      "bg-background/50 border-border/50 pr-10",
                      passwordErrors.currentPassword &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      });
                      if (passwordErrors.newPassword) {
                        setPasswordErrors((prev: FormErrors) => ({
                          ...prev,
                          newPassword: undefined,
                        }));
                      }
                    }}
                    className={cn(
                      "bg-background/50 border-border/50 pr-10",
                      passwordErrors.newPassword &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      });
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors((prev: FormErrors) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }));
                      }
                    }}
                    className={cn(
                      "bg-background/50 border-border/50 pr-10",
                      passwordErrors.confirmPassword &&
                        "border-red-500 focus:border-red-500"
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
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
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Server Status
                </span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Email Service
                </span>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage</span>
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  75% Used
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
                  <Label htmlFor={key} className="text-sm">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                  <Button
                    variant={value ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handleNotificationToggle(
                        key as keyof NotificationSettings
                      )
                    }
                    className="h-6 w-12 p-0"
                  >
                    {value ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
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
