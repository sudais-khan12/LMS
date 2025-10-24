export interface StudentAssignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: "submitted" | "pending" | "overdue";
  points: number;
  description: string;
  submittedDate?: string;
  grade?: number;
  feedback?: string;
}

export const mockStudentAssignments: StudentAssignment[] = [
  {
    id: 1,
    title: "React Component Library",
    course: "React Fundamentals",
    dueDate: "2024-02-15",
    status: "submitted",
    points: 100,
    description:
      "Create a reusable component library with at least 5 components including Button, Input, Modal, Card, and Dropdown.",
    submittedDate: "2024-02-14",
    grade: 95,
    feedback: "Excellent work! Great component design and implementation.",
  },
  {
    id: 2,
    title: "JavaScript Algorithms",
    course: "JavaScript Advanced",
    dueDate: "2024-02-20",
    status: "pending",
    points: 150,
    description:
      "Implement sorting algorithms (bubble sort, quick sort, merge sort) and analyze their time complexity.",
  },
  {
    id: 3,
    title: "REST API Development",
    course: "Node.js Backend Development",
    dueDate: "2024-02-18",
    status: "overdue",
    points: 200,
    description:
      "Build a complete REST API with authentication, CRUD operations, and data validation using Express.js.",
  },
  {
    id: 4,
    title: "Database Schema Design",
    course: "Database Design & Management",
    dueDate: "2024-02-25",
    status: "pending",
    points: 120,
    description:
      "Design a normalized database schema for an e-commerce platform with proper relationships and constraints.",
  },
  {
    id: 5,
    title: "UI/UX Wireframes",
    course: "UI/UX Design Principles",
    dueDate: "2024-02-22",
    status: "submitted",
    points: 80,
    description:
      "Create wireframes and mockups for a mobile app interface using Figma or similar design tools.",
    submittedDate: "2024-02-21",
    grade: 88,
    feedback:
      "Good wireframes, consider improving user flow in checkout process.",
  },
  {
    id: 6,
    title: "Data Analysis Project",
    course: "Python for Data Science",
    dueDate: "2024-03-01",
    status: "pending",
    points: 180,
    description:
      "Analyze a dataset using pandas, numpy, and matplotlib to create visualizations and insights.",
  },
  {
    id: 7,
    title: "Machine Learning Model",
    course: "Machine Learning Basics",
    dueDate: "2024-03-10",
    status: "pending",
    points: 250,
    description:
      "Build and train a machine learning model using scikit-learn and evaluate its performance.",
  },
  {
    id: 8,
    title: "Mobile App Prototype",
    course: "Mobile App Development",
    dueDate: "2023-11-05",
    status: "submitted",
    points: 150,
    description:
      "Create a working prototype of a mobile application with core functionality.",
    submittedDate: "2023-11-04",
    grade: 92,
    feedback: "Outstanding prototype! Great user experience and functionality.",
  },
  {
    id: 9,
    title: "Advanced React Patterns",
    course: "React Fundamentals",
    dueDate: "2024-03-05",
    status: "pending",
    points: 120,
    description:
      "Implement advanced React patterns including HOCs, render props, and custom hooks.",
  },
  {
    id: 10,
    title: "Async Programming Exercise",
    course: "JavaScript Advanced",
    dueDate: "2024-02-28",
    status: "pending",
    points: 100,
    description:
      "Demonstrate understanding of async/await, Promises, and error handling in JavaScript.",
  },
  {
    id: 11,
    title: "Database Optimization",
    course: "Database Design & Management",
    dueDate: "2023-12-10",
    status: "submitted",
    points: 90,
    description:
      "Optimize database queries and implement proper indexing strategies.",
    submittedDate: "2023-12-09",
    grade: 87,
    feedback:
      "Good optimization techniques, consider more advanced indexing strategies.",
  },
  {
    id: 12,
    title: "Design System Creation",
    course: "UI/UX Design Principles",
    dueDate: "2024-03-15",
    status: "pending",
    points: 140,
    description:
      "Create a comprehensive design system with components, colors, typography, and spacing guidelines.",
  },
];

export const assignmentCourses = [
  "All",
  "React Fundamentals",
  "JavaScript Advanced",
  "Node.js Backend Development",
  "Database Design & Management",
  "UI/UX Design Principles",
  "Python for Data Science",
  "Machine Learning Basics",
  "Mobile App Development",
];

export const assignmentStatuses = ["All", "submitted", "pending", "overdue"];
