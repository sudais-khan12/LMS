"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { glassStyles, animationClasses } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Users,
  BookOpen,
  Star,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Eye,
  UserCheck,
  UserX,
  Award,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import TeacherForm from "@/components/admin/TeacherForm";
import TeacherDetailsModal from "@/components/admin/TeacherDetailsModal";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import {
  useAdminTeachers,
  useCreateAdminTeacher,
  useUpdateAdminTeacher,
  useDeleteAdminTeacher,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  type AdminTeacher,
} from "@/lib/hooks/api/admin";

// Teacher interface - matches API data mapped to UI
interface Teacher {
  id: string; // Changed to string to match API
  name: string;
  email: string;
  phone: string;
  avatar: string;
  department: string; // Derived/computed
  specialization: string;
  experience: string; // Derived/computed
  joinDate: string;
  lastActive: string; // Derived/computed
  status: "Active" | "Pending" | "Inactive" | "Suspended";
  courses: string[]; // Derived from courses count
  studentsCount: number; // Derived from courses
  rating: number; // Derived/computed
  officeHours: string; // Not in DB
  location: string; // Not in DB
  verified: boolean; // Derived
}

// Map API teacher data to UI format
function mapApiTeacherToUI(teacher: AdminTeacher): Teacher {
  const initials = teacher.user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "T";

  return {
    id: teacher.id,
    name: teacher.user?.name || "Unknown",
    email: teacher.user?.email || "",
    phone: teacher.contact || "",
    avatar: initials,
    department: teacher.specialization?.split(" ")[0] || "General",
    specialization: teacher.specialization || "Not specified",
    experience: "N/A", // Not stored in DB
    joinDate: new Date().toISOString().split("T")[0], // Derived from user.createdAt if available
    lastActive: "Recently", // Not stored in DB
    status: teacher.isActive ? ("Active" as const) : ("Inactive" as const),
    courses: [], // Would need to fetch courses separately
    studentsCount: 0, // Would need to calculate from courses
    rating: 0, // Not stored in DB
    officeHours: "", // Not stored in DB
    location: "", // Not stored in DB
    verified: true, // Assume verified for active teachers
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 border-green-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Inactive":
      return "bg-red-100 text-red-800 border-red-200";
    case "Suspended":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

type SortField =
  | "name"
  | "email"
  | "department"
  | "specialization"
  | "status"
  | "studentsCount"
  | "rating"
  | "experience";
type SortDirection = "asc" | "desc";

export default function AdminTeachersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // API hooks
  const queryClient = useQueryClient();
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const {
    data: teachersData,
    isLoading,
    error,
    refetch: refetchTeachers,
  } = useAdminTeachers({
    limit: pageSize,
    skip: currentPage * pageSize,
    active: filterStatus === "Active" ? true : filterStatus === "Inactive" ? false : undefined,
  });

  const createUser = useCreateAdminUser(); // Use user creation API for teachers
  const updateUser = useUpdateAdminUser();
  const updateTeacher = useUpdateAdminTeacher();
  const deleteUser = useDeleteAdminUser(); // Use user deletion API (cascades to teacher)

  const teachers = useMemo(() => {
    if (!teachersData?.items) return [];
    return teachersData.items.map(mapApiTeacherToUI);
  }, [teachersData]);

  // Modal states
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);
  const [isTeacherDetailsOpen, setIsTeacherDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Filter teachers on client side (since API handles active status filtering)
  // Note: Search would need to be handled server-side if API supports it
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        filterDepartment === "All" || teacher.department === filterDepartment;
      const matchesStatus =
        filterStatus === "All" || teacher.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [teachers, searchTerm, filterDepartment, filterStatus]);

  // Sort teachers on client side
  const filteredAndSortedTeachers = useMemo(() => {
    const sorted = [...filteredTeachers];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "department":
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case "specialization":
          aValue = a.specialization.toLowerCase();
          bValue = b.specialization.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "studentsCount":
          aValue = a.studentsCount;
          bValue = b.studentsCount;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "experience":
          aValue = parseInt(a.experience);
          bValue = parseInt(b.experience);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [
    filteredTeachers,
    sortField,
    sortDirection,
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil((teachersData?.total || 0) / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, teachersData?.total || 0);

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

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setIsTeacherFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    // Convert UI Teacher to form format - the form expects Teacher interface
    setEditingTeacher(teacher);
    setIsTeacherFormOpen(true);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsTeacherDetailsOpen(true);
  };

  const handleDeleteTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (
    teacherId: string,
    currentStatus: string
  ) => {
    try {
      const actualTeacher = teachersData?.items?.find(t => t.id === teacherId);
      if (!actualTeacher) {
        toast({
          title: "Error",
          description: "Teacher not found",
          variant: "destructive",
        });
        return;
      }

      await updateTeacher.mutateAsync({
        id: teacherId,
        isActive: currentStatus === "Active" ? false : true,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update teacher status",
        variant: "destructive",
      });
    }
  };

  const handleSaveTeacher = async (
    teacherData: Partial<Teacher> & { name: string; email: string; password?: string }
  ) => {
    try {
      if (editingTeacher) {
        // Update existing teacher - need to find the actual API teacher data
        const actualTeacher = teachersData?.items?.find(t => t.id === editingTeacher.id);
        if (!actualTeacher) {
          throw new Error("Teacher not found");
        }

        // Update user info
        await updateUser.mutateAsync({
          id: actualTeacher.userId,
          name: teacherData.name,
          email: teacherData.email,
          password: teacherData.password,
        });

        // Update teacher-specific info
        await updateTeacher.mutateAsync({
          id: editingTeacher.id,
          specialization: teacherData.specialization,
          contact: teacherData.phone,
        });
      } else {
        // Create new teacher - use user creation API with role TEACHER
        if (!teacherData.password) {
          throw new Error("Password is required for new teachers");
        }
        
        await createUser.mutateAsync({
          name: teacherData.name,
          email: teacherData.email,
          password: teacherData.password,
          role: "TEACHER",
          specialization: teacherData.specialization,
          contact: teacherData.phone,
        });
        
        // Reset to first page when creating new teacher
        setCurrentPage(0);
      }
      
      // Close the form first
      setIsTeacherFormOpen(false);
      setEditingTeacher(null);
      
      // Invalidate and refetch all teacher queries
      await queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      
      // Explicitly refetch the current query
      await refetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || (editingTeacher ? "Failed to update teacher" : "Failed to create teacher"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    try {
      const actualTeacher = teachersData?.items?.find(t => t.id === selectedTeacher.id);
      if (!actualTeacher) {
        toast({
          title: "Error",
          description: "Teacher not found",
          variant: "destructive",
        });
        return;
      }

      // Delete via user API (cascades to teacher)
      await deleteUser.mutateAsync(actualTeacher.userId);
      
      // Close modal first
      setIsDeleteModalOpen(false);
      setSelectedTeacher(null);
      
      // Invalidate and refetch all teacher queries
      await queryClient.invalidateQueries({ queryKey: ["admin", "teachers"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      
      // Explicitly refetch the current query
      await refetchTeachers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  const departments = [
    "All",
    ...Array.from(new Set(teachers.map((t) => t.department))),
  ];

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
              Teacher Management 👨‍🏫
            </h1>
            <p className="text-muted-foreground">
              Manage teacher accounts, assignments, and performance.
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleAddTeacher}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add New Teacher
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
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Teachers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {teachersData?.total || 0}
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
                  Active Teachers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {teachers.filter((t) => t.status === "Active").length}
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
                  {teachers.reduce((acc, t) => acc + t.studentsCount, 0)}
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
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Rating
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {(
                    teachers
                      .filter((t) => t.rating > 0)
                      .reduce((acc, t) => acc + t.rating, 0) /
                    teachers.filter((t) => t.rating > 0).length
                  ).toFixed(1)}
                </p>
              </div>
            </div>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-border/50 rounded-md bg-background/50 text-sm"
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              <Button
                variant={filterStatus === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("All")}
              >
                All Status
              </Button>
              <Button
                variant={filterStatus === "Active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Active")}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "Pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Pending")}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
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
            <GraduationCap className="h-5 w-5 text-primary" />
            Teachers ({teachersData?.total || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Teacher
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("department")}
                  >
                    <div className="flex items-center gap-2">
                      Department
                      {getSortIcon("department")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("specialization")}
                  >
                    <div className="flex items-center gap-2">
                      Specialization
                      {getSortIcon("specialization")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("experience")}
                  >
                    <div className="flex items-center gap-2">
                      Experience
                      {getSortIcon("experience")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("studentsCount")}
                  >
                    <div className="flex items-center gap-2">
                      Students
                      {getSortIcon("studentsCount")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("rating")}
                  >
                    <div className="flex items-center gap-2">
                      Rating
                      {getSortIcon("rating")}
                    </div>
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/avatars/${teacher.name
                              .toLowerCase()
                              .replace(" ", "-")}.jpg`}
                          />
                          <AvatarFallback className="text-sm">
                            {teacher.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-2">
                            {teacher.name}
                            {teacher.verified && (
                              <Award className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {teacher.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {teacher.phone}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Last active: {teacher.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-sm">
                        {teacher.department}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">
                      {teacher.specialization}
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">
                      {teacher.experience}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {teacher.studentsCount}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {teacher.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-foreground">
                            {teacher.rating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No rating
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-sm",
                          getStatusColor(teacher.status)
                        )}
                      >
                        {teacher.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTeacher(teacher)}
                          className="flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTeacher(teacher)}
                          className="flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(teacher.id, teacher.status)
                          }
                          className={cn(
                            "flex items-center gap-1",
                            teacher.status === "Active"
                              ? "text-red-600 hover:text-red-700"
                              : "text-green-600 hover:text-green-700"
                          )}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : teacher.status === "Active" ? (
                            <UserX className="h-3 w-3" />
                          ) : (
                            <UserCheck className="h-3 w-3" />
                          )}
                          {teacher.status === "Active" ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
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

      {/* Pagination */}
      {teachersData && teachersData.total > 0 && (
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
                Showing {startIndex + 1} to {endIndex} of {teachersData.total} teachers
                {totalPages > 1 && ` (Page ${currentPage + 1} of ${totalPages})`}
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
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
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
      <TeacherForm
        isOpen={isTeacherFormOpen}
        onClose={() => {
          setIsTeacherFormOpen(false);
          setEditingTeacher(null);
        }}
        teacher={editingTeacher}
        onSave={handleSaveTeacher}
        isLoading={isLoading}
      />

      <TeacherDetailsModal
        isOpen={isTeacherDetailsOpen}
        onClose={() => {
          setIsTeacherDetailsOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
        onEdit={(teacher) => {
          setIsTeacherDetailsOpen(false);
          setEditingTeacher(teacher);
          setIsTeacherFormOpen(true);
        }}
      />

        <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTeacher(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Teacher"
        description={`Are you sure you want to delete ${selectedTeacher?.name}? This action cannot be undone.`}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
