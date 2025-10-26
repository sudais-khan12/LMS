"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  teacherStudentsData,
  detailedClassesData,
  glassStyles,
  animationClasses,
  TeacherStudent,
} from "@/config/teacher-constants";
import {
  Search,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Move,
  X,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function TeacherStudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] =
    useState<TeacherStudent[]>(teacherStudentsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(
    null
  );
  const [newClassId, setNewClassId] = useState("");

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass =
        classFilter === "all" || student.classId === Number(classFilter);
      const matchesPerformance =
        performanceFilter === "all" ||
        (performanceFilter === "high" &&
          (student.grade.startsWith("A") || student.attendance >= 90)) ||
        (performanceFilter === "medium" &&
          (student.grade.startsWith("B") ||
            (student.attendance >= 75 && student.attendance < 90))) ||
        (performanceFilter === "low" &&
          (student.grade.startsWith("C") || student.attendance < 75));
      return matchesSearch && matchesClass && matchesPerformance;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "attendance") return b.attendance - a.attendance;
      if (sortBy === "progress") return b.progress - a.progress;
      if (sortBy === "grade") {
        const gradeOrder = {
          "A+": 5,
          A: 4,
          "B+": 3,
          B: 3,
          "C+": 2,
          C: 2,
          D: 1,
        };
        return (
          (gradeOrder[b.grade as keyof typeof gradeOrder] || 0) -
          (gradeOrder[a.grade as keyof typeof gradeOrder] || 0)
        );
      }
      return 0;
    });

  // Chart data
  const chartData = [
    {
      name: "A",
      students: students.filter((s) => s.grade.startsWith("A")).length,
    },
    {
      name: "B",
      students: students.filter((s) => s.grade.startsWith("B")).length,
    },
    {
      name: "C",
      students: students.filter((s) => s.grade.startsWith("C")).length,
    },
    {
      name: "Others",
      students: students.filter(
        (s) =>
          !s.grade.startsWith("A") &&
          !s.grade.startsWith("B") &&
          !s.grade.startsWith("C")
      ).length,
    },
  ];

  const attendanceChartData = [
    {
      range: "90-100%",
      students: students.filter((s) => s.attendance >= 90).length,
    },
    {
      range: "75-89%",
      students: students.filter((s) => s.attendance >= 75 && s.attendance < 90)
        .length,
    },
    {
      range: "50-74%",
      students: students.filter((s) => s.attendance >= 50 && s.attendance < 75)
        .length,
    },
    {
      range: "< 50%",
      students: students.filter((s) => s.attendance < 50).length,
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
    if (grade.startsWith("A"))
      return "bg-green-100 text-green-800 border-green-200";
    if (grade.startsWith("B"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (grade.startsWith("C"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const openProfileModal = (student: TeacherStudent) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const openMoveModal = (student: TeacherStudent) => {
    setSelectedStudent(student);
    setIsMoveModalOpen(true);
  };

  const openDeleteModal = (student: TeacherStudent) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleMoveStudent = () => {
    if (!selectedStudent || !newClassId) return;

    const newClass = detailedClassesData.find(
      (c) => c.id === Number(newClassId)
    );
    if (!newClass) return;

    const updatedStudents = students.map((s) =>
      s.id === selectedStudent.id
        ? {
            ...s,
            classId: Number(newClassId),
            className: newClass.subject,
            classCode: newClass.classCode,
          }
        : s
    );

    setStudents(updatedStudents);
    setIsMoveModalOpen(false);
    setSelectedStudent(null);
    setNewClassId("");

    toast({
      title: "Success",
      description: `Student moved to ${newClass.subject}`,
    });
  };

  const handleRemoveStudent = () => {
    if (!selectedStudent) return;

    const updatedStudents = students.filter((s) => s.id !== selectedStudent.id);
    setStudents(updatedStudents);
    setIsDeleteModalOpen(false);
    setSelectedStudent(null);

    toast({
      title: "Success",
      description: "Student removed from class",
    });
  };

  const uniqueClasses = detailedClassesData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "rounded-2xl p-6",
          glassStyles.card,
          "shadow-glass-sm",
          animationClasses.fadeIn
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Students 👨‍🎓
            </h1>
            <p className="text-muted-foreground">
              Manage and track your students&apos; progress and performance.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{filteredAndSortedStudents.length} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(226, 232, 240, 0.3)"
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(100, 116, 139, 0.8)"
                  fontSize={12}
                />
                <YAxis stroke="rgba(100, 116, 139, 0.8)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Attendance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(226, 232, 240, 0.3)"
                />
                <XAxis
                  dataKey="range"
                  stroke="rgba(100, 116, 139, 0.8)"
                  fontSize={12}
                />
                <YAxis stroke="rgba(100, 116, 139, 0.8)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card
        className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                withSearchIcon={true}
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((classItem) => (
                  <SelectItem
                    key={classItem.id}
                    value={classItem.id.toString()}
                  >
                    {classItem.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={performanceFilter}
              onValueChange={setPerformanceFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="high">High Performers</SelectItem>
                <SelectItem value="medium">Medium Performers</SelectItem>
                <SelectItem value="low">At Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="grade">Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
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
            <Users className="h-5 w-5 text-primary" />
            Student List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Class
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Progress
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Attendance
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Grade
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
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
                          <div className="font-medium text-foreground">
                            {student.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Last active: {student.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {student.className}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {student.classCode}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall</span>
                          <span className="font-medium text-foreground">
                            {student.progress}%
                          </span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {student.completedAssignments}/
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
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm",
                          getStatusColor(student.status)
                        )}
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => openProfileModal(student)}
                        >
                          <Eye className="h-4 w-4" />
                          Details
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Progress
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    students.reduce((acc, s) => acc + s.progress, 0) /
                      students.length
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Attendance
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    students.reduce((acc, s) => acc + s.attendance, 0) /
                      students.length
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top Performers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter((s) => s.grade.startsWith("A")).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            glassStyles.card,
            glassStyles.cardHover,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-100">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  At Risk
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter((s) => s.status === "At Risk").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name}&apos;s Profile</DialogTitle>
            <DialogDescription>
              View detailed student information and performance metrics.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Student ID
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedStudent.studentId}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{selectedStudent.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Class</Label>
                  <p className="text-sm font-medium">
                    {selectedStudent.className}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Current Grade
                  </Label>
                  <Badge className={getGradeColor(selectedStudent.grade)}>
                    {selectedStudent.grade}
                  </Badge>
                </div>
              </div>

              {/* Progress Metrics */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Overall Progress</Label>
                    <span className="text-sm font-medium">
                      {selectedStudent.progress}%
                    </span>
                  </div>
                  <Progress value={selectedStudent.progress} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Attendance</Label>
                    <span className="text-sm font-medium">
                      {selectedStudent.attendance}%
                    </span>
                  </div>
                  <Progress
                    value={selectedStudent.attendance}
                    className="h-3"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => openMoveModal(selectedStudent)}
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move to Another Class
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openDeleteModal(selectedStudent)}
                  className="text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove from Class
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsProfileModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Student Modal */}
      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Student to Another Class</DialogTitle>
            <DialogDescription>
              Select a new class for {selectedStudent?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select New Class</Label>
              <Select value={newClassId} onValueChange={setNewClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses
                    .filter((c) => c.id !== selectedStudent?.classId)
                    .map((classItem) => (
                      <SelectItem
                        key={classItem.id}
                        value={classItem.id.toString()}
                      >
                        {classItem.subject} - {classItem.classCode}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveStudent}>Move Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Student Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Student from Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedStudent?.name} from their
              current class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveStudent}>
              Remove Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
