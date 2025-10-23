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

// Teacher interface
interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  specialization: string;
  experience: string;
  joinDate: string;
  lastActive: string;
  status: "Active" | "Pending" | "Inactive" | "Suspended";
  courses: string[];
  studentsCount: number;
  rating: number;
  officeHours: string;
  location: string;
  verified: boolean;
}

// Mock teachers data
const initialTeachersData: Teacher[] = [
  {
    id: 1,
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@lms.com",
    phone: "+1 (555) 123-4567",
    avatar: "SW",
    department: "Computer Science",
    specialization: "Web Development",
    experience: "8 years",
    joinDate: "2020-01-15",
    lastActive: "2 hours ago",
    status: "Active" as const,
    courses: ["React Fundamentals", "JavaScript Advanced"],
    studentsCount: 156,
    rating: 4.9,
    officeHours: "Mon-Fri 10:00 AM - 4:00 PM",
    location: "San Francisco, CA",
    verified: true,
  },
  {
    id: 2,
    name: "Prof. Mike Johnson",
    email: "mike.johnson@lms.com",
    phone: "+1 (555) 234-5678",
    avatar: "MJ",
    department: "Computer Science",
    specialization: "Backend Development",
    experience: "6 years",
    joinDate: "2021-03-20",
    lastActive: "1 hour ago",
    status: "Active" as const,
    courses: ["Node.js Backend", "Database Design"],
    studentsCount: 98,
    rating: 4.8,
    officeHours: "Tue-Thu 2:00 PM - 6:00 PM",
    location: "New York, NY",
    verified: true,
  },
  {
    id: 3,
    name: "Dr. Emily Davis",
    email: "emily.davis@lms.com",
    phone: "+1 (555) 345-6789",
    avatar: "ED",
    department: "Design",
    specialization: "UI/UX Design",
    experience: "5 years",
    joinDate: "2022-06-10",
    lastActive: "30 minutes ago",
    status: "Active" as const,
    courses: ["UI/UX Design Principles"],
    studentsCount: 76,
    rating: 4.7,
    officeHours: "Mon-Wed-Fri 9:00 AM - 1:00 PM",
    location: "Los Angeles, CA",
    verified: true,
  },
  {
    id: 4,
    name: "Prof. David Brown",
    email: "david.brown@lms.com",
    phone: "+1 (555) 456-7890",
    avatar: "DB",
    department: "Computer Science",
    specialization: "Database Systems",
    experience: "10 years",
    joinDate: "2019-08-05",
    lastActive: "1 day ago",
    status: "Active" as const,
    courses: ["Database Design", "SQL Advanced"],
    studentsCount: 134,
    rating: 4.9,
    officeHours: "Mon-Fri 11:00 AM - 3:00 PM",
    location: "Chicago, IL",
    verified: true,
  },
  {
    id: 5,
    name: "Dr. Lisa Garcia",
    email: "lisa.garcia@lms.com",
    phone: "+1 (555) 567-8901",
    avatar: "LG",
    department: "Mathematics",
    specialization: "Data Science",
    experience: "7 years",
    joinDate: "2021-09-15",
    lastActive: "3 hours ago",
    status: "Pending" as const,
    courses: ["Data Analysis", "Machine Learning Basics"],
    studentsCount: 0,
    rating: 0,
    officeHours: "Tue-Thu 1:00 PM - 5:00 PM",
    location: "Boston, MA",
    verified: false,
  },
];

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
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);
  const [isTeacherDetailsOpen, setIsTeacherDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Filter and sort teachers
  const filteredAndSortedTeachers = useMemo(() => {
    const filtered = teachers.filter((teacher) => {
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

    // Sort teachers
    filtered.sort((a, b) => {
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

    return filtered;
  }, [
    teachers,
    searchTerm,
    filterDepartment,
    filterStatus,
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

  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setIsTeacherFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
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
    teacherId: number,
    currentStatus: string
  ) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) =>
          teacher.id === teacherId
            ? {
                ...teacher,
                status:
                  currentStatus === "Active"
                    ? "Inactive"
                    : ("Active" as "Active" | "Inactive"),
                lastActive: "Just now",
              }
            : teacher
        )
      );

      toast({
        title: "Status updated",
        description: `Teacher status has been ${
          currentStatus === "Active" ? "deactivated" : "activated"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update teacher status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTeacher = async (
    teacherData: Partial<Teacher> & { name: string }
  ) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingTeacher) {
        // Update existing teacher
        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) =>
            teacher.id === editingTeacher.id
              ? {
                  ...teacher,
                  ...teacherData,
                  lastActive: "Just now",
                }
              : teacher
          )
        );
      } else {
        // Add new teacher
        const newTeacher: Teacher = {
          id: Math.max(...teachers.map((t) => t.id)) + 1,
          name: teacherData.name,
          email: teacherData.email ?? "",
          phone: teacherData.phone ?? "",
          avatar:
            teacherData.avatar ??
            teacherData.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase(),
          department: teacherData.department ?? "General",
          specialization: teacherData.specialization ?? "",
          experience: teacherData.experience ?? "0 years",
          joinDate: new Date().toISOString().split("T")[0],
          lastActive: "Just now",
          status: (teacherData.status as Teacher["status"]) ?? "Active",
          courses: teacherData.courses ?? [],
          studentsCount: teacherData.studentsCount ?? 0,
          rating: teacherData.rating ?? 0,
          officeHours: teacherData.officeHours ?? "",
          location: teacherData.location ?? "",
          verified: teacherData.verified ?? false,
        };
        setTeachers((prevTeachers) => [...prevTeachers, newTeacher]);
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTeachers((prevTeachers) =>
        prevTeachers.filter((teacher) => teacher.id !== selectedTeacher.id)
      );

      toast({
        title: "Teacher deleted",
        description: `${selectedTeacher.name} has been removed from the system.`,
      });

      setIsDeleteModalOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  {teachers.length}
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
            Teachers ({filteredAndSortedTeachers.length})
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
        isLoading={isLoading}
      />
    </div>
  );
}
