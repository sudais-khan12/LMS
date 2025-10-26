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
import type { BaseUser } from "@/types";

// Mock users data
const initialUsersData: BaseUser[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "JD",
    department: "Computer Science",
    joinDate: "2024-01-15",
    status: "Active" as const,
    verified: true,
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "SW",
    department: "Computer Science",
    joinDate: "2024-01-10",
    status: "Active" as const,
    verified: true,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+1 (555) 345-6789",
    avatar: "MJ",
    department: "Mathematics",
    joinDate: "2024-01-20",
    status: "Pending" as const,
    verified: false,
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "ED",
    department: "Computer Science",
    joinDate: "2024-01-18",
    status: "Active" as const,
    verified: true,
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+1 (555) 567-8901",
    avatar: "DB",
    department: "Computer Science",
    joinDate: "2024-01-12",
    status: "Active" as const,
    verified: true,
  },
  {
    id: 6,
    name: "Lisa Garcia",
    email: "lisa.garcia@example.com",
    phone: "+1 (555) 678-9012",
    avatar: "LG",
    department: "Administration",
    joinDate: "2023-12-01",
    status: "Active" as const,
    verified: true,
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

type UserWithRole = Omit<BaseUser, 'status'> & {
  role: "Student" | "Teacher" | "Admin";
  status: "Active" | "Pending" | "Inactive";
  lastActive: string;
  courses: string[];
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>(
    initialUsersData.map((u) => ({
      ...u,
      status: u.status === "Suspended" ? "Inactive" as const : u.status,
      role: "Student" as const,
      lastActive: "2 hours ago",
      courses: [],
    }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Modal states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);

  // Filter and sort users with debounced search
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.department
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        user.phone.includes(debouncedSearchTerm);
      const matchesRole = filterRole === "All" || user.role === filterRole;
      const matchesStatus =
        filterStatus === "All" || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
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

    return filtered;
  }, [
    users,
    debouncedSearchTerm,
    filterRole,
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

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                status:
                  currentStatus === "Active"
                    ? "Inactive"
                    : ("Active" as "Active" | "Inactive"),
                lastActive: "Just now",
              }
            : user
        )
      );

      toast({
        title: "Status updated",
        description: `User status has been ${
          currentStatus === "Active" ? "deactivated" : "activated"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async (userData: Partial<UserWithRole>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingUser) {
        // Update existing user
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === editingUser.id
              ? {
                  ...user,
                  ...userData,
                  lastActive: "Just now",
                }
              : user
          )
        );
      } else {
        // Add new user
        const newUser: UserWithRole = {
          id: Math.max(...users.map((u) => u.id)) + 1,
          name: (userData as Partial<UserWithRole>).name || "Unknown User",
          email:
            (userData as Partial<UserWithRole>).email || "unknown@example.com",
          role: (userData as Partial<UserWithRole>).role || "Student",
          status: userData.status || "Pending",
          phone: userData.phone || "",
          department: userData.department || "",
          joinDate: new Date().toISOString().split("T")[0],
          lastActive: "Just now",
          avatar: ((userData as Partial<UserWithRole>).name || "Unknown")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase(),
          courses: [],
          verified: false,
        };
        setUsers((prevUsers) => [...prevUsers, newUser]);
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id)
      );

      toast({
        title: "User deleted",
        description: `${selectedUser.name} has been removed from the system.`,
      });

      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  {users.length}
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
            Users ({filteredAndSortedUsers.length})
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
                          disabled={isLoading}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
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
                            handleToggleStatus(user.id, user.status)
                          }
                          className={cn(
                            "flex items-center gap-1",
                            user.status === "Active"
                              ? "text-red-600 hover:text-red-700"
                              : "text-green-600 hover:text-green-700"
                          )}
                          disabled={isLoading}
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
      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
        isLoading={isLoading}
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
        isLoading={isLoading}
      />
    </div>
  );
}
