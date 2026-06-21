import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import useAuthStore from './store/authStore';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import StudentLayout from './components/layout/StudentLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import LandingPage from './pages/auth/LandingPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import StudentsList from './pages/admin/StudentsList';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import AdminProfile from './pages/admin/Profile';
import TeachersList from './pages/admin/TeachersList';
import ClassesList from './pages/admin/ClassesList'; // Import the ClassesList component

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherClasses from './pages/teacher/MyClasses';
import TeacherStudents from './pages/teacher/MyStudents';
import TeacherProfile from './pages/teacher/Profile';
import TeacherAttendanceManagement from './pages/teacher/AttendanceManagement';
import TeacherAttendanceReports from './pages/teacher/AttendanceReports';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import AttendanceHistory from './pages/student/AttendanceHistory';
import StudentProfile from './pages/student/Profile';

// Theme setup
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const { isAuthenticated, role, user } = useAuthStore();

  // Debug the auth state
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, role, user });
  }, [isAuthenticated, role, user]);

  const getHomePage = () => {
    // If not authenticated, show landing page
    if (!isAuthenticated) {
      console.log('Not authenticated, showing landing page');
      return <LandingPage />;
    }
    
    // Debug the role
    console.log('Current role:', role);
    
    // Redirect based on role
    if (role === 'admin') {
      console.log('Redirecting to admin dashboard');
      return <Navigate to="/admin/dashboard" />;
    } else if (role === 'teacher') {
      console.log('Redirecting to teacher dashboard');
      return <Navigate to="/teacher/dashboard" />;
    } else if (role === 'student') {
      console.log('Redirecting to student dashboard');
      return <Navigate to="/student/dashboard" />;
    } else {
      // If role is undefined or invalid, show landing page
      console.log('Invalid role, showing landing page');
      return <LandingPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Redirect to appropriate dashboard */}
          <Route path="/" element={getHomePage()} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="teachers" element={<TeachersList />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="classes" element={<ClassesList />} />
              <Route path="attendance" element={<AttendanceManagement />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route path="dashboard" element={<TeacherDashboard userId={useAuthStore.getState().user?.id} />} />
              <Route path="attendance/mark" element={<TeacherAttendanceManagement />} />
              <Route path="attendance/reports" element={<TeacherAttendanceReports />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="classes" element={<TeacherClasses />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="attendance/history" element={<AttendanceHistory />} />
              <Route path="attendance/stats" element={<AttendanceHistory />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

