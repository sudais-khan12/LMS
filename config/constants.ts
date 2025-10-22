import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  UserCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react";

// Navigation menu items
export const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    active: true,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    active: false,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
    active: false,
  },
  {
    title: "Teachers",
    href: "/admin/teachers",
    icon: GraduationCap,
    active: false,
  },
  {
    title: "Students",
    href: "/admin/students",
    icon: UserCheck,
    active: false,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    active: false,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    active: false,
  },
];

// Statistics data
export const statsData = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Total Courses",
    value: "156",
    change: "+8%",
    changeType: "positive" as const,
    icon: BookOpen,
  },
  {
    title: "Active Teachers",
    value: "89",
    change: "+5%",
    changeType: "positive" as const,
    icon: GraduationCap,
  },
  {
    title: "Active Students",
    value: "1,234",
    change: "+15%",
    changeType: "positive" as const,
    icon: UserCheck,
  },
];

// Chart data for user growth
export const userGrowthData = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 1350 },
  { month: "Mar", users: 1420 },
  { month: "Apr", users: 1580 },
  { month: "May", users: 1720 },
  { month: "Jun", users: 1890 },
  { month: "Jul", users: 2100 },
  { month: "Aug", users: 2250 },
  { month: "Sep", users: 2380 },
  { month: "Oct", users: 2543 },
];

// Chart data for course engagement
export const courseEngagementData = [
  { course: "React Basics", enrollments: 450, completions: 380 },
  { course: "JavaScript Advanced", enrollments: 320, completions: 280 },
  { course: "Node.js Fundamentals", enrollments: 280, completions: 240 },
  { course: "Database Design", enrollments: 200, completions: 180 },
  { course: "UI/UX Design", enrollments: 180, completions: 160 },
];

// Recent activities data
export const recentActivities = [
  {
    id: 1,
    type: "user_registration",
    message: "New user John Doe registered",
    timestamp: "2 minutes ago",
    icon: Users,
  },
  {
    id: 2,
    type: "course_completion",
    message: "Sarah completed React Basics course",
    timestamp: "15 minutes ago",
    icon: BookOpen,
  },
  {
    id: 3,
    type: "teacher_assignment",
    message: "Mike assigned to JavaScript Advanced course",
    timestamp: "1 hour ago",
    icon: GraduationCap,
  },
  {
    id: 4,
    type: "system_update",
    message: "System maintenance completed",
    timestamp: "2 hours ago",
    icon: Settings,
  },
];

// Recent users table data
export const recentUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Student",
    status: "Active",
    joinDate: "2024-01-15",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    role: "Teacher",
    status: "Active",
    joinDate: "2024-01-10",
    avatar: "SW",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "Student",
    status: "Pending",
    joinDate: "2024-01-20",
    avatar: "MJ",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Student",
    status: "Active",
    joinDate: "2024-01-18",
    avatar: "ED",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    role: "Teacher",
    status: "Active",
    joinDate: "2024-01-12",
    avatar: "DB",
  },
];

// Glassmorphism styles
export const glassStyles = {
  sidebar: "bg-sidebar/30 backdrop-blur-md border-r border-sidebar-border",
  navbar: "bg-card/60 backdrop-blur-md border-b border-border",
  card: "bg-card/60 backdrop-blur-sm border border-border/50",
  cardHover: "hover:bg-card/80 hover:backdrop-blur-lg transition-all duration-300",
  button: "bg-glass-medium backdrop-blur-sm border border-border/50 hover:bg-glass-strong",
};

// Animation classes
export const animationClasses = {
  fadeIn: "animate-fade-in",
  slideIn: "animate-slide-in",
  scaleIn: "animate-scale-in",
  hover: "hover:scale-105 transition-transform duration-200",
};