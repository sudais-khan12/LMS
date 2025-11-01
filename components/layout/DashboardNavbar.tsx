"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

interface DashboardNavbarProps {
  pageTitle: string;
  onMenuClick: () => void;
  userInfo?: {
    name: string;
    email: string;
    avatar?: string;
    fallback: string;
  };
  searchPlaceholder?: string;
}

export default function DashboardNavbar({
  pageTitle,
  onMenuClick,
  userInfo = {
    name: "User",
    email: "user@lms.com",
    fallback: "U",
  },
  searchPlaceholder = "Search...",
}: DashboardNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-300",
        "bg-white/80 backdrop-blur-md border-b border-white/20",
        "flex items-center justify-between px-6",
        "shadow-sm"
      )}
    >
      {/* Left side - Menu button and page title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden text-gray-900 hover:bg-white/50"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Right side - Search, notifications, and user menu */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:block">
          <Input
            placeholder={searchPlaceholder}
            className="w-64 bg-white/50 border-white/20 focus:bg-white/80"
          />
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full hover:bg-white/50 cursor-pointer"
              type="button"
            >
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {userInfo.fallback}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 z-[60] bg-white/95 backdrop-blur-md"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900">
                  {userInfo.name}
                </p>
                <p className="text-xs leading-none text-gray-500">
                  {userInfo.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-gray-700">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

