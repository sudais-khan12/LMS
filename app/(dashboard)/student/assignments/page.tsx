"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
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
  Trash2,
  Edit,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  useStudentAssignments,
  useSubmitStudentAssignment,
  useUpdateStudentSubmission,
  type StudentAssignment as ApiStudentAssignment,
} from "@/lib/hooks/api/student";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StudentAssignment {
  id: string;
  title: string;
  description?: string;
  course: string;
  courseId: string;
  dueDate: string;
  points: number;
  status: "pending" | "submitted" | "overdue";
  submittedDate?: string;
  grade?: number | null;
  feedback?: string;
  submissionId?: string;
  fileUrl?: string;
}

type SortField = "title" | "course" | "dueDate" | "status" | "points";
type SortDirection = "asc" | "desc";

function mapApiAssignmentToUI(assignment: ApiStudentAssignment): StudentAssignment {
  const submission = assignment.submission;
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  
  let status: "pending" | "submitted" | "overdue" = "pending";
  if (submission) {
    status = "submitted";
  } else if (dueDate < now) {
    status = "overdue";
  }

  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description || "",
    course: assignment.course?.title || assignment.courseId || "Unknown Course",
    courseId: assignment.courseId,
    dueDate: assignment.dueDate,
    points: assignment.points || 0,
    status,
    submittedDate: submission?.submittedAt ? new Date(submission.submittedAt).toISOString().split("T")[0] : undefined,
    grade: submission?.grade ?? undefined,
    submissionId: submission?.id,
    fileUrl: submission?.fileUrl,
  };
}

export default function AssignmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
  const [isAssignmentDetailsModalOpen, setIsAssignmentDetailsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Get courseId from URL if present
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const courseIdParam = urlParams?.get('courseId') || undefined;

  // API hooks
  const {
    data: assignmentsData,
    isLoading,
    error,
    refetch: refetchAssignments,
  } = useStudentAssignments({
    limit: 1000,
    courseId: courseIdParam,
  });

  const submitAssignment = useSubmitStudentAssignment();
  const updateSubmission = useUpdateStudentSubmission();

  const assignments = useMemo(() => {
    return assignmentsData?.items.map(mapApiAssignmentToUI) || [];
  }, [assignmentsData]);

  // Extract unique courses for filter
  const courses = useMemo(() => {
    const uniqueCourses = new Set<string>(["All"]);
    assignments.forEach((assignment) => {
      if (assignment.course) uniqueCourses.add(assignment.course);
    });
    return Array.from(uniqueCourses);
  }, [assignments]);

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    const filtered = assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
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

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAssignments.length / pageSize);
  const paginatedAssignments = useMemo(() => {
    return filteredAndSortedAssignments.slice(
      currentPage * pageSize,
      (currentPage + 1) * pageSize
    );
  }, [filteredAndSortedAssignments, currentPage, pageSize]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, filterStatus, filterCourse]);

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

  const handleSubmitClick = (assignment: StudentAssignment) => {
    setSelectedAssignment(assignment);
    setSelectedFile(null);
    setSubmissionContent("");
    setIsSubmitModalOpen(true);
  };

  const handleEditClick = (assignment: StudentAssignment) => {
    if (!assignment.submissionId) return;
    setSelectedAssignment(assignment);
    setSelectedFile(null);
    setSubmissionContent("");
    setIsEditModalOpen(true);
  };


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      // For file uploads, we'd typically upload to a storage service first
      // For now, we'll use a placeholder URL
      const fileUrl = selectedFile 
        ? `/uploads/${selectedFile.name}` // In production, upload to S3/Cloudinary/etc
        : undefined;

      await submitAssignment.mutateAsync({
        assignmentId: selectedAssignment.id,
        content: submissionContent || undefined,
        fileUrl: fileUrl || `submission-${Date.now()}.txt`,
      });

      setIsSubmitModalOpen(false);
      setSelectedAssignment(null);
      setSelectedFile(null);
      setSubmissionContent("");
      refetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit assignment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubmission = async () => {
    if (!selectedAssignment || !selectedAssignment.submissionId) return;

    try {
      const fileUrl = selectedFile 
        ? `/uploads/${selectedFile.name}` // In production, upload to S3/Cloudinary/etc
        : selectedAssignment.fileUrl;

      await updateSubmission.mutateAsync({
        submissionId: selectedAssignment.submissionId,
        fileUrl: fileUrl || undefined,
        content: submissionContent || undefined,
      });

      setIsEditModalOpen(false);
      setSelectedAssignment(null);
      setSelectedFile(null);
      setSubmissionContent("");
      refetchAssignments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update submission",
        variant: "destructive",
      });
    }
  };


  const handleViewAssignment = (assignment: StudentAssignment) => {
    setSelectedAssignment(assignment);
    setIsAssignmentDetailsModalOpen(true);
  };

  const getStatusBadge = (status: StudentAssignment["status"]) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Submitted
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const submittedCount = assignments.filter((a) => a.status === "submitted").length;
    const pendingCount = assignments.filter((a) => a.status === "pending").length;
    const overdueCount = assignments.filter((a) => a.status === "overdue").length;
    const totalPoints = assignments.reduce((sum, a) => sum + (a.points || 0), 0);
    const earnedPoints = assignments
      .filter((a) => a.status === "submitted" && a.grade !== null && a.grade !== undefined)
      .reduce((sum, a) => sum + ((a.grade || 0) * (a.points || 0)) / 100, 0);

    return {
      total: assignments.length,
      submitted: submittedCount,
      pending: pendingCount,
      overdue: overdueCount,
      totalPoints,
      earnedPoints: Math.round(earnedPoints),
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
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
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
                <p className="text-xl font-bold text-foreground">{stats.total}</p>
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
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCourse} onValueChange={setFilterCourse}>
                <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {error.message || "Failed to load assignments. Please try again later."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignments Table */}
      {!isLoading && !error && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Assignments ({filteredAndSortedAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm || filterStatus !== "All" || filterCourse !== "All"
                          ? "No assignments match your filters."
                          : "You don't have any assignments yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAssignments.map((assignment) => (
                      <TableRow
                        key={assignment.id}
                        className={cn(
                          assignment.status === "overdue" &&
                            "bg-red-50/30 hover:bg-red-50/50"
                        )}
                      >
                        <TableCell className="font-medium">
                          {assignment.title}
                        </TableCell>
                        <TableCell>{assignment.course}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              assignment.status === "overdue" &&
                                "text-red-600 font-medium"
                            )}
                          >
                            {formatDate(assignment.dueDate)}
                          </span>
                        </TableCell>
                        <TableCell>{assignment.points}</TableCell>
                        <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                        <TableCell>
                          {assignment.grade !== null && assignment.grade !== undefined ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {assignment.grade}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAssignment(assignment)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {assignment.status === "submitted" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(assignment)}
                                disabled={!assignment.submissionId}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleSubmitClick(assignment)}
                                disabled={
                                  assignment.status === "overdue" &&
                                  new Date(assignment.dueDate) < new Date()
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Submit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-border/50 mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to{" "}
                  {Math.min(
                    (currentPage + 1) * pageSize,
                    filteredAndSortedAssignments.length
                  )}{" "}
                  of {filteredAndSortedAssignments.length} assignments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum + 1}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                    }
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <Dialog
          open={isAssignmentDetailsModalOpen}
          onOpenChange={setIsAssignmentDetailsModalOpen}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Assignment Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Card className={cn(glassStyles.card, "rounded-xl shadow-glass-sm")}>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground mb-2">
                    {selectedAssignment.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(selectedAssignment.status)}
                    {selectedAssignment.grade !== null &&
                      selectedAssignment.grade !== undefined && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          Grade: {selectedAssignment.grade}%
                        </Badge>
                      )}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    <strong>Course:</strong> {selectedAssignment.course}
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Points:</strong> {selectedAssignment.points}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span
                        className={cn(
                          selectedAssignment.status === "overdue" &&
                            "text-red-600 font-medium"
                        )}
                      >
                        Due: {formatDateTime(selectedAssignment.dueDate)}
                      </span>
                    </div>
                    {selectedAssignment.submittedDate && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          Submitted: {formatDate(selectedAssignment.submittedDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Description:
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedAssignment.description || "No description provided."}
                    </p>
                  </div>
                  {selectedAssignment.fileUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Submitted File:
                      </p>
                      <a
                        href={selectedAssignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {selectedAssignment.fileUrl.split("/").pop()}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex gap-3">
                {selectedAssignment.status === "submitted" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAssignmentDetailsModalOpen(false);
                      handleEditClick(selectedAssignment);
                    }}
                    disabled={!selectedAssignment.submissionId}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Submission
                  </Button>
                )}
                {selectedAssignment.status !== "submitted" && (
                  <Button
                    onClick={() => {
                      setIsAssignmentDetailsModalOpen(false);
                      handleSubmitClick(selectedAssignment);
                    }}
                    disabled={
                      selectedAssignment.status === "overdue" &&
                      new Date(selectedAssignment.dueDate) < new Date()
                    }
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAssignmentDetailsModalOpen(false);
                    setSelectedAssignment(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Submit your assignment: {selectedAssignment.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Upload File (Optional)</Label>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-muted rounded flex items-center justify-between">
                      <span className="text-sm">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepted: PDF, DOC, DOCX, TXT, ZIP, RAR (Max 10MB)
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="content">Submission Content (Optional)</Label>
                <Textarea
                  id="content"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Enter your submission text here..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  setSelectedFile(null);
                  setSubmissionContent("");
                }}
                disabled={submitAssignment.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAssignment}
                disabled={
                  submitAssignment.isPending ||
                  (!selectedFile && !submissionContent)
                }
              >
                {submitAssignment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Submission Modal */}
      {selectedAssignment && selectedAssignment.submissionId && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Submission</DialogTitle>
              <DialogDescription>
                Update your submission for: {selectedAssignment.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-file">Upload New File (Optional)</Label>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    id="edit-file"
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose New File
                  </Button>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-muted rounded flex items-center justify-between">
                      <span className="text-sm">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {selectedAssignment.fileUrl && !selectedFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current file: {selectedAssignment.fileUrl.split("/").pop()}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-content">Submission Content (Optional)</Label>
                <Textarea
                  id="edit-content"
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Update your submission text..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedFile(null);
                  setSubmissionContent("");
                }}
                disabled={updateSubmission.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSubmission}
                disabled={updateSubmission.isPending}
              >
                {updateSubmission.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
