"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { Student, StudentFilters, SortState, StudentFormData } from "@/types/student";
import { mockStudents, availableCourses } from "@/data/mock/adminStudents";
import { useSearchFilter } from "@/lib/hooks/useSearchFilter";
import { usePagination } from "@/lib/hooks/usePagination";
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
} from "lucide-react";

export default function AdminStudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isLoading, setIsLoading] = useState(false);

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selection
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Modal states
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Filter and sort students
  const filteredStudents = useSearchFilter(students, filters, sortState);

  // Paginate filtered students
  const { paginatedItems: paginatedStudents, pagination } = usePagination(
    filteredStudents,
    currentPage,
    pageSize
  );

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters, sortState]);

  const handleSort = (field: keyof Student) => {
    setSortState((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map((student) => student.id));
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

  const handleToggleStatus = async (studentId: number, currentStatus: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId
            ? {
                ...student,
                status:
                  currentStatus === "Active"
                    ? "Inactive"
                    : ("Active" as "Active" | "Inactive"),
                lastActive: "Just now",
              }
            : student
        )
      );

      toast({
        title: "Status updated",
        description: `Student status has been ${
          currentStatus === "Active" ? "deactivated" : "activated"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStudent = async (studentData: StudentFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingStudent) {
        // Update existing student
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === editingStudent.id
              ? {
                  ...student,
                  ...studentData,
                  lastActive: "Just now",
                }
              : student
          )
        );
      } else {
        // Add new student
        const newStudent: Student = {
          id: Math.max(...students.map((s) => s.id)) + 1,
          name: studentData.name,
          email: studentData.email,
          phone: studentData.phone,
          department: studentData.department,
          year: studentData.year,
          status: studentData.status,
          courses: studentData.courses,
          joinDate: new Date().toISOString().split("T")[0],
          lastActive: "Just now",
          avatar: studentData.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          attendance: 100,
          progress: 0,
          assignmentsCompleted: 0,
          totalAssignments: 0,
          grade: "N/A",
          gpa: 0,
          verified: false,
          studentId: `STU${String(Math.max(...students.map((s) => s.id)) + 1).padStart(3, "0")}`,
        };
        setStudents((prevStudents) => [...prevStudents, newStudent]);
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.id !== selectedStudent.id)
      );

      toast({
        title: "Student deleted",
        description: `${selectedStudent.name} has been removed from the system.`,
      });

      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            ? { ...student, status: "Inactive" as const, lastActive: "Just now" }
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedStudents([]);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setSelectedStudents([]);
  };

  // Statistics
  const stats = useMemo(() => {
    const activeStudents = students.filter((s) => s.status === "Active").length;
    const atRiskStudents = students.filter((s) => s.status === "At Risk").length;
    const topPerformers = students.filter((s) => s.grade.startsWith("A")).length;
    const avgGPA = students.reduce((acc, s) => acc + s.gpa, 0) / students.length;

    return {
      total: students.length,
      active: activeStudents,
      atRisk: atRiskStudents,
      topPerformers,
      avgGPA: avgGPA.toFixed(1),
    };
  }, [students]);

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
              Manage student records, academic performance, and enrollment status.
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
        students={paginatedStudents}
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
      {filteredStudents.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
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
        isLoading={isLoading}
      />
    </div>
  );
}