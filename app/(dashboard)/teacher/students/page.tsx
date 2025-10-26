"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { 
  Search, 
  Filter, 
  Eye, 
  Users, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Award,
  Clock
} from "lucide-react";

// Mock student data
const studentsData = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@student.com",
    avatar: "AJ",
    courses: ["React Fundamentals", "JavaScript Advanced"],
    attendance: 94,
    progress: 87,
    assignmentsCompleted: 18,
    totalAssignments: 22,
    lastActive: "2 hours ago",
    grade: "A",
    status: "Active" as const,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.smith@student.com",
    avatar: "BS",
    courses: ["React Fundamentals", "Database Design"],
    attendance: 88,
    progress: 72,
    assignmentsCompleted: 15,
    totalAssignments: 20,
    lastActive: "1 day ago",
    grade: "B+",
    status: "Active" as const,
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol.davis@student.com",
    avatar: "CD",
    courses: ["JavaScript Advanced", "UI/UX Design"],
    attendance: 96,
    progress: 95,
    assignmentsCompleted: 19,
    totalAssignments: 19,
    lastActive: "30 minutes ago",
    grade: "A+",
    status: "Active" as const,
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@student.com",
    avatar: "DW",
    courses: ["React Fundamentals"],
    attendance: 78,
    progress: 65,
    assignmentsCompleted: 12,
    totalAssignments: 18,
    lastActive: "3 days ago",
    grade: "C+",
    status: "At Risk" as const,
  },
  {
    id: 5,
    name: "Eva Brown",
    email: "eva.brown@student.com",
    avatar: "EB",
    courses: ["Database Design", "Node.js Backend"],
    attendance: 92,
    progress: 89,
    assignmentsCompleted: 17,
    totalAssignments: 19,
    lastActive: "1 hour ago",
    grade: "A-",
    status: "Active" as const,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200";
    case "At Risk":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Inactive":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-green-100 text-green-800 border-green-200";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "rounded-2xl p-6",
        glassStyles.card,
        "shadow-glass-sm",
        animationClasses.fadeIn
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Students 👨‍🎓
            </h1>
            <p className="text-muted-foreground">
              Manage and track your students' progress and performance.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{filteredStudents.length} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className={cn(
        glassStyles.card,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("All")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "Active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Active")}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "At Risk" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("At Risk")}
              >
                At Risk
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Student List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Courses</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Attendance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/avatars/${student.name.toLowerCase().replace(' ', '-')}.jpg`} />
                          <AvatarFallback className="text-sm">
                            {student.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Last active: {student.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {student.courses.map((course, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{course}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall</span>
                          <span className="font-medium text-foreground">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{student.assignmentsCompleted}/{student.totalAssignments} assignments</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{student.attendance}%</span>
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
                      <Badge 
                        variant="outline" 
                        className={cn("text-sm", getStatusColor(student.status))}
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(filteredStudents.reduce((acc, s) => acc + s.progress, 0) / filteredStudents.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Attendance</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(filteredStudents.reduce((acc, s) => acc + s.attendance, 0) / filteredStudents.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredStudents.filter(s => s.grade.startsWith('A')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
