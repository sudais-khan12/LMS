"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { RoleCard } from "@/components/auth/RoleCard";
import { Users, GraduationCap, UserCheck } from "lucide-react";

const roles = [
  {
    title: "Admin",
    description:
      "Manage the entire LMS platform, users, courses, and system settings.",
    icon: Users,
    route: "/admin",
  },
  {
    title: "Teacher",
    description:
      "Create courses, manage classes, track student progress, and grade assignments.",
    icon: GraduationCap,
    route: "/teacher",
  },
  {
    title: "Student",
    description:
      "Enroll in courses, complete assignments, track your progress, and access resources.",
    icon: UserCheck,
    route: "/student",
  },
];

export default function SelectRolePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Auto-redirect based on user role if authenticated
  React.useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role;
      if (role === "ADMIN") {
        router.replace("/admin");
      } else if (role === "TEACHER") {
        router.replace("/teacher");
      } else if (role === "STUDENT") {
        router.replace("/student");
      }
    } else if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      router.replace("/login");
    }
  }, [session, status, router]);

  const handleRoleSelect = (route: string) => {
    // Only allow navigation if user's role matches the selected route
    if (status === "authenticated" && session?.user) {
      const userRole = session.user.role;
      const routeRole = route.includes("admin")
        ? "ADMIN"
        : route.includes("teacher")
        ? "TEACHER"
        : "STUDENT";

      if (userRole === routeRole) {
        router.push(route);
      } else {
        // If role doesn't match, redirect based on actual role
        if (userRole === "ADMIN") {
          router.push("/admin");
        } else if (userRole === "TEACHER") {
          router.push("/teacher");
        } else if (userRole === "STUDENT") {
          router.push("/student");
        }
      }
    } else {
      // Not authenticated, redirect to login
      router.push(`/login?callbackUrl=${encodeURIComponent(route)}`);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground">Welcome to LMS</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please select your role to continue to your dashboard
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleCard
              key={role.title}
              title={role.title}
              description={role.description}
              icon={role.icon}
              onClick={() => handleRoleSelect(role.route)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need to switch accounts?{" "}
            <a href="/auth/login" className="text-primary hover:underline">
              Sign out
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
