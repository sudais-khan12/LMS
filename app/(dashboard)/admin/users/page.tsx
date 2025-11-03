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
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  type AdminUser,
} from "@/lib/hooks/api/admin";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import UserForm from "@/components/admin/UserForm";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import {
  TableSkeleton,
  StatsCardSkeleton,
} from "@/components/ui/loading-skeleton";
import type { BaseUser } from "@/types";

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

const getRoleColor = (role: string) => {
  switch (role) {
    case "Teacher":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Student":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Admin":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

type SortField =
  | "name"
  | "email"
  | "role"
  | "status"
  | "joinDate"
  | "lastActive";
type SortDirection = "asc" | "desc";

type UserWithRole = AdminUser & {
  role: "Student" | "Teacher" | "Admin";
  status: "Active" | "Pending" | "Inactive";
  lastActive: string;
  courses: string[];
  phone?: string;
  department?: string;
  joinDate?: string;
  avatar?: string;
};

function mapApiUserToUIUser(user: AdminUser): UserWithRole {
  return {
    ...user,
    role:
      user.role === "STUDENT"
        ? "Student"
        : user.role === "TEACHER"
        ? "Teacher"
        : "Admin",
    status: "Active" as const,
    lastActive: "Recently",
    courses: [],
    phone: user.phone || "",
    department: user.department || "",
    joinDate: new Date().toISOString().split("T")[0],
    avatar: user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase(),
  };
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // API hooks
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const {
    data: usersData,
    isLoading,
    error,
  } = useAdminUsers({
    limit: pageSize,
    skip: currentPage * pageSize,
    role: filterRole !== "All" ? filterRole.toUpperCase() : undefined,
    q: debouncedSearchTerm || undefined,
  });

  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const users = useMemo(() => {
    return usersData?.items.map(mapApiUserToUIUser) || [];
  }, [usersData]);

  // Modal states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

  // Filter users on client side (since API handles search via `q` parameter)
  // Note: Search is handled server-side via the `q` parameter, and role filtering via `role` parameter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesStatus =
        filterStatus === "All" || user.status === filterStatus;
      return matchesStatus;
    });
  }, [users, filterStatus]);

  // Sort users on client side
  const filteredAndSortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];

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
        case "role":
          aValue = a.role;
          bValue = b.role;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "joinDate":
          aValue = new Date(a.joinDate).getTime();
          bValue = new Date(b.joinDate).getTime();
          break;
        case "lastActive":
          aValue = a.lastActive;
          bValue = b.lastActive;
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
    filteredUsers,
    sortField,
    sortDirection,
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil((usersData?.total || 0) / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, usersData?.total || 0);

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

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditingUser(user);
    setIsUserFormOpen(true);
  };

  const handleViewUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleDeleteUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    // Note: This would need an API endpoint for toggling status
    // For now, we'll use updateUser mutation
    toast({
      title: "Info",
      description: "Status toggle requires API endpoint update",
    });
  };

  const handleSaveUser = async (userData: Partial<UserWithRole>) => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          name: userData.name,
          email: userData.email,
          role:
            userData.role === "Student"
              ? "STUDENT"
              : userData.role === "Teacher"
              ? "TEACHER"
              : "ADMIN",
          contact: userData.phone,
        });
      } else {
        if (!userData.name || !userData.email || !userData.role) {
          throw new Error("Name, email, and role are required");
        }
        await createUser.mutateAsync({
          name: userData.name,
          email: userData.email,
          password: "DefaultPassword123!",
          role:
            userData.role === "Student"
              ? "STUDENT"
              : userData.role === "Teacher"
              ? "TEACHER"
              : "ADMIN",
          contact: userData.phone,
        });
      }
      setIsUserFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser.mutateAsync(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      // Error handled by mutation hook
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              User Management 👥
            </h1>
            <p className="text-muted-foreground">
              Manage all platform users, roles, and permissions.
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleAddUser}
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            Add New User
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
                  Total Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {usersData?.total || 0}
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
                  Active Users
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.status === "Active").length}
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
                <UserX className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.status === "Pending").length}
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
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Teachers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.role === "Teacher").length}
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
                  placeholder="Search users by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterRole === "All" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("All")}
              >
                All Roles
              </Button>
              <Button
                variant={filterRole === "Student" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("Student")}
              >
                Students
              </Button>
              <Button
                variant={filterRole === "Teacher" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("Teacher")}
              >
                Teachers
              </Button>
              <Button
                variant={filterRole === "Admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRole("Admin")}
              >
                Admins
              </Button>
            </div>
            <div className="flex gap-2">
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

      {/* Users Table */}
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
            <Users className="h-5 w-5 text-primary" />
            Users ({usersData?.total || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load users. Please try again.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        User
                        {getSortIcon("name")}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center gap-2">
                        Role
                        {getSortIcon("role")}
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
                      Department
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort("joinDate")}
                    >
                      <div className="flex items-center gap-2">
                        Join Date
                        {getSortIcon("joinDate")}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort("lastActive")}
                    >
                      <div className="flex items-center gap-2">
                        Last Active
                        {getSortIcon("lastActive")}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/avatars/${user.name
                                .toLowerCase()
                                .replace(" ", "-")}.jpg`}
                            />
                            <AvatarFallback className="text-sm">
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              {user.name}
                              {user.verified && (
                                <Shield className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={cn("text-sm", getRoleColor(user.role))}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={cn("text-sm", getStatusColor(user.status))}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground">
                        {user.department}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {user.lastActive}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="flex items-center gap-1"
                            disabled={
                              createUser.isPending ||
                              updateUser.isPending ||
                              deleteUser.isPending
                            }
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="flex items-center gap-1"
                            disabled={
                              createUser.isPending ||
                              updateUser.isPending ||
                              deleteUser.isPending
                            }
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(user.id, user.status)
                            }
                            className={cn(
                              "flex items-center gap-1",
                              user.status === "Active"
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            )}
                            disabled={
                              createUser.isPending ||
                              updateUser.isPending ||
                              deleteUser.isPending
                            }
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : user.status === "Active" ? (
                              <UserX className="h-3 w-3" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                            {user.status === "Active" ? "Suspend" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1"
                            disabled={
                              createUser.isPending ||
                              updateUser.isPending ||
                              deleteUser.isPending
                            }
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {usersData && usersData.total > 0 && (
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
                Showing {startIndex + 1} to {endIndex} of {usersData.total} users
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
      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
        isLoading={createUser.isPending || updateUser.isPending}
      />

      <UserDetailsModal
        isOpen={isUserDetailsOpen}
        onClose={() => {
          setIsUserDetailsOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onEdit={(user) => {
          setIsUserDetailsOpen(false);
          setEditingUser(user);
          setIsUserFormOpen(true);
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
