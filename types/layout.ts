import { LucideIcon } from "lucide-react";

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

// Navigation item interface
export interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Dashboard layout user info
export interface DashboardUserInfo {
  name: string;
  email: string;
  avatar?: string;
  fallback: string;
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

