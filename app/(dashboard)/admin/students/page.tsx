"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useQueryClient } from "@tanstack/react-query";
import {
  Student,
  StudentFilters,
  SortState,
} from "@/types/student";
import { useSearchFilter } from "@/lib/hooks/useSearchFilter";
import StudentFiltersComponent from "@/components/admin/StudentFilters";
import StudentTable from "@/components/admin/StudentTable";
import {
  StudentDetailsModal,
  StudentFormModal,
  DeleteConfirmationModal,
} from "@/components/admin/StudentModals";
import BulkActions from "@/components/admin/BulkActions";
import Pagination from "@/components/admin/Pagination";
import {
  UserCheck,
  Award,
  GraduationCap,
  Users,
  UserPlus,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  useAdminStudents,
  useCreateAdminStudent,
  useUpdateAdminStudent,
  useDeleteAdminStudent,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useAdminCourses,
  type AdminStudent,
} from "@/lib/hooks/api/admin";

// Map API student data to UI format
function mapApiStudentToUI(student: AdminStudent): Student & { _apiId: string; _userId: string } {
  const initials = student.user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "S";

  // Map semester to year
  const semesterToYear: Record<number, "Freshman" | "Sophomore" | "Junior" | "Senior"> = {
    1: "Freshman",
    2: "Freshman",
    3: "Sophomore",
    4: "Sophomore",
    5: "Junior",
    6: "Junior",
    7: "Senior",
    8: "Senior",
  };

  return {
    id: parseInt(student.id) || 0, // Keep number for UI compatibility
    name: student.user?.name || "Unknown",
    email: student.user?.email || "",
    phone: "", // Not stored in Student model
    avatar: initials,
    department: student.section || "General",
    year: semesterToYear[student.semester] || "Freshman",
    joinDate: new Date().toISOString().split("T")[0], // Derived from user.createdAt if available
    lastActive: "Recently", // Not stored in DB
    status: "Active" as const, // Derived from user status
    courses: [], // Would need to fetch courses separately
    attendance: student.progress || 0,
    progress: student.progress || 0,
    assignmentsCompleted: 0, // Would need to calculate
    totalAssignments: 0, // Would need to calculate
    grade: "N/A", // Not stored in DB
    gpa: 0, // Would need to fetch from reports
    verified: true, // Assume verified
    studentId: student.enrollmentNo,
    _apiId: student.id, // Store original API ID
    _userId: student.userId, // Store user ID for updates/deletes
  };
}

export default function AdminStudentsPage() {
  const { toast } = useToast();
  const pageSize = 25;

  // Filters and search
  const [filters, setFilters] = useState<StudentFilters>({
    search: "",
    status: "All",
    course: "All",
    attendanceRange: "All",
  });

  // Sorting
  const [sortState, setSortState] = useState<SortState>({
    field: "name",
    direction: "asc",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPageSize, setPageSize] = useState(pageSize);

  // Selection
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // API hooks
  const queryClient = useQueryClient();
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const {
    data: studentsData,
    isLoading,
    error,
    refetch: refetchStudents,
  } = useAdminStudents({
    limit: selectedPageSize,
    skip: currentPage * selectedPageSize,
    q: debouncedSearch || undefined,
    courseId: filters.course !== "All" ? filters.course : undefined,
  });

  const createUser = useCreateAdminUser(); // Use user creation API for students
  const updateUser = useUpdateAdminUser();
  const updateStudent = useUpdateAdminStudent();
  const deleteUser = useDeleteAdminUser(); // Use user deletion API (cascades to student)

  // Fetch courses for the filter dropdown
  const { data: coursesData } = useAdminCourses({ limit: 100 }); // Fetch up to 100 courses for filter

  const students = useMemo(() => {
    if (!studentsData?.items) return [];
    return studentsData.items.map(mapApiStudentToUI);
  }, [studentsData]);

  // Map courses to course objects (id + title) for filter dropdown
  const availableCourses = useMemo(() => {
    if (!coursesData?.items) return [];
    return coursesData.items.map((course) => ({
      id: course.id,
      title: course.title,
    }));
  }, [coursesData]);

  // Modal states
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Filter and sort students (client-side filtering on already fetched data)
  const filteredStudents = useSearchFilter(students, filters, sortState);

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(0);
  }, [filters.search]); // Only reset on search change

  const handleSort = (field: keyof Student) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectStudent = (studentId: number | string) => {
    const id = typeof studentId === 'string' ? parseInt(studentId) || 0 : studentId;
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student.id));
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsStudentFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentFormOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentDetailsOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (
    studentId: number | string,
    currentStatus: string
  ) => {
    try {
      const id = typeof studentId === 'string' ? studentId : studentsData?.items?.find(s => mapApiStudentToUI(s).id === studentId)?.id;
      if (!id) {
        toast({
          title: "Error",
          description: "Student not found",
          variant: "destructive",
        });
        return;
      }

      const actualStudent = studentsData?.items?.find(s => s.id === id);
      if (!actualStudent) {
        toast({
          title: "Error",
          description: "Student not found",
          variant: "destructive",
        });
        return;
      }

      // Update user status via user API
      // Note: This is a simplified status toggle - you might want to add a status field to User model
      // For now, we'll just show a message
      toast({
        title: "Info",
        description: "Status update functionality requires user model status field",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update student status",
        variant: "destructive",
      });
    }
  };

  // Map year to semester (approximate)
  const yearToSemester = (year: "Freshman" | "Sophomore" | "Junior" | "Senior"): number => {
    switch (year) {
      case "Freshman": return 1;
      case "Sophomore": return 3;
      case "Junior": return 5;
      case "Senior": return 7;
      default: return 1;
    }
  };

  const handleSaveStudent = async (studentData: any) => {
    console.log("handleSaveStudent called", { editingStudent, studentData });
    try {
      if (editingStudent) {
        console.log("Editing student", editingStudent);
        // Get API IDs from the mapped student
        const apiId = (editingStudent as any)?._apiId;
        const userId = (editingStudent as any)?._userId;
        console.log("API IDs", { apiId, userId });
        
        if (!apiId || !userId) {
          // Fallback: find from studentsData
          console.log("IDs missing, searching in studentsData");
          const actualStudent = studentsData?.items?.find(s => mapApiStudentToUI(s).id === editingStudent.id);
          console.log("Found student", actualStudent);
          if (!actualStudent) {
            throw new Error("Student not found - IDs missing");
          }

          // Update user info
          await updateUser.mutateAsync({
            id: actualStudent.userId,
            name: studentData.name,
            email: studentData.email,
            password: studentData.password,
          });

          // Update student-specific info
          const semester = studentData.semester ?? (studentData.year ? yearToSemester(studentData.year) : undefined);
          
          const updateData: any = {};
          if (studentData.enrollmentNo) updateData.enrollmentNo = studentData.enrollmentNo;
          if (semester !== undefined) updateData.semester = semester;
          if (studentData.section || studentData.department) updateData.section = studentData.section || studentData.department;
          
          console.log("Updating student with data:", { id: actualStudent.id, ...updateData });
          await updateStudent.mutateAsync({
            id: actualStudent.id,
            ...updateData,
          });
        } else {
          // Update user info
          await updateUser.mutateAsync({
            id: userId,
            name: studentData.name,
            email: studentData.email,
            password: studentData.password,
          });

          // Get current student data for defaults
          const actualStudent = studentsData?.items?.find(s => s.id === apiId);
          if (!actualStudent) {
            throw new Error("Student not found");
          }

          // Update student-specific info
          const semester = studentData.semester ?? (studentData.year ? yearToSemester(studentData.year) : undefined);
          
          const updateData: any = {};
          if (studentData.enrollmentNo) updateData.enrollmentNo = studentData.enrollmentNo;
          if (semester !== undefined) updateData.semester = semester;
          if (studentData.section || studentData.department) updateData.section = studentData.section || studentData.department;
          
          console.log("Updating student with data:", { id: apiId, ...updateData });
          await updateStudent.mutateAsync({
            id: apiId,
            ...updateData,
          });
        }
      } else {
        // Create new student - use user creation API with role STUDENT
        console.log("Creating new student", studentData);
        // Validate password for new students
        if (!studentData.password || studentData.password.length < 6) {
          throw new Error("Password is required and must be at least 6 characters for new students");
        }

        // Calculate semester: use provided value, or calculate from year, or default to 1
        const semester = studentData.semester ?? (studentData.year ? yearToSemester(studentData.year) : 1);
        
        // Ensure we have valid values
        if (!studentData.name || !studentData.email || !studentData.password) {
          throw new Error("Name, email, and password are required");
        }
        
        console.log("Creating user with data", {
          name: studentData.name,
          email: studentData.email,
          role: "STUDENT",
          enrollmentNo: studentData.enrollmentNo || `ENR-${Date.now()}`,
          semester: semester,
          section: studentData.section || studentData.department || "A",
        });
        
        const result = await createUser.mutateAsync({
          name: studentData.name,
          email: studentData.email,
          password: studentData.password,
          role: "STUDENT",
          enrollmentNo: studentData.enrollmentNo || `ENR-${Date.now()}`,
          semester: semester,
          section: studentData.section || studentData.department || "A",
        });
        
        console.log("Create user result:", result);
        console.log("Student created successfully");
      }
      
      // Only close the form on success
      setIsStudentFormOpen(false);
      setEditingStudent(null);
      
      // Refresh the students list after successful operation
      await studentsQuery.refetch();
    } catch (error: any) {
      console.error("Error in handleSaveStudent:", error);
      // The mutation's onError handler will show the toast
      // Re-throw the error so the form knows to stay open
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) {
      console.log("No selected student");
      return;
    }

    console.log("Deleting student", selectedStudent);
    try {
      // Get user ID from the mapped student
      const userId = (selectedStudent as any)?._userId;
      console.log("User ID from mapped student", userId);
      
      if (!userId) {
        // Fallback: find from studentsData
        console.log("UserId missing, searching in studentsData");
        const actualStudent = studentsData?.items?.find(s => mapApiStudentToUI(s).id === selectedStudent.id);
        console.log("Found student for delete", actualStudent);
        if (!actualStudent) {
          toast({
            title: "Error",
            description: "Student not found",
            variant: "destructive",
          });
          return;
        }
        
        // Delete via user API (cascades to student)
        console.log("Deleting user with ID", actualStudent.userId);
        await deleteUser.mutateAsync(actualStudent.userId);
      } else {
        // Delete via user API (cascades to student)
        console.log("Deleting user with ID", userId);
        await deleteUser.mutateAsync(userId);
      }
      
      // Close modal first
      console.log("Student deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      
      // Invalidate and refetch all student queries
      await queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      
      // Explicitly refetch the current query
      await refetchStudents();
    } catch (error: any) {
      console.error("Error in handleConfirmDelete:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  const handleBulkActivate = async (studentIds: number[]) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          studentIds.includes(student.id)
            ? { ...student, status: "Active" as const, lastActive: "Just now" }
            : student
        )
      );

      toast({
        title: "Students activated",
        description: `${studentIds.length} students have been activated.`,
      });

      setSelectedStudents([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeactivate = async (studentIds: number[]) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          studentIds.includes(student.id)
            ? {
                ...student,
                status: "Inactive" as const,
                lastActive: "Just now",
              }
            : student
        )
      );

      toast({
        title: "Students deactivated",
        description: `${studentIds.length} students have been deactivated.`,
      });

      setSelectedStudents([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async (studentIds: number[]) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStudents((prevStudents) =>
        prevStudents.filter((student) => !studentIds.includes(student.id))
      );

      toast({
        title: "Students deleted",
        description: `${studentIds.length} students have been removed from the system.`,
      });

      setSelectedStudents([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // handlePageChange and handlePageSizeChange removed - using direct state updates

  // Statistics
  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.status === "Active").length;
    const atRiskStudents = students.filter(
      (s) => s.status === "At Risk"
    ).length;
    const topPerformers = students.filter((s) =>
      s.grade.startsWith("A")
    ).length;
    const avgGPA = students.length > 0
      ? (students.reduce((acc, s) => acc + s.gpa, 0) / students.length).toFixed(1)
      : "0.0";

    return {
      total: studentsData?.total || 0,
      active: activeStudents,
      atRisk: atRiskStudents,
      topPerformers,
      avgGPA,
    };
  }, [students, studentsData]);

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
              Student Management 🎓
            </h1>
            <p className="text-muted-foreground">
              Manage student records, academic performance, and enrollment
              status.
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleAddStudent}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Add New Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Students
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.active}
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
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top Performers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.topPerformers}
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
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average GPA
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgGPA}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <StudentFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        availableCourses={availableCourses}
        isLoading={isLoading}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedStudents={selectedStudents}
        students={students}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading}
      />

      {/* Students Table */}
      <StudentTable
        students={filteredStudents}
        sortState={sortState}
        onSort={handleSort}
        onView={handleViewStudent}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
        onToggleStatus={handleToggleStatus}
        selectedStudents={selectedStudents}
        onSelectStudent={handleSelectStudent}
        onSelectAll={handleSelectAll}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {studentsData && studentsData.total > 0 && (
        <Card
          className={cn(
            glassStyles.card,
            "rounded-2xl shadow-glass-sm",
            animationClasses.scaleIn
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {currentPage * selectedPageSize + 1} to {Math.min((currentPage + 1) * selectedPageSize, studentsData.total)} of {studentsData.total} students
                {Math.ceil(studentsData.total / selectedPageSize) > 1 && ` (Page ${currentPage + 1} of ${Math.ceil(studentsData.total / selectedPageSize)})`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || isLoading}
                  className="flex items-center gap-1"
                >
                  <ArrowUp className="h-4 w-4 rotate-[-90deg]" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage + 1} of {Math.ceil(studentsData.total / selectedPageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(Math.ceil(studentsData.total / selectedPageSize) - 1, currentPage + 1))}
                  disabled={(currentPage + 1) * selectedPageSize >= (studentsData.total || 0) || isLoading}
                  className="flex items-center gap-1"
                >
                  Next
                  <ArrowDown className="h-4 w-4 rotate-[-90deg]" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        onSave={handleSaveStudent}
        isLoading={isLoading}
      />

      <StudentDetailsModal
        isOpen={isStudentDetailsOpen}
        onClose={() => {
          setIsStudentDetailsOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onEdit={(student) => {
          setIsStudentDetailsOpen(false);
          setEditingStudent(student);
          setIsStudentFormOpen(true);
        }}
      />

        <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleConfirmDelete}
        student={selectedStudent}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
