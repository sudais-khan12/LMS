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
import {
  glassStyles,
  animationClasses,
} from "@/config/teacher-constants";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Users,
  Clock,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useTeacherClasses,
  useCreateTeacherClass,
  useUpdateTeacherClass,
  useDeleteTeacherClass,
  type TeacherClass,
} from "@/lib/hooks/api/teacher";
import { TableSkeleton, CardSkeleton } from "@/components/ui/loading-skeleton";
import { apiClient } from "@/lib/apiClient";

// Local type for UI display
interface ClassWithDetails {
  id: string;
  subject: string;
  classCode: string;
  description?: string;
  schedule?: string;
  room?: string;
  grade?: string;
  section?: string;
  status: "Active" | "Inactive" | "Completed";
  totalStudents: number;
  students: Array<{ id: string; name: string; studentId: string; email: string }>;
  assignments: Array<{ id: string; title: string; dueDate: string; status: string; submissions: number }>;
}

export default function MyClassesPage() {
  const { toast } = useToast();

  // API hooks
  const {
    data: classesData,
    isLoading,
    error,
    refetch,
  } = useTeacherClasses({ limit: 100 });
  const createClass = useCreateTeacherClass();
  const updateClass = useUpdateTeacherClass();
  const deleteClass = useDeleteTeacherClass();

  const apiClasses = classesData?.items || [];

  // Map API classes to UI format - using _count for totalStudents
  const classes = useMemo(() => {
    return apiClasses.map((cls: any) => ({
      id: cls.id,
      subject: cls.title,
      classCode: cls.code,
      description: cls.description || "",
      schedule: cls.schedule || "",
      room: cls.room || "",
      grade: cls.grade || "",
      section: cls.section || "",
      status: (cls.status || "Active") as "Active" | "Inactive" | "Completed",
      totalStudents: cls._count?.attendance || 0,
      students: [],
      assignments: [],
    }));
  }, [apiClasses]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(
    null
  );
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");

  // Form states for Create/Edit
  const [formData, setFormData] = useState<{
    subject: string;
    classCode: string;
    description: string;
    schedule: string;
    room: string;
    grade: string;
    section: string;
    status: "Active" | "Inactive" | "Completed";
  }>({
    subject: "",
    classCode: "",
    description: "",
    schedule: "",
    room: "",
    grade: "",
    section: "",
    status: "Active",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter classes based on search, grade, and section
  const filteredClasses = useMemo(() => {
    let filtered = classes;

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.classCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (gradeFilter !== "all") {
      filtered = filtered.filter((c) => c.grade === gradeFilter);
    }

    if (sectionFilter !== "all") {
      filtered = filtered.filter((c) => c.section === sectionFilter);
    }

    return filtered;
  }, [searchQuery, gradeFilter, sectionFilter, classes]);

  // Create new class
  const handleCreateClass = async () => {
    if (!formData.subject || !formData.classCode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createClass.mutateAsync({
        title: formData.subject,
        code: formData.classCode,
        description: formData.description,
      });
      setIsCreateModalOpen(false);
      resetForm();
      await refetch();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Edit class
  const handleEditClass = async () => {
    if (!selectedClass || !formData.subject || !formData.classCode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClass.mutateAsync({
        id: selectedClass.id,
        title: formData.subject,
        code: formData.classCode,
        description: formData.description,
      });
      setIsEditModalOpen(false);
      resetForm();
      setSelectedClass(null);
      await refetch();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Delete class
  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      await deleteClass.mutateAsync(selectedClass.id);
      setIsDeleteModalOpen(false);
      setSelectedClass(null);
      await refetch();
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Fetch course details (students and assignments) for view modal
  const fetchCourseDetails = async (courseId: string) => {
    setLoadingCourseDetails(true);
    try {
      // Fetch students for this course
      const studentsResponse = await apiClient<{ success: boolean; data: any }>(
        `/api/courses/${courseId}/students`
      );
      
      // Fetch assignments for this course
      const assignmentsResponse = await apiClient<{ success: boolean; data: any }>(
        `/api/teacher/assignments?courseId=${courseId}&limit=100`
      );

      const students = studentsResponse.success && studentsResponse.data?.students
        ? studentsResponse.data.students.map((s: any, index: number) => ({
            id: s.id || String(index),
            name: s.user?.name || s.name || "Unknown",
            studentId: s.enrollmentNo || s.id || "",
            email: s.user?.email || s.email || "",
          }))
        : [];

      const assignments = assignmentsResponse.success && assignmentsResponse.data?.items
        ? assignmentsResponse.data.items.map((a: any) => ({
            id: a.id,
            title: a.title,
            dueDate: new Date(a.dueDate).toLocaleDateString(),
            status: new Date(a.dueDate) < new Date() ? "Overdue" : "Active",
            submissions: a._count?.submissions || 0,
          }))
        : [];

      if (selectedClass) {
        setSelectedClass({
          ...selectedClass,
          students,
          assignments,
        });
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoadingCourseDetails(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      classCode: "",
      description: "",
      schedule: "",
      room: "",
      grade: "",
      section: "",
      status: "Active",
    });
  };

  const openEditModal = (classItem: ClassWithDetails) => {
    setSelectedClass(classItem);
    setFormData({
      subject: classItem.subject,
      classCode: classItem.classCode,
      description: classItem.description || "",
      schedule: classItem.schedule || "",
      room: classItem.room || "",
      grade: classItem.grade || "",
      section: classItem.section || "",
      status: classItem.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = async (classItem: ClassWithDetails) => {
    setSelectedClass(classItem);
    setIsViewModalOpen(true);
    // Fetch course details when modal opens
    await fetchCourseDetails(classItem.id);
  };

  const openDeleteModal = (classItem: ClassWithDetails) => {
    setSelectedClass(classItem);
    setIsDeleteModalOpen(true);
  };

  // Get unique grades and sections
  const uniqueGrades = [
    ...new Set(classes.map((c) => c.grade).filter(Boolean)),
  ] as string[];
  const uniqueSections = [
    ...new Set(classes.map((c) => c.section).filter(Boolean)),
  ] as string[];

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
              My Classes 📚
            </h1>
            <p className="text-muted-foreground">
              Manage your classes and track student progress.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              withSearchIcon={true}
              placeholder="Search by subject or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {uniqueGrades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {uniqueSections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Card className={cn(glassStyles.card, "rounded-2xl shadow-glass-sm")}>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Failed to load classes
            </h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <Card
              key={classItem.id}
              className={cn(
                glassStyles.card,
                glassStyles.cardHover,
                "rounded-2xl shadow-glass-sm",
                animationClasses.scaleIn
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {classItem.subject}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {classItem.classCode}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getStatusColor(classItem.status))}
                  >
                    {classItem.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Class Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{classItem.totalStudents} students enrolled</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{classItem.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{classItem.room}</span>
                    </div>
                    {classItem.grade && (
                      <div className="text-xs text-muted-foreground">
                        {classItem.grade} - Section {classItem.section}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => openViewModal(classItem)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => openEditModal(classItem)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => openDeleteModal(classItem)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Classes
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {classes.length}
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
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {classes.reduce(
                    (sum, classItem) => sum + classItem.totalStudents,
                    0
                  )}
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
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Classes
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {classes.filter((c) => c.status === "Active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Class Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Enter subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classCode">Class Code *</Label>
              <Input
                id="classCode"
                value={formData.classCode}
                onChange={(e) =>
                  setFormData({ ...formData, classCode: e.target.value })
                }
                placeholder="Enter class code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder="Enter grade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                placeholder="Enter section"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
                placeholder="e.g., Mon, Wed, Fri - 09:00 AM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                placeholder="Enter room"
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
            <Button onClick={handleCreateClass}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update the class information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subject">Subject *</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Enter subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-classCode">Class Code *</Label>
              <Input
                id="edit-classCode"
                value={formData.classCode}
                onChange={(e) =>
                  setFormData({ ...formData, classCode: e.target.value })
                }
                placeholder="Enter class code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-grade">Grade</Label>
              <Input
                id="edit-grade"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder="Enter grade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-section">Section</Label>
              <Input
                id="edit-section"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                placeholder="Enter section"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-schedule">Schedule</Label>
              <Input
                id="edit-schedule"
                value={formData.schedule}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
                placeholder="e.g., Mon, Wed, Fri - 09:00 AM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-room">Room</Label>
              <Input
                id="edit-room"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                placeholder="Enter room"
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
            <Button onClick={handleEditClass}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Class Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClass?.subject} - {selectedClass?.classCode}
            </DialogTitle>
            <DialogDescription>
              {selectedClass?.description || "No description provided"}
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              {/* Class Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Schedule
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedClass.schedule}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Room</Label>
                  <p className="text-sm font-medium">{selectedClass.room}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Grade</Label>
                  <p className="text-sm font-medium">
                    {selectedClass.grade || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Section
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedClass.section || "N/A"}
                  </p>
                </div>
              </div>

              {/* Students Section */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    Students ({selectedClass.students.length})
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Student enrollment is managed by administrators
                  </p>
                </div>
                {loadingCourseDetails ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading students...
                  </div>
                ) : selectedClass.students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students enrolled in this class
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">
                            Name
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Student ID
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClass.students.map((student) => (
                          <tr key={student.id} className="border-t">
                            <td className="p-3 text-sm">{student.name}</td>
                            <td className="p-3 text-sm">{student.studentId}</td>
                            <td className="p-3 text-sm">{student.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Assignments Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Assignments ({selectedClass.assignments.length})
                </h3>
                {loadingCourseDetails ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading assignments...
                  </div>
                ) : selectedClass.assignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No assignments for this class
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">
                            Title
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Due Date
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Status
                          </th>
                          <th className="text-left p-3 text-sm font-medium">
                            Submissions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClass.assignments.map((assignment) => (
                          <tr key={assignment.id} className="border-t">
                            <td className="p-3 text-sm font-medium">
                              {assignment.title}
                            </td>
                            <td className="p-3 text-sm">{assignment.dueDate}</td>
                            <td className="p-3">
                              <Badge variant="outline">{assignment.status}</Badge>
                            </td>
                            <td className="p-3 text-sm">
                              {assignment.submissions}/{selectedClass.totalStudents}
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
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedClass?.subject}? This
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
            <Button variant="destructive" onClick={handleDeleteClass}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
