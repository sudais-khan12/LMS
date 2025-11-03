/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  glassStyles,
  animationClasses,
} from "@/config/teacher-constants";
import {
  useTeacherAssignments,
  useCreateTeacherAssignment,
  useUpdateTeacherAssignment,
  useDeleteTeacherAssignment,
  useTeacherClasses,
  useTeacherSubmissions,
  useGradeTeacherSubmission,
  type TeacherAssignment,
  type TeacherClass,
  type TeacherSubmission,
} from "@/lib/hooks/api/teacher";
import {
  FileText,
  Calendar,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Paperclip,
  Download,
  Save,
  Send,
  X,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

// Local types for UI display
interface AssignmentWithDetails {
  id: string;
  title: string;
  subject: string;
  classId: string;
  classCode: string;
  description?: string;
  maxPoints: number;
  dueDate: string;
  status: "Assigned" | "Submitted" | "Graded" | "Late";
  creationDate: string;
  totalStudents: number;
  submissions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    status: "Not Submitted" | "Submitted" | "Graded";
    maxPoints: number;
    grade?: number;
    feedback?: string;
    submissionDate?: string;
    attachments: any[];
  }>;
}

export default function AssignmentsPage() {
  const { toast } = useToast();

  // API hooks
  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useTeacherAssignments({ limit: 1000 });
  const { data: coursesData } = useTeacherClasses({ limit: 100 });
  const createAssignment = useCreateTeacherAssignment();
  const updateAssignment = useUpdateTeacherAssignment();
  const deleteAssignment = useDeleteTeacherAssignment();
  const gradeSubmission = useGradeTeacherSubmission();

  const apiAssignments = assignmentsData?.items || [];
  const courses = coursesData?.items || [];

  // Fetch submissions when viewing an assignment
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const { data: submissionsData, refetch: refetchSubmissions } = useTeacherSubmissions(
    selectedAssignmentId || undefined
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<string>("date");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentWithDetails | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<{ id: string; studentName: string; maxPoints: number } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    description: "",
    dueDate: "",
  });

  const [gradeFormData, setGradeFormData] = useState({
    grade: "",
    feedback: "",
  });

  // Map API assignments to UI format
  const assignments = useMemo(() => {
    return apiAssignments.map((assignment: TeacherAssignment) => {
      const dueDate = new Date(assignment.dueDate);
      const isOverdue = dueDate < new Date();
      const hasSubmissions = (assignment._count?.submissions || 0) > 0;
      
      let status: "Assigned" | "Submitted" | "Graded" | "Late" = "Assigned";
      if (isOverdue && !hasSubmissions) status = "Late";
      else if (hasSubmissions) status = "Submitted";
      
      return {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.course?.title || "Unknown",
        classId: assignment.courseId,
        classCode: assignment.course?.code || "",
        description: assignment.description || "",
        maxPoints: 100, // Default max points (not stored in DB)
        dueDate: assignment.dueDate,
        status,
        creationDate: assignment.dueDate, // Use dueDate as creation date estimate
        totalStudents: 0, // Will be fetched from course students
        submissions: [],
      } as AssignmentWithDetails;
    });
  }, [apiAssignments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Graded":
        return "bg-green-100 text-green-800 border-green-200";
      case "Late":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Assigned":
        return <Clock className="h-4 w-4" />;
      case "Submitted":
        return <CheckCircle className="h-4 w-4" />;
      case "Graded":
        return <CheckCircle className="h-4 w-4" />;
      case "Late":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Filter and sort assignments
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (classFilter !== "all") {
      filtered = filtered.filter((a) => a.classId === classFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (dueDateFilter) {
      filtered = filtered.filter((a) => {
        const assignmentDate = new Date(a.dueDate).toISOString().split("T")[0];
        return assignmentDate === dueDateFilter;
      });
    }

    // Sort
    if (sortBy === "date") {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    } else if (sortBy === "created") {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(a.creationDate).getTime() -
          new Date(b.creationDate).getTime()
      );
    }

    return filtered;
  }, [
    searchQuery,
    classFilter,
    statusFilter,
    dueDateFilter,
    sortBy,
    assignments,
  ]);

  // Create assignment
  const handleCreateAssignment = async () => {
    if (!formData.title || !formData.courseId || !formData.dueDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAssignment.mutateAsync({
        title: formData.title,
        courseId: formData.courseId,
        description: formData.description,
        dueDate: formData.dueDate,
      });
      setIsCreateModalOpen(false);
      resetForm();
      await refetchAssignments();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Edit assignment
  const handleEditAssignment = async () => {
    if (!selectedAssignment || !formData.title || !formData.dueDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAssignment.mutateAsync({
        id: selectedAssignment.id,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
      });
      setIsEditModalOpen(false);
      resetForm();
      setSelectedAssignment(null);
      await refetchAssignments();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await deleteAssignment.mutateAsync(selectedAssignment.id);
      setIsDeleteModalOpen(false);
      setSelectedAssignment(null);
      await refetchAssignments();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Update submission status (note: this is handled via API when grading)
  const handleUpdateSubmission = async (
    submissionId: string,
    status: "Not Submitted" | "Submitted" | "Graded"
  ) => {
    // For now, this is mainly used for grading which uses the gradeSubmission hook
    // Status updates happen when grading via the API
    toast({
      title: "Info",
      description: "Please use the Grade button to update submission status",
    });
  };

  // Open grade modal
  const openGradeModal = (submission: { id: string; studentName: string; grade?: number; maxPoints: number }) => {
    setSelectedSubmission(submission);
    setGradeFormData({
      grade: submission.grade?.toString() || "",
      feedback: "", // Feedback not stored in submission model currently
    });
    setIsGradeModalOpen(true);
  };

  // Save grade
  const handleSaveGrade = async () => {
    if (!selectedSubmission || !gradeFormData.grade) {
      toast({
        title: "Validation Error",
        description: "Please enter a grade",
        variant: "destructive",
      });
      return;
    }

    try {
      await gradeSubmission.mutateAsync({
        id: selectedSubmission.id,
        grade: Number(gradeFormData.grade),
        feedback: gradeFormData.feedback,
      });
      setIsGradeModalOpen(false);
      resetGradeForm();
      await refetchSubmissions();
      if (selectedAssignment) {
        // Refresh the assignment to get updated submission count
        await refetchAssignments();
      }
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Bulk mark as submitted (note: this is a UI-only feature, submissions are created by students)
  const handleBulkMarkSubmitted = () => {
    toast({
      title: "Info",
      description: "Students submit their own assignments. This feature is not available.",
    });
  };

  // Open edit modal
  const openEditModal = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      courseId: assignment.classId,
      description: assignment.description,
      dueDate: new Date(assignment.dueDate).toISOString().split("T")[0],
    });
    setIsEditModalOpen(true);
  };

  // Open view modal
  const openViewModal = async (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    setSelectedAssignmentId(assignment.id);
    setIsViewModalOpen(true);
    // Fetch submissions for this assignment
    await refetchSubmissions();
  };

  // Open delete modal
  const openDeleteModal = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      courseId: "",
      description: "",
      dueDate: "",
    });
  };

  const resetGradeForm = () => {
    setGradeFormData({
      grade: "",
      feedback: "",
    });
    setSelectedSubmission(null);
  };

  // Map submissions to UI format
  const mapSubmissionsToUI = (assignmentId: string) => {
    if (!submissionsData || selectedAssignmentId !== assignmentId) return [];
    
    return submissionsData.items.map((sub: TeacherSubmission) => ({
      id: sub.id,
      studentId: sub.studentId,
      studentName: sub.student?.user?.name || "Unknown Student",
      studentEmail: sub.student?.user?.email || "",
      status: sub.grade ? ("Graded" as const) : ("Submitted" as const),
      maxPoints: 100,
      grade: sub.grade,
      feedback: sub.feedback,
      submissionDate: sub.submittedAt ? new Date(sub.submittedAt).toISOString().split("T")[0] : undefined,
      attachments: [],
    }));
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
              Assignments 📝
            </h1>
            <p className="text-muted-foreground">
              Create and manage assignments for your classes.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              withSearchIcon={true}
              placeholder="Search assignments..."
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
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title} - {course.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Graded">Graded</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Due Date</SelectItem>
              <SelectItem value="created">Sort by Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignments Table */}
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
            All Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignmentsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {assignments.length === 0 ? "No assignments created yet" : "No assignments found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Assignment
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Submissions
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {assignment.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {assignment.subject}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs flex items-center gap-1 w-fit",
                          getStatusColor(assignment.status)
                        )}
                      >
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {apiAssignments.find((a) => a.id === assignment.id)?._count?.submissions || 0}
                        </span>
                        <span className="text-muted-foreground">
                          / {assignment.totalStudents || "?"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => openViewModal(assignment)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => openEditModal(assignment)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive"
                          onClick={() => openDeleteModal(assignment)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
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

      {/* Quick Stats */}
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
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Assignments
                </p>
                <p className="text-2xl font-bold text-foreground">
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
                  Graded
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {assignments.filter((a) => a.status === "Graded").length}
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
                  Active
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    assignments.filter(
                      (a) => a.status === "Assigned" || a.status === "Submitted"
                    ).length
                  }
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
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Submissions
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {assignments.reduce(
                    (sum, a) =>
                      sum +
                      a.submissions.filter((s) => s.status !== "Not Submitted")
                        .length,
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Assignment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter title"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) =>
                  setFormData({ ...formData, courseId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem
                      key={course.id}
                      value={course.id}
                    >
                      {course.title} - {course.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAssignment} disabled={createAssignment.isPending}>
              {createAssignment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Modal - Similar structure to Create */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update the assignment information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date *</Label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAssignment} disabled={updateAssignment.isPending}>
              {updateAssignment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-6">
              {/* Assignment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Subject
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedAssignment.subject}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Class</Label>
                  <p className="text-sm font-medium">
                    {selectedAssignment.classCode}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Due Date
                  </Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Max Points
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedAssignment.maxPoints}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    className={cn(getStatusColor(selectedAssignment.status))}
                  >
                    {selectedAssignment.status}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkMarkSubmitted}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All as Submitted
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Grades
                </Button>
              </div>

              {/* Submissions Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Submissions ({mapSubmissionsToUI(selectedAssignment.id).length})
                </h3>
                {!submissionsData && selectedAssignmentId === selectedAssignment.id ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading submissions...
                  </div>
                ) : mapSubmissionsToUI(selectedAssignment.id).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No submissions for this assignment yet
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">
                            Student
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Status
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Submission Date
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Grade
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mapSubmissionsToUI(selectedAssignment.id).map((submission) => (
                          <tr key={submission.id} className="border-t">
                            <td className="p-3">
                              <div>
                                <div className="text-sm font-medium">
                                  {submission.studentName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {submission.studentEmail}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{submission.status}</Badge>
                            </td>
                            <td className="p-3 text-sm">
                              {submission.submissionDate || "N/A"}
                            </td>
                            <td className="p-3 text-sm">
                              {submission.grade !== undefined
                                ? `${submission.grade}/${submission.maxPoints}`
                                : "-"}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                {submission.status !== "Graded" && (
                                  <Button
                                    size="sm"
                                    onClick={() => openGradeModal(submission)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Grade
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAssignment?.title}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAssignment}
              disabled={deleteAssignment.isPending}
            >
              {deleteAssignment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Modal */}
      <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Enter grade and feedback for {selectedSubmission?.studentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grade">
                Grade (out of {selectedSubmission?.maxPoints})
              </Label>
              <Input
                id="grade"
                type="number"
                value={gradeFormData.grade}
                onChange={(e) =>
                  setGradeFormData({ ...gradeFormData, grade: e.target.value })
                }
                placeholder="Enter grade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <textarea
                id="feedback"
                value={gradeFormData.feedback}
                onChange={(e) =>
                  setGradeFormData({
                    ...gradeFormData,
                    feedback: e.target.value,
                  })
                }
                placeholder="Enter feedback"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGradeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveGrade} disabled={gradeSubmission.isPending}>
              {gradeSubmission.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Grade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
