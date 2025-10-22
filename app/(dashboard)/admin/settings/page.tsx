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
  CheckCircle
} from "lucide-react";

// Mock admin profile data
const adminProfile = {
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
const platformSettings = {
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
const notificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  systemAlerts: true,
  userRegistration: true,
  courseUpdates: true,
  maintenanceAlerts: true,
  securityAlerts: true,
  performanceAlerts: false,
};

export default function AdminSettingsPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPlatform, setIsEditingPlatform] = useState(false);
  const [profile, setProfile] = useState(adminProfile);
  const [platform, setPlatform] = useState(platformSettings);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [theme, setTheme] = useState("light");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = () => {
    // Mock save functionality
    setIsEditingProfile(false);
  };

  const handleSavePlatform = () => {
    // Mock save functionality
    setIsEditingPlatform(false);
  };

  const handlePasswordChange = () => {
    // Mock password change functionality
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePlatformToggle = (key: keyof typeof platform) => {
    setPlatform(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "rounded-2xl p-6",
        glassStyles.card,
        "shadow-glass-sm",
        animationClasses.fadeIn
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Platform Settings ⚙️
            </h1>
            <p className="text-muted-foreground">
              Manage platform configuration, admin profile, and system preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Settings */}
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
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
                  {isEditingPlatform ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
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
                    onChange={(e) => setPlatform({...platform, siteName: e.target.value})}
                    disabled={!isEditingPlatform}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={platform.siteUrl}
                    onChange={(e) => setPlatform({...platform, siteUrl: e.target.value})}
                    disabled={!isEditingPlatform}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    value={platform.contactEmail}
                    onChange={(e) => setPlatform({...platform, contactEmail: e.target.value})}
                    disabled={!isEditingPlatform}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size</Label>
                  <Input
                    id="maxFileSize"
                    value={platform.maxFileSize}
                    onChange={(e) => setPlatform({...platform, maxFileSize: e.target.value})}
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
                  onChange={(e) => setPlatform({...platform, siteDescription: e.target.value})}
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
                  onChange={(e) => setPlatform({...platform, allowedFileTypes: e.target.value})}
                  disabled={!isEditingPlatform}
                  className="bg-background/50 border-border/50"
                />
              </div>

              {/* Platform Toggles */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Platform Features</h4>
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
                      {platform.maintenanceMode ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="registrationEnabled" className="text-sm">
                      User Registration
                    </Label>
                    <Button
                      variant={platform.registrationEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformToggle("registrationEnabled")}
                      disabled={!isEditingPlatform}
                      className="h-6 w-12 p-0"
                    >
                      {platform.registrationEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications" className="text-sm">
                      Email Notifications
                    </Label>
                    <Button
                      variant={platform.emailNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformToggle("emailNotifications")}
                      disabled={!isEditingPlatform}
                      className="h-6 w-12 p-0"
                    >
                      {platform.emailNotifications ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
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
                      {platform.systemLogs ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              {isEditingPlatform && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingPlatform(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePlatform} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Profile */}
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
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
                  {isEditingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
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
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
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
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditingProfile}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditingProfile}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    disabled={!isEditingProfile}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    disabled={!isEditingProfile}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role}
                    onChange={(e) => setProfile({...profile, role: e.target.value})}
                    disabled={!isEditingProfile}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
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
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  disabled={!isEditingProfile}
                  rows={3}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>

              {isEditingProfile && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
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
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <Button onClick={handlePasswordChange} className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Server Status</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Service</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Storage</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  75% Used
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preferences */}
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
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
                    onClick={() => setTheme("light")}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="flex-1"
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
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
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Button
                    variant={value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                    className="h-6 w-12 p-0"
                  >
                    {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined: {new Date(profile.joinDate).toLocaleDateString()}</span>
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
