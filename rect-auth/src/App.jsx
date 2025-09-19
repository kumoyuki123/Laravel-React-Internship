import "./App.css";
import { Route, Routes, Link, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/Students/StudentList";
import StudentCreate from "./pages/Students/StudentCreate";
import StudentEdit from "./pages/Students/StudentEdit";
import DefaultContent from "./components/DefaultContent";
import SchoolList from "./pages/schools/SchoolList";
import SchoolCreate from "./pages/schools/SchoolCreate";
import SchoolEdit from "./pages/schools/SchoolEdit";
import EmployeeList from "./pages/employees/EmployeeList";
import EmployeeEdit from "./pages/employees/EmployeeEdit";
import AttendenceList from "./pages/attendences/AttendenceList_NEW";
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

// Component to handle logout prevention
const LogoutHandler = () => {
  const { isAuthenticated } = useAuth();
  
  // If user tries to access /logout directly, redirect to dashboard if authenticated, otherwise to login
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <Routes>
          <Route path="/register" element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          } />
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
              <RoleBasedRoute allowedRoles={['superuser']}>
                <UserList />
              </RoleBasedRoute>
            } />
            
            {/* School Management */}
            <Route path="schoolList" element={<SchoolList />} />
            <Route path="schoolCreate" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor']}>
                <SchoolCreate />
              </RoleBasedRoute>
            } />
            <Route path="schoolEdit" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor']}>
                <SchoolEdit />
              </RoleBasedRoute>
            } />
            <Route path="schoolEdit/:id" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor']}>
                <SchoolEdit />
              </RoleBasedRoute>
            } />
            
            {/* Student Management */}
            <Route path="studentList" element={<StudentList />} />
            <Route path="studentCreate" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor', 'leader']}>
                <StudentCreate />
              </RoleBasedRoute>
            } />
            <Route path="studentEdit" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor', 'leader']}>
                <StudentEdit />
              </RoleBasedRoute>
            } />
            <Route path="studentEdit/:id" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor', 'leader']}>
                <StudentEdit />
              </RoleBasedRoute>
            } />
            
            {/* Employee Management */}
            <Route path="employeeList" element={<EmployeeList />} />
            <Route path="employeeEdit" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor']}>
                <EmployeeEdit />
              </RoleBasedRoute>
            } />
            <Route path="employeeEdit/:id" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor']}>
                <EmployeeEdit />
              </RoleBasedRoute>
            } />
            
            {/* Attendance Management */}
            <Route path="attendenceList" element={<AttendenceList />} />
            <Route path="attendenceCreate" element={
              <RoleBasedRoute allowedRoles={['superuser', 'hr_admin', 'supervisor', 'leader']}>
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
                  <h1 className="text-4xl md:text-6xl font-bold text-center text-green-900 font-sans mt-[6%] mb-0">
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
                    className="px-2 text-center py-2 bg-[#5C9B10] text-white rounded-md hover:bg-[#5C9B10]/90 transition w-[111px] text-[14px] font-noto-serif"
                    style={{ backgroundColor: 'rgba(92, 155, 16, 0.82)' }}
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/register"
                    className="px-2 text-center py-2 text-white rounded-md hover:bg-[#FFCE0B]/90 transition w-[111px] text-[14px] font-noto-serif"
                    style={{ backgroundColor: 'rgba(255, 206, 11, 0.82)' }}
                  >
                    サインアップ
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