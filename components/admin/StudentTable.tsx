"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { Student, SortState } from "@/types/student";
import {
  UserCheck,
  Eye,
  Edit,
  Trash2,
  UserX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Award,
  Clock,
  Calendar,
  GraduationCap,
} from "lucide-react";

interface StudentTableProps {
  students: Student[];
  sortState: SortState;
  onSort: (field: keyof Student) => void;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onToggleStatus: (studentId: number, currentStatus: string) => void;
  selectedStudents: number[];
  onSelectStudent: (studentId: number) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
}

export default function StudentTable({
  students,
  sortState,
  onSort,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  isLoading = false,
}: StudentTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "At Risk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "Suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A"))
      return "bg-green-100 text-green-800 border-green-200";
    if (grade.startsWith("B"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (grade.startsWith("C"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getYearColor = (year: string) => {
    switch (year) {
      case "Freshman":
        return "bg-green-100 text-green-800 border-green-200";
      case "Sophomore":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Junior":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Senior":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSortIcon = (field: keyof Student) => {
    if (sortState.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortState.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const isAllSelected =
    students.length > 0 && selectedStudents.length === students.length;
  const isIndeterminate =
    selectedStudents.length > 0 && selectedStudents.length < students.length;

  if (students.length === 0) {
    return (
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No students found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters to find students.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <UserCheck className="h-5 w-5 text-primary" />
          Students ({students.length})
          {selectedStudents.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedStudents.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el)
                        (el as unknown as HTMLInputElement).indeterminate =
                          isIndeterminate;
                    }}
                    onCheckedChange={onSelectAll}
                    disabled={isLoading}
                  />
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => onSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Student
                    {getSortIcon("name")}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => onSort("department")}
                >
                  <div className="flex items-center gap-2">
                    Department
                    {getSortIcon("department")}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => onSort("year")}
                >
                  <div className="flex items-center gap-2">
                    Year
                    {getSortIcon("year")}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => onSort("progress")}
                >
                  <div className="flex items-center gap-2">
                    Progress
                    {getSortIcon("progress")}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => onSort("attendance")}
                >
                  <div className="flex items-center gap-2">
                    Attendance
                    {getSortIcon("attendance")}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Grade
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => onSort("gpa")}
                >
                  <div className="flex items-center gap-2">
                    GPA
                    {getSortIcon("gpa")}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => onSort("status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon("status")}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className={cn(
                    "border-b border-border/30 hover:bg-muted/30 transition-colors duration-200",
                    selectedStudents.includes(student.id) && "bg-blue-50/50"
                  )}
                >
                  <td className="py-4 px-4">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => onSelectStudent(student.id)}
                      disabled={isLoading}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={`/avatars/${student.name
                            .toLowerCase()
                            .replace(" ", "-")}.jpg`}
                        />
                        <AvatarFallback className="text-sm">
                          {student.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {student.name}
                          {student.verified && (
                            <Award className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {student.studentId}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>Last active: {student.lastActive}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="text-sm">
                      {student.department}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={cn("text-sm", getYearColor(student.year))}
                    >
                      {student.year}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Overall</span>
                        <span className="font-medium text-foreground">
                          {student.progress}%
                        </span>
                      </div>
                      <Progress value={student.progress} className="h-2 w-20" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {student.assignmentsCompleted}/
                          {student.totalAssignments} assignments
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {student.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={cn("text-sm", getGradeColor(student.grade))}
                    >
                      {student.grade}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-foreground">
                      {student.gpa}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={cn("text-sm", getStatusColor(student.status))}
                    >
                      {student.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(student)}
                        className="flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(student)}
                        className="flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onToggleStatus(student.id, student.status)
                        }
                        className={cn(
                          "flex items-center gap-1",
                          student.status === "Active"
                            ? "text-red-600 hover:text-red-700"
                            : "text-green-600 hover:text-green-700"
                        )}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : student.status === "Active" ? (
                          <UserX className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        {student.status === "Active" ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(student)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
