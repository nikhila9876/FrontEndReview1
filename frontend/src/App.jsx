import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentLayout from './components/StudentLayout'
import AdminLayout from './components/AdminLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProjects from './pages/student/StudentProjects'
import StudentUpload from './pages/student/StudentUpload'
import StudentMilestones from './pages/student/StudentMilestones'
import StudentPortfolio from './pages/student/StudentPortfolio'
import StudentFeedback from './pages/student/StudentFeedback'
import StudentProfile from './pages/student/StudentProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminProjects from './pages/admin/AdminProjects'
import AdminMilestones from './pages/admin/AdminMilestones'
import AdminFeedback from './pages/admin/AdminFeedback'
import AdminProfile from './pages/admin/AdminProfile'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="projects" element={<StudentProjects />} />
            <Route path="upload" element={<StudentUpload />} />
            <Route path="milestones" element={<StudentMilestones />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="portfolio" element={<StudentPortfolio />} />
            <Route path="feedback" element={<StudentFeedback />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="milestones" element={<AdminMilestones />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
