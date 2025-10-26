export interface AttendanceRecord {
  id: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  course: string;
  time: string;
  instructor: string;
  room: string;
  notes?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  percentage: number;
}

export interface AttendanceTrend {
  month: string;
  attendance: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export const mockAttendanceData: AttendanceRecord[] = [
  {
    id: 1,
    date: "2024-02-15",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
    instructor: "Prof. Sarah Johnson",
    room: "CS-101",
  },
  {
    id: 2,
    date: "2024-02-14",
    status: "present",
    course: "JavaScript Advanced",
    time: "2:00 PM",
    instructor: "Prof. Mike Chen",
    room: "CS-102",
  },
  {
    id: 3,
    date: "2024-02-13",
    status: "late",
    course: "Node.js Backend",
    time: "11:00 AM",
    instructor: "Prof. Emily Davis",
    room: "CS-103",
    notes: "Arrived 15 minutes late due to traffic",
  },
  {
    id: 4,
    date: "2024-02-12",
    status: "present",
    course: "Database Design",
    time: "9:00 AM",
    instructor: "Prof. David Wilson",
    room: "CS-104",
  },
  {
    id: 5,
    date: "2024-02-11",
    status: "absent",
    course: "UI/UX Design",
    time: "3:00 PM",
    instructor: "Prof. Lisa Anderson",
    room: "DES-201",
    notes: "Medical appointment",
  },
  {
    id: 6,
    date: "2024-02-10",
    status: "present",
    course: "Python for Data Science",
    time: "1:00 PM",
    instructor: "Prof. Robert Brown",
    room: "CS-105",
  },
  {
    id: 7,
    date: "2024-02-09",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
    instructor: "Prof. Sarah Johnson",
    room: "CS-101",
  },
  {
    id: 8,
    date: "2024-02-08",
    status: "excused",
    course: "JavaScript Advanced",
    time: "2:00 PM",
    instructor: "Prof. Mike Chen",
    room: "CS-102",
    notes: "Family emergency - approved by instructor",
  },
  {
    id: 9,
    date: "2024-02-07",
    status: "present",
    course: "Node.js Backend",
    time: "11:00 AM",
    instructor: "Prof. Emily Davis",
    room: "CS-103",
  },
  {
    id: 10,
    date: "2024-02-06",
    status: "present",
    course: "Database Design",
    time: "9:00 AM",
    instructor: "Prof. David Wilson",
    room: "CS-104",
  },
  {
    id: 11,
    date: "2024-02-05",
    status: "late",
    course: "UI/UX Design",
    time: "3:00 PM",
    instructor: "Prof. Lisa Anderson",
    room: "DES-201",
    notes: "Public transport delay",
  },
  {
    id: 12,
    date: "2024-02-04",
    status: "present",
    course: "Python for Data Science",
    time: "1:00 PM",
    instructor: "Prof. Robert Brown",
    room: "CS-105",
  },
  {
    id: 13,
    date: "2024-02-03",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
    instructor: "Prof. Sarah Johnson",
    room: "CS-101",
  },
  {
    id: 14,
    date: "2024-02-02",
    status: "absent",
    course: "JavaScript Advanced",
    time: "2:00 PM",
    instructor: "Prof. Mike Chen",
    room: "CS-102",
    notes: "Illness - doctor's note provided",
  },
  {
    id: 15,
    date: "2024-02-01",
    status: "present",
    course: "Node.js Backend",
    time: "11:00 AM",
    instructor: "Prof. Emily Davis",
    room: "CS-103",
  },
  {
    id: 16,
    date: "2024-01-31",
    status: "present",
    course: "Database Design",
    time: "9:00 AM",
    instructor: "Prof. David Wilson",
    room: "CS-104",
  },
  {
    id: 17,
    date: "2024-01-30",
    status: "present",
    course: "UI/UX Design",
    time: "3:00 PM",
    instructor: "Prof. Lisa Anderson",
    room: "DES-201",
  },
  {
    id: 18,
    date: "2024-01-29",
    status: "excused",
    course: "Python for Data Science",
    time: "1:00 PM",
    instructor: "Prof. Robert Brown",
    room: "CS-105",
    notes: "University event participation",
  },
  {
    id: 19,
    date: "2024-01-28",
    status: "present",
    course: "React Fundamentals",
    time: "10:00 AM",
    instructor: "Prof. Sarah Johnson",
    room: "CS-101",
  },
  {
    id: 20,
    date: "2024-01-27",
    status: "present",
    course: "JavaScript Advanced",
    time: "2:00 PM",
    instructor: "Prof. Mike Chen",
    room: "CS-102",
  },
];

export const mockAttendanceTrend: AttendanceTrend[] = [
  { month: "Jan", attendance: 88, present: 18, absent: 2, late: 1, excused: 1 },
  { month: "Feb", attendance: 94, present: 19, absent: 1, late: 1, excused: 1 },
  { month: "Mar", attendance: 91, present: 18, absent: 1, late: 2, excused: 1 },
  { month: "Apr", attendance: 89, present: 17, absent: 2, late: 1, excused: 2 },
  { month: "May", attendance: 95, present: 19, absent: 0, late: 1, excused: 2 },
  { month: "Jun", attendance: 92, present: 18, absent: 1, late: 1, excused: 2 },
];

export const attendanceCourses = [
  "All",
  "React Fundamentals",
  "JavaScript Advanced",
  "Node.js Backend",
  "Database Design",
  "UI/UX Design",
  "Python for Data Science",
];

export const attendanceStatuses = [
  "All",
  "present",
  "absent",
  "late",
  "excused",
];

export const calculateAttendanceSummary = (
  data: AttendanceRecord[]
): AttendanceSummary => {
  const totalDays = data.length;
  const presentDays = data.filter((a) => a.status === "present").length;
  const absentDays = data.filter((a) => a.status === "absent").length;
  const lateDays = data.filter((a) => a.status === "late").length;
  const excusedDays = data.filter((a) => a.status === "excused").length;
  const percentage = Math.round((presentDays / totalDays) * 100);

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    excusedDays,
    percentage,
  };
};

