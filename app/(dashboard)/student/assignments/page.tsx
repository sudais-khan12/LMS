"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  FileText,
  Eye,
  Loader2,
} from "lucide-react";
import {
  StudentAssignment,
  mockStudentAssignments,
  assignmentCourses,
  assignmentStatuses,
  AssignmentTable,
  AssignmentDetailsModal,
} from "@/features/assignments";
import {
  useStudentAssignments,
  useSubmitStudentAssignment,
  type StudentAssignment as ApiStudentAssignment,
} from "@/lib/hooks/api/student";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

type SortField = "title" | "course" | "dueDate" | "status" | "points";
type SortDirection = "asc" | "desc";

function mapApiAssignmentToUI(
  assignment: ApiStudentAssignment
): StudentAssignment {
  const submission = assignment.submissions?.[0];
  const status = submission
    ? "submitted"
    : new Date(assignment.dueDate) < new Date()
    ? "overdue"
    : "pending";

  return {
    id: parseInt(assignment.id) || 0,
    title: assignment.title,
    description: assignment.description || "",
    course: assignment.course?.title || assignment.courseId,
    dueDate: assignment.dueDate,
    points: assignment.points || 0,
    status: status as "pending" | "submitted" | "overdue",
    submittedDate: submission
      ? new Date().toISOString().split("T")[0]
      : undefined,
  };
}

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedAssignment, setSelectedAssignment] =
    useState<StudentAssignment | null>(null);
  const [isAssignmentDetailsModalOpen, setIsAssignmentDetailsModalOpen] =
    useState(false);

  // API hooks
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const {
    data: assignmentsData,
    isLoading,
    error,
  } = useStudentAssignments({
    limit: 100,
  });

  const submitAssignment = useSubmitStudentAssignment();

  const assignments = useMemo(() => {
    return assignmentsData?.items.map(mapApiAssignmentToUI) || [];
  }, [assignmentsData]);

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    const filtered = assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || assignment.status === filterStatus;
      const matchesCourse =
        filterCourse === "All" || assignment.course === filterCourse;
      return matchesSearch && matchesStatus && matchesCourse;
    });

    // Sort assignments
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "course":
          aValue = a.course.toLowerCase();
          bValue = b.course.toLowerCase();
          break;
        case "dueDate":
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "points":
          aValue = a.points;
          bValue = b.points;
          break;
        default:
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    assignments,
    searchTerm,
    filterStatus,
    filterCourse,
    sortField,
    sortDirection,
  ]);

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

  const handleMarkAsDone = async (assignmentId: number, file?: File) => {
    try {
      await submitAssignment.mutateAsync({
        assignmentId: String(assignmentId),
        content: "Submitted via web interface",
        fileUrl: file ? URL.createObjectURL(file) : undefined,
      });
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleViewAssignment = (assignment: StudentAssignment) => {
    setSelectedAssignment(assignment);
    setIsAssignmentDetailsModalOpen(true);
  };

  // Statistics
  const stats = useMemo(() => {
    const submittedCount = assignments.filter(
      (a) => a.status === "submitted"
    ).length;
    const pendingCount = assignments.filter(
      (a) => a.status === "pending"
    ).length;
    const overdueCount = assignments.filter(
      (a) => a.status === "overdue"
    ).length;
    const totalPoints = assignments.reduce((sum, a) => sum + a.points, 0);
    const earnedPoints = assignments
      .filter((a) => a.status === "submitted")
      .reduce((sum, a) => sum + a.points, 0);

    return {
      total: assignments.length,
      submitted: submittedCount,
      pending: pendingCount,
      overdue: overdueCount,
      totalPoints,
      earnedPoints,
    };
  }, [assignments]);

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
              {stats.submitted} Submitted
            </Badge>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-700"
            >
              {stats.pending} Pending
            </Badge>
            {stats.overdue > 0 && (
              <Badge variant="destructive">{stats.overdue} Overdue</Badge>
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
                  {stats.total}
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
                  {stats.submitted}
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
                  {stats.pending}
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
                  {stats.earnedPoints}/{stats.totalPoints}
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
                  placeholder="Search assignments by title, course, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {assignmentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All"
                        ? "All Status"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  {assignmentCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sorting Controls */}
      <Card
        className={cn(
          glassStyles.card,
          "rounded-2xl shadow-glass-sm",
          animationClasses.scaleIn
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Sort by:
            </span>
            <div className="flex gap-2">
              <Button
                variant={sortField === "dueDate" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("dueDate")}
                className="flex items-center gap-2"
              >
                Due Date {getSortIcon("dueDate")}
              </Button>
              <Button
                variant={sortField === "title" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("title")}
                className="flex items-center gap-2"
              >
                Title {getSortIcon("title")}
              </Button>
              <Button
                variant={sortField === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("status")}
                className="flex items-center gap-2"
              >
                Status {getSortIcon("status")}
              </Button>
              <Button
                variant={sortField === "points" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("points")}
                className="flex items-center gap-2"
              >
                Points {getSortIcon("points")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
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
                  You have {stats.overdue} overdue assignment
                  {stats.overdue > 1 ? "s" : ""}
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
      <AssignmentTable
        assignments={filteredAndSortedAssignments}
        onMarkAsDone={handleMarkAsDone}
        onViewAssignment={handleViewAssignment}
        isLoading={isLoading}
      />

      {/* Empty State (if no assignments) */}
      {filteredAndSortedAssignments.length === 0 && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No assignments found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "All" || filterCourse !== "All"
                ? "Try adjusting your search or filter criteria."
                : "You don't have any assignments yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment Details Modal */}
      <AssignmentDetailsModal
        isOpen={isAssignmentDetailsModalOpen}
        onClose={() => {
          setIsAssignmentDetailsModalOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onMarkAsDone={handleMarkAsDone}
        isLoading={isLoading}
      />
    </div>
  );
}
