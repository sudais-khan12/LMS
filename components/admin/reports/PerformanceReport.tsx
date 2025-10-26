"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { PerformanceReportProps, ExportOptions } from "@/types/report";
import ReportFiltersComponent from "@/components/admin/reports/ReportFilters";
import ExportButton from "@/components/admin/reports/ExportButton";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Award,
  Users,
  AlertTriangle,
  GraduationCap,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type SortField = "studentName" | "courseName" | "grade" | "gpa" | "attendance";
type SortDirection = "asc" | "desc";

export default function PerformanceReport({
  data,
  filters,
  onFiltersChange,
  isLoading = false,
}: PerformanceReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [sortField, setSortField] = useState<SortField>("gpa");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filteredStudents = data.belowThresholdStudents;

    // Filter by course if selected
    if (filters.course) {
      filteredStudents = data.belowThresholdStudents.filter(
        (student) => student.courseName === filters.course
      );
    }

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (student) =>
          student.studentName.toLowerCase().includes(searchTerm) ||
          student.courseName.toLowerCase().includes(searchTerm)
      );
    }

    // Sort students
    filteredStudents.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "studentName":
          aValue = a.studentName.toLowerCase();
          bValue = b.studentName.toLowerCase();
          break;
        case "courseName":
          aValue = a.courseName.toLowerCase();
          bValue = b.courseName.toLowerCase();
          break;
        case "grade":
          aValue = a.grade;
          bValue = b.grade;
          break;
        case "gpa":
          aValue = a.gpa;
          bValue = b.gpa;
          break;
        case "attendance":
          aValue = a.attendance;
          bValue = b.attendance;
          break;
        default:
          aValue = a.gpa;
          bValue = b.gpa;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return {
      ...data,
      belowThresholdStudents: filteredStudents,
    };
  }, [data, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const handleExport = (options: ExportOptions) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
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

  // Pie chart colors
  const COLORS = [
    "#10b981", // green
    "#3b82f6", // blue
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
    "#ec4899", // pink
    "#6b7280", // gray
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Student Performance
          </h2>
          <p className="text-muted-foreground">
            Analyze academic performance and identify students at risk
          </p>
        </div>
        <ExportButton onExport={handleExport} isLoading={isExporting} />
      </div>

      {/* Filters */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableCourses={data.courseGrades.map((c) => c.courseName)}
        showCourseFilter={true}
        showTimeRangeFilter={false}
        isLoading={isLoading}
      />

      {/* KPI Cards */}
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
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {data.courseGrades.length}
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
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Pass Rate
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(
                    data.courseGrades.reduce((acc, c) => acc + c.passRate, 0) /
                      data.courseGrades.length
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
              <div className="p-3 rounded-xl bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  At Risk Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredData.belowThresholdStudents.length}
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
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {data.courseGrades.reduce(
                    (acc, c) => acc + c.totalStudents,
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Grades Chart */}
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
              <TrendingUp className="h-5 w-5 text-primary" />
              Average Grades by Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.courseGrades}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(226, 232, 240, 0.3)"
                />
                <XAxis
                  dataKey="courseName"
                  stroke="rgba(100, 116, 139, 0.8)"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="rgba(100, 116, 139, 0.8)"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    borderRadius: "8px",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Bar
                  dataKey="averageGrade"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution Chart */}
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
              <Award className="h-5 w-5 text-primary" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.gradeDistribution.map((item) => ({
                    name: item.grade,
                    count: item.count,
                    percentage: item.percentage,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.gradeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    borderRadius: "8px",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Below Threshold Students Table */}
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
            <AlertTriangle className="h-5 w-5 text-primary" />
            Students Below Performance Threshold
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("studentName")}
                  >
                    <div className="flex items-center gap-2">
                      Student Name
                      {getSortIcon("studentName")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("courseName")}
                  >
                    <div className="flex items-center gap-2">
                      Course
                      {getSortIcon("courseName")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("grade")}
                  >
                    <div className="flex items-center gap-2">
                      Grade
                      {getSortIcon("grade")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("gpa")}
                  >
                    <div className="flex items-center gap-2">
                      GPA
                      {getSortIcon("gpa")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("attendance")}
                  >
                    <div className="flex items-center gap-2">
                      Attendance
                      {getSortIcon("attendance")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.belowThresholdStudents.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">
                        {student.studentName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.studentId}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-sm">
                        {student.courseName}
                      </Badge>
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
                      <div className="text-sm font-medium text-foreground">
                        {student.attendance}%
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
