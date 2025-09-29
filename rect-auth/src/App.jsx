import { Route, Routes, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/Students/StudentList";
import StudentCreate from "./pages/Students/StudentCreate";
import DefaultContent from "./components/DefaultContent";
import SchoolList from "./pages/schools/SchoolList";
import SchoolCreate from "./pages/schools/SchoolCreate";
import EmployeeList from "./pages/employees/EmployeeList";
import AttendenceList from "./pages/attendences/AttendenceList";
import AttendenceCreate from "./pages/attendences/AttendenceCreate";
import { ThemeContextProvider } from "./contexts/ThemeContext";
import Profile from "./pages/profile/Profile";
import ProfileEdit from "./pages/profile/ProfileEdit";
import ChangePassword from "./pages/profile/ChangePassword";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import GuestRoute from "./components/GuestRoute";
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";

const LogoutHandler = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <Routes>
          <Route path="/login" element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route index element={<DefaultContent />} />
            
            {/* User Management - Superuser only */}
            <Route path="userList" element={
              <RoleBasedRoute>
                <UserList />
              </RoleBasedRoute>
            } />
            <Route path="userCreate" element={
              <RoleBasedRoute allowedRoles={['superuser']}>
                <UserCreate />
              </RoleBasedRoute>
            } />
            
            {/* School Management */}
            <Route path="schoolList" element={<SchoolList />} />
            <Route path="schoolCreate" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin']}>
                <SchoolCreate />
              </RoleBasedRoute>
            } />
            
            {/* Student Management */}
            <Route path="studentList" element={<StudentList />} />
            <Route path="studentCreate" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin']}>
                <StudentCreate />
              </RoleBasedRoute>
            } />

            {/* Employee Management */}
            <Route path="employeeList" element={<EmployeeList />} />
            
            {/* Attendance Management */}
            <Route path="attendenceList" element={<AttendenceList />} />
            <Route path="attendenceCreate" element={
              <RoleBasedRoute allowedRoles={['superuser', 'supervisor', 'leader']}>
                <AttendenceCreate />
              </RoleBasedRoute>
            } />
            
            {/* Profile Management */}
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="profile/change-password" element={<ChangePassword />} />
          </Route>
          
          {/* Prevent direct logout URL access */}
          <Route path="/logout" element={<LogoutHandler />} />
          <Route path="/" element={
              <div className="flex flex-col items-center justify-center min-h-[96vh] space-y-6">
                  <h1 className="text-4xl md:text-6xl font-bold text-center text-green-900 font-sans mt-[5%] mb-0">
                      インターンシップ管理システム
                  </h1>
                <img
                  src="/img/logo2.png"
                  alt="Logo"
                  className="block w-[30%] h-auto max-width[100%] mb-0"
                />
                <nav className="flex justify-center gap-4">
                  <Link
                    to="/login"
                    className="login-button"
                  >
                    ログイン
                  </Link>
                </nav>
              <footer className="text-center py-2 text-sm text-gray-700 mt-5 font-noto-serif">
                Copyright &copy; GIC株式会社.
              </footer>
            </div>
          } />
        </Routes>
      </ThemeContextProvider>
    </AuthProvider>
  );
}

export default App;