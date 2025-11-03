"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  portalTitle: string;
  navigationItems: NavItem[];
}

export default function DashboardSidebar({
  isCollapsed,
  onToggle,
  portalTitle,
  navigationItems,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 ease-in-out",
        "bg-white/80 backdrop-blur-md border-r border-white/20",
        isCollapsed ? "w-20" : "w-64",
        "flex flex-col",
        "shadow-lg"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
              {portalTitle}
            </h2>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-gray-700 hover:bg-white/50 flex-shrink-0 lg:block hidden"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                "text-gray-700 hover:bg-white/50",
                isActive &&
                  "bg-blue-100 text-blue-700 border border-blue-200/30",
                "hover:scale-[1.02]"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive && "text-blue-700"
                )}
              />
              {!isCollapsed && (
                <span
                  className={cn(
                    "font-medium transition-opacity duration-200",
                    isActive && "text-blue-700"
                  )}
                >
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          className={cn(
            "w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600",
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

