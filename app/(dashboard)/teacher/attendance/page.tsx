"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { studentsData, glassStyles, animationClasses } from "@/config/teacher-constants";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Save
} from "lucide-react";

export default function AttendancePage() {
  const [students, setStudents] = useState<typeof studentsData>(studentsData);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleStatusChange = (studentId: number, status: "Present" | "Absent" | "Late") => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status }
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

  const presentCount = students.filter(s => s.status === "Present").length;
  const absentCount = students.filter(s => s.status === "Absent").length;
  const lateCount = students.filter(s => s.status === "Late").length;
  const attendanceRate = Math.round((presentCount / students.length) * 100);

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
              Attendance 📊
            </h1>
            <p className="text-muted-foreground">
              Mark and track student attendance for your classes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* Date Picker and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Date Picker */}
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
            />
          </CardContent>
        </Card>

        {/* Attendance Stats */}
        <Card className={cn(
          glassStyles.card,
          glassStyles.cardHover,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-foreground">{presentCount}</p>
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
              <div className="p-3 rounded-xl bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-foreground">{absentCount}</p>
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
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-foreground">{attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Attendance Table */}
      <Card className={cn(
        glassStyles.card,
        glassStyles.cardHover,
        "rounded-2xl shadow-glass-sm",
        animationClasses.scaleIn
      )}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Student Attendance - {new Date(selectedDate).toLocaleDateString()}
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
                {students.map((student) => (
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
                          <div className="font-medium text-foreground">{student.name}</div>
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
                        className={cn("text-xs flex items-center gap-1", getStatusColor(student.status))}
                      >
                        {getStatusIcon(student.status)}
                        {student.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleStatusChange(student.id, "Present")}
                        >
                          Present
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleStatusChange(student.id, "Absent")}
                        >
                          Absent
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleStatusChange(student.id, "Late")}
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
        </CardContent>
      </Card>
    </div>
  );
}
