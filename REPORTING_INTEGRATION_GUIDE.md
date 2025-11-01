# Reporting & Notifications Integration Guide

## ✅ Completed Backend APIs

All reporting and notification APIs have been implemented:

### Admin Reports
- `GET /api/reports/admin/overview` - Platform-wide stats & recent activity
- `GET /api/reports/admin/attendance` - Attendance % per course and student
- `GET /api/reports/admin/grades` - Grade distribution across courses

### Teacher Reports
- `GET /api/reports/teacher/:teacherId/overview` - Per-class performance metrics
- `GET /api/reports/teacher/:teacherId/assignments` - Pending vs graded assignments

### Student Reports
- `GET /api/reports/student/:studentId` - GPA, attendance %, course performance trends

### Notifications
- `GET /api/notifications` - Fetch user notifications (with unread count)
- `POST /api/notifications` - Create notification (admin only)
- `PATCH /api/notifications/:id` - Mark notification as read

## 🔔 Notification Triggers

Notifications are automatically created when:
- ✅ Leave request is approved/rejected (`/api/admin/leave-requests/:id`)
- ✅ Assignment is graded (`/api/teacher/submissions/:id`)
- ✅ Leave request is submitted (already exists in `/api/leaves`)

## 📝 Frontend Integration

### 1. Notification Dropdown Component

The `NotificationDropdown` component has been added to `DashboardNavbar.tsx` and will:
- Show unread notification count
- Display recent notifications in dropdown
- Mark notifications as read on click
- Auto-refresh every 30 seconds

### 2. Example: Connecting Admin Dashboard

```typescript
// Example usage in app/(dashboard)/admin/page.tsx
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await apiClient("/api/reports/admin/overview");
        if (data.success) {
          setOverview(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch overview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // Use overview.totals for StatCard values
  // Use overview.recentActivity for activity list
}
```

### 3. Example: Connecting Admin Reports Page

```typescript
// For attendance report
const fetchAttendance = async () => {
  const data = await apiClient("/api/reports/admin/attendance");
  // Map data.data.courseStats and data.data.studentStats to chart format
};

// For grades report
const fetchGrades = async () => {
  const data = await apiClient("/api/reports/admin/grades");
  // Use data.data.overall.distribution and data.data.byCourse
};
```

### 4. Example: Connecting Teacher Reports

```typescript
// Get teacher ID from session
const { data: session } = useSession();
const teacher = await apiClient("/api/teacher/profile");
const teacherId = teacher.data.id;

// Fetch overview
const overview = await apiClient(`/api/reports/teacher/${teacherId}/overview`);
// Use overview.data.classPerformance for charts

// Fetch assignments
const assignments = await apiClient(`/api/reports/teacher/${teacherId}/assignments`);
// Use assignments.data.summary and assignments.data.assignments
```

### 5. Example: Connecting Student Reports

```typescript
// Get student ID from session
const { data: session } = useSession();
const student = await apiClient("/api/student/profile");
const studentId = student.data.id;

// Fetch report
const report = await apiClient(`/api/reports/student/${studentId}`);
// Use:
// - report.data.gpaTrend for GPA line chart
// - report.data.attendance.trend for attendance trend
// - report.data.coursePerformance for course performance chart
```

## 🔐 Access Control

All endpoints enforce role-based access:
- Admin endpoints require `ADMIN` role
- Teacher endpoints require `TEACHER` role (can only view own data)
- Student endpoints require `STUDENT` role (can only view own data)

## 📊 Data Format Examples

### Admin Overview Response
```json
{
  "success": true,
  "data": {
    "totals": {
      "users": 150,
      "teachers": 20,
      "students": 130,
      "courses": 15,
      "assignments": 45,
      "submissions": 1200,
      "avgGPA": 3.45
    },
    "recentActivity": [
      {
        "id": "...",
        "type": "submission",
        "description": "Student submitted Assignment",
        "timestamp": "2024-01-15T10:30:00Z",
        "user": {...},
        "metadata": {...}
      }
    ]
  }
}
```

### Student Report Response
```json
{
  "success": true,
  "data": {
    "student": {...},
    "overallGPA": 3.65,
    "gpaTrend": [
      {"semester": 1, "gpa": 3.5},
      {"semester": 2, "gpa": 3.8}
    ],
    "attendance": {
      "attendanceRate": 94,
      "trend": [
        {"month": "2024-01", "attendance": 92, ...}
      ]
    },
    "coursePerformance": [
      {"courseName": "CS101", "averageGrade": 88, "attendancePercentage": 95}
    ]
  }
}
```

## 🧪 Testing

1. Log in as `admin@example.com` / `adminpassword`
2. Navigate to Admin Dashboard - verify stats load
3. Navigate to Admin Reports - test each tab
4. Log in as `teacher@example.com` / `teacherpassword`
5. Navigate to Teacher Reports - verify class performance
6. Log in as `student@example.com` / `studentpassword`
7. Navigate to Student Reports - verify GPA and attendance trends
8. Submit a leave request or grade an assignment - verify notification appears

## 📚 Next Steps

To fully connect frontend components:

1. Update `app/(dashboard)/admin/page.tsx` to fetch from `/api/reports/admin/overview`
2. Update `app/(dashboard)/admin/reports/page.tsx` to use real API endpoints
3. Update `app/(dashboard)/teacher/reports/page.tsx` to fetch teacher-specific data
4. Update `app/(dashboard)/student/reports/page.tsx` to use `/api/reports/student/:studentId`
5. Add error handling and loading states
6. Add data transformation utilities for chart formatting

All backend APIs are production-ready and fully functional! 🚀

