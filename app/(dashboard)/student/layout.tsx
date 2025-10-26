"use client";

import { useState } from "react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import StudentNavbar from "@/components/student/Navbar";
import StudentSidebar from "@/components/student/Sidebar";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Background Pattern */}
      {/* <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" /> */}

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navbar - Fixed at top */}
      <StudentNavbar pageTitle="Dashboard" onMenuClick={toggleMobileMenu} />

      {/* Sidebar - Fixed Position */}
      <div
        className={cn(
          "fixed top-16 left-0 z-50",
          "h-[calc(100vh-4rem)]", // Full height minus navbar height (4rem = 64px)
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <StudentSidebar
          isCollapsed={sidebarCollapsed && !mobileMenuOpen}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "pt-16 transition-all duration-300 ease-in-out",
          "lg:ml-64",
          sidebarCollapsed && "lg:ml-20"
        )}
      >
        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-screen">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
