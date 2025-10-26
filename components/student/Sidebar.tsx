"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { glassStyles, animationClasses } from "@/config/constants";
import { SidebarProps } from "@/lib/types";
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Calendar,
  BarChart3,
  User,
  GraduationCap
} from "lucide-react";

// Student navigation items
const studentNavigationItems = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
    active: true,
  },
  {
    title: "My Courses",
    href: "/student/courses",
    icon: BookOpen,
    active: false,
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: ClipboardList,
    active: false,
  },
  {
    title: "Attendance",
    href: "/student/attendance",
    icon: Calendar,
    active: false,
  },
  {
    title: "Reports",
    href: "/student/reports",
    icon: BarChart3,
    active: false,
  },
  {
    title: "Profile",
    href: "/student/profile",
    icon: User,
    active: false,
  },
];

export default function StudentSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 ease-in-out",
        "lg:bg-sidebar/30 lg:backdrop-blur-md lg:border-r lg:border-sidebar-border",
        "bg-white border-r border-gray-200", // Simple white background for mobile
        isCollapsed ? "w-20" : "w-64",
        "flex flex-col",
        "lg:shadow-none shadow-lg" // Add shadow only on mobile
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:border-sidebar-border/50">
        <div className="flex items-center gap-3 min-w-0">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900 lg:text-sidebar-foreground whitespace-nowrap">
              Student Portal
            </h2>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent/50 flex-shrink-0 lg:block hidden"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {studentNavigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                "text-gray-700 hover:bg-gray-100 lg:text-sidebar-foreground lg:hover:bg-sidebar-accent/50",
                isActive && "bg-blue-100 text-blue-700 lg:bg-sidebar-primary/20 lg:text-sidebar-primary lg:border lg:border-sidebar-primary/30",
                animationClasses.hover
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-blue-700 lg:text-sidebar-primary")} />
              {!isCollapsed && (
                <span className={cn(
                  "font-medium transition-opacity duration-200",
                  isActive && "text-blue-700 lg:text-sidebar-primary"
                )}>
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 lg:border-sidebar-border/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600 lg:text-sidebar-foreground lg:hover:bg-destructive/10 lg:hover:text-destructive",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
