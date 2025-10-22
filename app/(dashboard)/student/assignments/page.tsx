"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import {
  Search,
  Filter,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AssignmentTable from "@/components/ui/student/AssignmentTable";

// Mock assignment data
const assignments = [
  {
    id: 1,
    title: "React Component Library",
    course: "React Fundamentals",
    dueDate: "2024-02-15",
    status: "submitted" as const,
    points: 100,
    description:
      "Create a reusable component library with at least 5 components including Button, Input, Modal, Card, and Dropdown.",
  },
  {
    id: 2,
    title: "JavaScript Algorithms",
    course: "JavaScript Advanced",
    dueDate: "2024-02-20",
    status: "pending" as const,
    points: 150,
    description:
      "Implement sorting algorithms (bubble sort, quick sort, merge sort) and analyze their time complexity.",
  },
  {
    id: 3,
    title: "REST API Development",
    course: "Node.js Backend Development",
    dueDate: "2024-02-18",
    status: "overdue" as const,
    points: 200,
    description:
      "Build a complete REST API with authentication, CRUD operations, and data validation using Express.js.",
  },
  {
    id: 4,
    title: "Database Schema Design",
    course: "Database Design & Management",
    dueDate: "2024-02-25",
    status: "pending" as const,
    points: 120,
    description:
      "Design a normalized database schema for an e-commerce platform with proper relationships and constraints.",
  },
  {
    id: 5,
    title: "UI/UX Wireframes",
    course: "UI/UX Design Principles",
    dueDate: "2024-02-22",
    status: "submitted" as const,
    points: 80,
    description:
      "Create wireframes and mockups for a mobile app interface using Figma or similar design tools.",
  },
  {
    id: 6,
    title: "Data Analysis Project",
    course: "Python for Data Science",
    dueDate: "2024-03-01",
    status: "pending" as const,
    points: 180,
    description:
      "Analyze a dataset using pandas, numpy, and matplotlib to create visualizations and insights.",
  },
];

export default function AssignmentsPage() {
  const submittedCount = assignments.filter(
    (a) => a.status === "submitted"
  ).length;
  const pendingCount = assignments.filter((a) => a.status === "pending").length;
  const overdueCount = assignments.filter((a) => a.status === "overdue").length;
  const totalPoints = assignments.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = assignments
    .filter((a) => a.status === "submitted")
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Assignments 📝
            </h1>
            <p className="text-muted-foreground">
              Track your assignment progress and submission deadlines.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {submittedCount} Submitted
            </Badge>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-700"
            >
              {pendingCount} Pending
            </Badge>
            {overdueCount > 0 && (
              <Badge variant="destructive">{overdueCount} Overdue</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Assignments
                </p>
                <p className="text-xl font-bold text-foreground">
                  {assignments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Submitted
                </p>
                <p className="text-xl font-bold text-foreground">
                  {submittedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-xl font-bold text-foreground">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <ClipboardList className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Points Earned
                </p>
                <p className="text-xl font-bold text-foreground">
                  {earnedPoints}/{totalPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <Card
          className={cn(
            "rounded-2xl shadow-glass-sm border-red-200 bg-red-50/50",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  You have {overdueCount} overdue assignment
                  {overdueCount > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-red-600">
                  Please submit them as soon as possible to avoid further
                  penalties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments Table */}
      <AssignmentTable assignments={assignments} />
    </div>
  );
}
