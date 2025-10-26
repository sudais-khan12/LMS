"use client";

import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Calendar,
  BarChart3,
  User,
} from "lucide-react";

const studentNavigationItems = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "My Courses",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: ClipboardList,
  },
  {
    title: "Attendance",
    href: "/student/attendance",
    icon: Calendar,
  },
  {
    title: "Reports",
    href: "/student/reports",
    icon: BarChart3,
  },
  {
    title: "Profile",
    href: "/student/profile",
    icon: User,
  },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      portalTitle="Student Portal"
      navigationItems={studentNavigationItems}
      pageTitle="Dashboard"
      userInfo={{
        name: "Student User",
        email: "student@lms.com",
        fallback: "ST",
      }}
      searchPlaceholder="Search courses, assignments..."
    >
      {children}
    </DashboardLayout>
  );
}
