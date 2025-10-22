import { LucideIcon } from "lucide-react";

// Navigation item interface
export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
}

// Statistics card interface
export interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

// Chart data interfaces
export interface ChartDataPoint {
  month: string;
  users: number;
}

export interface CourseEngagementData {
  course: string;
  enrollments: number;
  completions: number;
}

// Activity interface
export interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  icon: LucideIcon;
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: "Student" | "Teacher" | "Admin";
  status: "Active" | "Pending" | "Inactive";
  joinDate: string;
  avatar: string;
}

// Sidebar props interface
export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Navbar props interface
export interface NavbarProps {
  pageTitle: string;
  onMenuClick: () => void;
}

// StatCard props interface
export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

// ChartCard props interface
export interface ChartCardProps {
  title: string;
  data: ChartDataPoint[] | CourseEngagementData[];
  type: "line" | "bar";
}

// DataTable props interface
export interface DataTableProps {
  title: string;
  data: User[];
  columns: string[];
}

// Glassmorphism style interface
export interface GlassStyles {
  sidebar: string;
  navbar: string;
  card: string;
  cardHover: string;
  button: string;
}

// Animation classes interface
export interface AnimationClasses {
  fadeIn: string;
  slideIn: string;
  scaleIn: string;
  hover: string;
}
