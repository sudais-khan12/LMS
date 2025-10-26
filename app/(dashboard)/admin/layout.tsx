"use client";

import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { navigationItems } from "@/config/constants";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      portalTitle="LMS Admin"
      navigationItems={navigationItems}
      pageTitle="Dashboard"
      userInfo={{
        name: "Admin User",
        email: "admin@lms.com",
        fallback: "AD",
      }}
      searchPlaceholder="Search..."
    >
      {children}
    </DashboardLayout>
  );
}
