export const studentProfile = {
  name: "Nikhila Manikonda",
  email: "nikhila@gmail.com",
  branch: "CSE",
  college: "KL University",
  avatar: "NM",
}

export const studentStats = {
  totalProjects: 3,
  completed: 1,
  inProgress: 2,
  pendingReview: 1,
}

export const projects = [
  {
    id: 1,
    title: "Student Portfolio System",
    description:
      "A comprehensive web application for students to showcase their academic projects, skills, and achievements in a professional portfolio format.",
    progress: 100,
    status: "Completed",
    tech: ["React", "Tailwind CSS", "Node.js", "MongoDB"],
    student: "Nikhila Manikonda",
    milestones: [
      { name: "Idea Proposal", status: "Completed" },
      { name: "Design Phase", status: "Completed" },
      { name: "Frontend Development", status: "Completed" },
      { name: "Backend Development", status: "Completed" },
      { name: "Testing", status: "Completed" },
      { name: "Deployment", status: "Completed" },
    ],
  },
  {
    id: 2,
    title: "AI Chatbot",
    description:
      "An intelligent chatbot powered by natural language processing that can answer student queries about courses, schedules, and campus facilities.",
    progress: 60,
    status: "In Progress",
    tech: ["Python", "TensorFlow", "Flask", "React"],
    student: "Nikhila Manikonda",
    milestones: [
      { name: "Idea Proposal", status: "Completed" },
      { name: "Design Phase", status: "Completed" },
      { name: "Frontend Development", status: "Completed" },
      { name: "Backend Development", status: "In Progress" },
      { name: "Testing", status: "Pending" },
      { name: "Deployment", status: "Pending" },
    ],
  },
  {
    id: 3,
    title: "E-Learning Platform",
    description:
      "A full-stack e-learning platform with video streaming, quiz management, progress tracking, and interactive discussion forums for students.",
    progress: 35,
    status: "In Progress",
    tech: ["Next.js", "PostgreSQL", "AWS S3", "Tailwind"],
    student: "Nikhila Manikonda",
    milestones: [
      { name: "Idea Proposal", status: "Completed" },
      { name: "Design Phase", status: "Completed" },
      { name: "Frontend Development", status: "In Progress" },
      { name: "Backend Development", status: "Pending" },
      { name: "Testing", status: "Pending" },
      { name: "Deployment", status: "Pending" },
    ],
  },
]

export const feedbackData = [
  {
    id: 1,
    project: "AI Chatbot",
    feedback: "Improve UI and complete backend integration. The NLP model needs more training data for better accuracy.",
    admin: "Dr Sharma",
    date: "2026-02-15",
  },
  {
    id: 2,
    project: "E-Learning Platform",
    feedback: "Good progress on the frontend. Focus on implementing the video streaming module next. Consider using HLS for adaptive bitrate streaming.",
    admin: "Dr Sharma",
    date: "2026-02-10",
  },
  {
    id: 3,
    project: "Student Portfolio System",
    feedback: "Excellent work! The portfolio design is clean and professional. Approved for final submission.",
    admin: "Dr Sharma",
    date: "2026-01-28",
  },
]

export const adminStats = {
  totalStudents: 25,
  totalProjects: 60,
  pendingReviews: 8,
}

export const allStudents = [
  { id: 1, name: "Nikhila Manikonda", email: "nikhila@gmail.com", branch: "CSE", projects: 3, progress: 65 },
  { id: 2, name: "Rahul Verma", email: "rahul.v@gmail.com", branch: "CSE", projects: 2, progress: 80 },
  { id: 3, name: "Priya Singh", email: "priya.s@gmail.com", branch: "IT", projects: 4, progress: 45 },
  { id: 4, name: "Arjun Patel", email: "arjun.p@gmail.com", branch: "ECE", projects: 2, progress: 90 },
  { id: 5, name: "Sneha Reddy", email: "sneha.r@gmail.com", branch: "CSE", projects: 3, progress: 55 },
  { id: 6, name: "Vikram Kumar", email: "vikram.k@gmail.com", branch: "IT", projects: 1, progress: 30 },
  { id: 7, name: "Ananya Joshi", email: "ananya.j@gmail.com", branch: "CSE", projects: 3, progress: 72 },
  { id: 8, name: "Karthik Nair", email: "karthik.n@gmail.com", branch: "ECE", projects: 2, progress: 88 },
]

export const allProjects = [
  { id: 1, student: "Nikhila Manikonda", title: "Student Portfolio System", progress: 100, milestone: 100, status: "Completed" },
  { id: 2, student: "Nikhila Manikonda", title: "AI Chatbot", progress: 60, milestone: 60, status: "In Progress" },
  { id: 3, student: "Nikhila Manikonda", title: "E-Learning Platform", progress: 35, milestone: 33, status: "In Progress" },
  { id: 4, student: "Rahul Verma", title: "Weather App", progress: 80, milestone: 83, status: "In Progress" },
  { id: 5, student: "Rahul Verma", title: "Blog Platform", progress: 100, milestone: 100, status: "Completed" },
  { id: 6, student: "Priya Singh", title: "Task Manager", progress: 45, milestone: 50, status: "In Progress" },
  { id: 7, student: "Priya Singh", title: "Social Media Dashboard", progress: 20, milestone: 17, status: "Pending Review" },
  { id: 8, student: "Arjun Patel", title: "IoT Home Automation", progress: 90, milestone: 83, status: "In Progress" },
  { id: 9, student: "Sneha Reddy", title: "Recipe Finder App", progress: 55, milestone: 50, status: "In Progress" },
  { id: 10, student: "Vikram Kumar", title: "Expense Tracker", progress: 30, milestone: 33, status: "Pending Review" },
]
