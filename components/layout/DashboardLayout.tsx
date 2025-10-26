"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  portalTitle: string;
  navigationItems: NavItem[];
  pageTitle: string;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    fallback: string;
  };
  searchPlaceholder?: string;
}

export default function DashboardLayout({
  children,
  portalTitle,
  navigationItems,
  pageTitle,
  userInfo,
  searchPlaceholder,
}: DashboardLayoutProps) {
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
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navbar - Fixed at top */}
      <DashboardNavbar
        pageTitle={pageTitle}
        onMenuClick={toggleMobileMenu}
        userInfo={userInfo}
        searchPlaceholder={searchPlaceholder}
      />

      {/* Sidebar - Fixed Position */}
      <div
        className={cn(
          "fixed top-16 left-0 z-50",
          "h-[calc(100vh-4rem)]",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <DashboardSidebar
          isCollapsed={sidebarCollapsed && !mobileMenuOpen}
          onToggle={toggleSidebar}
          portalTitle={portalTitle}
          navigationItems={navigationItems}
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

