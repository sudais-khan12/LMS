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
import { glassStyles, animationClasses } from "@/config/teacher-constants";
import { TeacherNavbarProps } from "@/lib/teacher-types";
import { Bell, Menu, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeacherNavbar({ pageTitle, onMenuClick }: TeacherNavbarProps) {
  const [notifications] = useState(5); // Mock notification count

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-300",
        glassStyles.navbar,
        "flex items-center justify-between px-6"
      )}
    >
      {/* Left side - Menu button and page title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden text-foreground hover:bg-accent/50"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right side - Search, notifications, and user menu */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:block">
          <Input
            placeholder="Search students, classes..."
            className="w-64 bg-background/50 border-border/50 focus:bg-background/80"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground hover:bg-accent/50"
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full hover:bg-accent/50 cursor-pointer"
              type="button"
            >
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="/avatars/teacher.jpg" alt="Teacher" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  TR
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 z-[60]" 
            align="end" 
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Teacher User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  teacher@school.edu
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
