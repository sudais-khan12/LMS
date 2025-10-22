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
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Mail,
  Phone,
  Eye,
  UserX,
  GraduationCap
} from "lucide-react";

// Mock students data
const studentsData = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@student.com",
    phone: "+1 (555) 123-4567",
    avatar: "AJ",
    department: "Computer Science",
    year: "Junior",
    joinDate: "2023-09-01",
    lastActive: "2 hours ago",
    status: "Active" as const,
    courses: ["React Fundamentals", "JavaScript Advanced"],
    attendance: 94,
    progress: 87,
    assignmentsCompleted: 18,
    totalAssignments: 22,
    grade: "A",
    gpa: 3.8,
    verified: true,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.smith@student.com",
    phone: "+1 (555) 234-5678",
    avatar: "BS",
    department: "Computer Science",
    year: "Sophomore",
    joinDate: "2023-09-01",
    lastActive: "1 day ago",
    status: "Active" as const,
    courses: ["React Fundamentals", "Database Design"],
    attendance: 88,
    progress: 72,
    assignmentsCompleted: 15,
    totalAssignments: 20,
    grade: "B+",
    gpa: 3.2,
    verified: true,
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol.davis@student.com",
    phone: "+1 (555) 345-6789",
    avatar: "CD",
    department: "Design",
    year: "Senior",
    joinDate: "2022-09-01",
    lastActive: "30 minutes ago",
    status: "Active" as const,
    courses: ["JavaScript Advanced", "UI/UX Design"],
    attendance: 96,
    progress: 95,
    assignmentsCompleted: 19,
    totalAssignments: 19,
    grade: "A+",
    gpa: 3.9,
    verified: true,
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@student.com",
    phone: "+1 (555) 456-7890",
    avatar: "DW",
    department: "Computer Science",
    year: "Freshman",
    joinDate: "2024-01-15",
    lastActive: "3 days ago",
    status: "At Risk" as const,
    courses: ["React Fundamentals"],
    attendance: 78,
    progress: 65,
    assignmentsCompleted: 12,
    totalAssignments: 18,
    grade: "C+",
    gpa: 2.8,
    verified: false,
  },
  {
    id: 5,
    name: "Eva Brown",
    email: "eva.brown@student.com",
    phone: "+1 (555) 567-8901",
    avatar: "EB",
    department: "Computer Science",
    year: "Junior",
    joinDate: "2023-09-01",
    lastActive: "1 hour ago",
    status: "Active" as const,
    courses: ["Database Design", "Node.js Backend"],
    attendance: 92,
    progress: 89,
    assignmentsCompleted: 17,
    totalAssignments: 19,
    grade: "A-",
    gpa: 3.6,
    verified: true,
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
    case "Suspended":
      return "bg-orange-100 text-orange-800 border-orange-200";
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

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "All" || student.department === filterDepartment;
    const matchesStatus = filterStatus === "All" || student.status === filterStatus;
    const matchesYear = filterYear === "All" || student.year === filterYear;
    return matchesSearch && matchesDepartment && matchesStatus && matchesYear;
  });

  const handleEditStudent = (studentId: number) => {
    // Mock edit functionality
    console.log("Edit student:", studentId);
  };

  const handleDeleteStudent = (studentId: number) => {
    // Mock delete functionality
    console.log("Delete student:", studentId);
  };

  const handleToggleStatus = (studentId: number, currentStatus: string) => {
    // Mock toggle status functionality
    console.log("Toggle status for student:", studentId, "from", currentStatus);
  };

  const departments = ["All", ...Array.from(new Set(studentsData.map(s => s.department)))];
  const years = ["All", ...Array.from(new Set(studentsData.map(s => s.year)))];

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
              Student Records 🎓
            </h1>
            <p className="text-muted-foreground">
              View and manage student records, progress, and academic performance.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{studentsData.length}</p>
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
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-foreground">
                  {studentsData.filter(s => s.status === "Active").length}
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
              <div className="p-3 rounded-xl bg-yellow-100">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                <p className="text-2xl font-bold text-foreground">
                  {studentsData.filter(s => s.grade.startsWith('A')).length}
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
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg GPA</p>
                <p className="text-2xl font-bold text-foreground">
                  {(studentsData.reduce((acc, s) => acc + s.gpa, 0) / studentsData.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Search students by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm"
              >
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Button
                variant={filterStatus === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("All")}
              >
                All Status
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
            <UserCheck className="h-5 w-5 text-primary" />
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Year</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Attendance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">GPA</th>
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
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/avatars/${student.name.toLowerCase().replace(' ', '-')}.jpg`} />
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
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                          <div className="text-xs text-muted-foreground">{student.phone}</div>
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
                          <span className="font-medium text-foreground">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2 w-20" />
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
                          onClick={() => handleEditStudent(student.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student.id)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(student.id, student.status)}
                          className={cn(
                            "flex items-center gap-1",
                            student.status === "Active" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                          )}
                        >
                          {student.status === "Active" ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          {student.status === "Active" ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
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
    </div>
  );
}
