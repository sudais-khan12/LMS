/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  studentsData,
  detailedClassesData,
  glassStyles,
  animationClasses,
} from "@/config/teacher-constants";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Student {
  id: number;
  name: string;
  studentId: string;
  email: string;
  attendanceStatus: "Present" | "Absent" | "Late";
}

interface AttendanceRecord {
  date: string;
  classId: number;
  students: Student[];
}

export default function AttendancePage() {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);

  // Initialize with default attendance data
  const [currentAttendance, setCurrentAttendance] = useState<Student[]>(
    studentsData.map((s) => ({
      ...s,
      attendanceStatus: s.status,
    }))
  );

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return currentAttendance.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentAttendance, searchQuery]);

  // Get selected class details
  const selectedClassDetails = useMemo(() => {
    return detailedClassesData.find((c) => c.id === selectedClass);
  }, [selectedClass]);

  // Update attendance when class changes
  useEffect(() => {
    if (selectedClassDetails) {
      // Use the students from the selected class
      const classStudents = selectedClassDetails.students.map((s) => ({
        ...s,
        attendanceStatus: "Present" as const,
      }));
      setCurrentAttendance(classStudents);
    }
  }, [selectedClass, selectedClassDetails]);

  const handleStatusChange = (
    studentId: number,
    status: "Present" | "Absent" | "Late"
  ) => {
    setCurrentAttendance((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, attendanceStatus: status }
          : student
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-4 w-4" />;
      case "Absent":
        return <XCircle className="h-4 w-4" />;
      case "Late":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const presentCount = currentAttendance.filter(
    (s) => s.attendanceStatus === "Present"
  ).length;
  const absentCount = currentAttendance.filter(
    (s) => s.attendanceStatus === "Absent"
  ).length;
  const lateCount = currentAttendance.filter(
    (s) => s.attendanceStatus === "Late"
  ).length;
  const totalStudents = currentAttendance.length;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Prepare chart data
  const chartData = [
    {
      name: "Attendance",
      Present: presentCount,
      Absent: absentCount,
      Late: lateCount,
    },
  ];

  // Handle save attendance
  const handleSaveAttendance = () => {
    const record: AttendanceRecord = {
      date: selectedDate,
      classId: selectedClass,
      students: currentAttendance,
    };

    // Update records (in a real app, this would be sent to backend)
    setAttendanceRecords((prev) => [...prev, record]);

    toast({
      title: "Success",
      description: "Attendance updated successfully",
    });
  };

  // Handle export
  const handleExport = () => {
    toast({
      title: "Exporting",
      description: "Downloading attendance report...",
    });
    // In a real app, this would generate and download a CSV/PDF
  };

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Attendance 📊
            </h1>
            <p className="text-muted-foreground">
              Mark and track student attendance for your classes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleSaveAttendance}>
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label>Class</Label>
            <Select
              value={selectedClass.toString()}
              onValueChange={(val) => setSelectedClass(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {detailedClassesData.map((classItem) => (
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
          <div className="space-y-2">
            <Label>Search Students</Label>
            <Input
              withSearchIcon={true}
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
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
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStudents}
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
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Present Today
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {presentCount}
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
              <div className="p-3 rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Late
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {lateCount}
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
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {attendanceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Attendance Overview - {selectedClassDetails?.subject} (
            {new Date(selectedDate).toLocaleDateString()})
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
                  backdropFilter: "blur(8px)",
                }}
              />
              <Legend />
              <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Students Attendance Table */}
      <Card
        className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Student Attendance - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Student ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Email
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
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {student.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs flex items-center gap-1 w-fit",
                            getStatusColor(student.attendanceStatus)
                          )}
                        >
                          {getStatusIcon(student.attendanceStatus)}
                          {student.attendanceStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              handleStatusChange(student.id, "Present")
                            }
                          >
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              handleStatusChange(student.id, "Absent")
                            }
                          >
                            Absent
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              handleStatusChange(student.id, "Late")
                            }
                          >
                            Late
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
