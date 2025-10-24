export interface StudentProfile {
  id: number;
  name: string;
  email: string;
  studentId: string;
  phone: string;
  avatar: string;
  enrollmentDate: string;
  program: string;
  semester: string;
  gpa: string;
  credits: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  assignmentReminders: boolean;
  gradeUpdates: boolean;
  courseUpdates: boolean;
  attendanceAlerts: boolean;
  systemAnnouncements: boolean;
}

export interface ThemeSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  colorScheme: "blue" | "green" | "purple" | "orange";
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  allowMessages: boolean;
}

export const mockStudentProfile: StudentProfile = {
  id: 1,
  name: "John Doe",
  email: "john.doe@student.com",
  studentId: "STU-2024-001",
  phone: "+1 (555) 123-4567",
  avatar: "/avatars/student.jpg",
  enrollmentDate: "2024-01-15",
  program: "Computer Science",
  semester: "Spring 2024",
  gpa: "3.8",
  credits: "45",
  address: "123 University Ave, Campus City, ST 12345",
  dateOfBirth: "2002-05-15",
  gender: "Male",
  nationality: "American",
  emergencyContact: "Jane Doe",
  emergencyPhone: "+1 (555) 987-6543",
  bloodType: "O+",
  allergies: "None",
  medicalConditions: "None",
};

export const mockNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  assignmentReminders: true,
  gradeUpdates: true,
  courseUpdates: false,
  attendanceAlerts: true,
  systemAnnouncements: true,
};

export const mockThemeSettings: ThemeSettings = {
  theme: "system",
  fontSize: "medium",
  colorScheme: "blue",
};

export const mockPrivacySettings: PrivacySettings = {
  profileVisibility: "friends",
  showEmail: true,
  showPhone: false,
  showAddress: false,
  allowMessages: true,
};

export interface ValidationRule {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export const profileValidationSchema: Record<string, ValidationRule> = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/,
  },
  address: {
    required: false,
    maxLength: 200,
  },
  emergencyContact: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  emergencyPhone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/,
  },
};
