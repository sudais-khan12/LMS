import { useMemo } from "react";
import { Student, StudentFilters, SortState } from "@/types/student";

export function useSearchFilter(
  students: Student[],
  filters: StudentFilters,
  sortState: SortState
) {
  return useMemo(() => {
    const filtered = students.filter((student) => {
      // Search filter
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.studentId.toLowerCase().includes(searchTerm) ||
        student.department.toLowerCase().includes(searchTerm);

      // Status filter
      const matchesStatus =
        filters.status === "All" || student.status === filters.status;

      // Course filter
      const matchesCourse =
        filters.course === "All" ||
        student.courses.some((course) => course === filters.course);

      // Attendance range filter
      const matchesAttendanceRange = (() => {
        switch (filters.attendanceRange) {
          case "0-50":
            return student.attendance >= 0 && student.attendance <= 50;
          case "51-80":
            return student.attendance >= 51 && student.attendance <= 80;
          case "81-100":
            return student.attendance >= 81 && student.attendance <= 100;
          default:
            return true;
        }
      })();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCourse &&
        matchesAttendanceRange
      );
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortState.field) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "joinDate":
          aValue = new Date(a.joinDate).getTime();
          bValue = new Date(b.joinDate).getTime();
          break;
        case "attendance":
          aValue = a.attendance;
          bValue = b.attendance;
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        case "gpa":
          aValue = a.gpa;
          bValue = b.gpa;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "year":
          aValue = a.year;
          bValue = b.year;
          break;
        case "department":
          aValue = a.department;
          bValue = b.department;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, filters, sortState]);
}
