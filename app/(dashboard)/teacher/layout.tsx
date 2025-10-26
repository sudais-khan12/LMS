"use client";

import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { teacherNavigationItems } from "@/config/teacher-constants";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      portalTitle="Teacher Portal"
      navigationItems={teacherNavigationItems}
      pageTitle="Teacher Dashboard"
      userInfo={{
        name: "Teacher User",
        email: "teacher@school.edu",
        fallback: "TR",
      }}
      searchPlaceholder="Search students, classes..."
    >
      {children}
    </DashboardLayout>
  );
}
