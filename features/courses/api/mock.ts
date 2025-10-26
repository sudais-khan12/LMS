export interface StudentCourse {
  id: number;
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  thumbnail: string;
  status: "Active" | "Completed";
  category: string;
  startDate: string;
  endDate: string;
  rating: number;
  description: string;
  level?: string;
}

export const mockStudentCourses: StudentCourse[] = [
  {
    id: 1,
    title: "React Fundamentals",
    instructor: "Prof. Sarah Johnson",
    progress: 85,
    totalLessons: 20,
    completedLessons: 17,
    duration: "8 weeks",
    thumbnail: "/course-thumbnails/react.jpg",
    status: "Active",
    category: "Web Development",
    startDate: "2024-01-15",
    endDate: "2024-03-10",
    rating: 4.8,
    description:
      "Learn the basics of React.js including components, state, and props.",
  },
  {
    id: 2,
    title: "JavaScript Advanced",
    instructor: "Prof. Mike Chen",
    progress: 92,
    totalLessons: 15,
    completedLessons: 14,
    duration: "6 weeks",
    thumbnail: "/course-thumbnails/javascript.jpg",
    status: "Active",
    category: "Programming",
    startDate: "2024-02-01",
    endDate: "2024-03-15",
    rating: 4.9,
    description:
      "Master advanced JavaScript concepts including ES6+, async programming, and design patterns.",
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    instructor: "Prof. Emily Davis",
    progress: 78,
    totalLessons: 18,
    completedLessons: 14,
    duration: "10 weeks",
    thumbnail: "/course-thumbnails/nodejs.jpg",
    status: "Active",
    category: "Backend Development",
    startDate: "2024-01-20",
    endDate: "2024-04-01",
    rating: 4.7,
    description:
      "Build scalable backend applications using Node.js and Express.",
  },
  {
    id: 4,
    title: "Database Design & Management",
    instructor: "Prof. David Wilson",
    progress: 100,
    totalLessons: 12,
    completedLessons: 12,
    duration: "6 weeks",
    thumbnail: "/course-thumbnails/database.jpg",
    status: "Completed",
    category: "Database",
    startDate: "2023-11-01",
    endDate: "2023-12-15",
    rating: 4.6,
    description: "Learn database design principles, SQL, and NoSQL databases.",
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    instructor: "Prof. Lisa Anderson",
    progress: 65,
    totalLessons: 16,
    completedLessons: 10,
    duration: "8 weeks",
    thumbnail: "/course-thumbnails/uiux.jpg",
    status: "Active",
    category: "Design",
    startDate: "2024-02-15",
    endDate: "2024-04-10",
    rating: 4.5,
    description:
      "Master user interface and user experience design fundamentals.",
  },
  {
    id: 6,
    title: "Python for Data Science",
    instructor: "Prof. Robert Brown",
    progress: 45,
    totalLessons: 20,
    completedLessons: 9,
    duration: "12 weeks",
    thumbnail: "/course-thumbnails/python.jpg",
    status: "Active",
    category: "Data Science",
    startDate: "2024-03-01",
    endDate: "2024-05-24",
    rating: 4.7,
    description:
      "Analyze data using pandas, numpy, and matplotlib to create visualizations and insights.",
  },
  {
    id: 7,
    title: "Machine Learning Basics",
    instructor: "Prof. Jennifer Lee",
    progress: 30,
    totalLessons: 24,
    completedLessons: 7,
    duration: "14 weeks",
    thumbnail: "/course-thumbnails/ml.jpg",
    status: "Active",
    category: "Data Science",
    startDate: "2024-03-15",
    endDate: "2024-06-28",
    rating: 4.8,
    description:
      "Introduction to machine learning algorithms and their applications.",
  },
  {
    id: 8,
    title: "Mobile App Development",
    instructor: "Prof. Alex Martinez",
    progress: 100,
    totalLessons: 16,
    completedLessons: 16,
    duration: "10 weeks",
    thumbnail: "/course-thumbnails/mobile.jpg",
    status: "Completed",
    category: "Mobile Development",
    startDate: "2023-09-01",
    endDate: "2023-11-10",
    rating: 4.9,
    description: "Build cross-platform mobile applications using React Native.",
  },
];

export const courseCategories = [
  "All",
  "Web Development",
  "Programming",
  "Backend Development",
  "Database",
  "Design",
  "Data Science",
  "Mobile Development",
];

