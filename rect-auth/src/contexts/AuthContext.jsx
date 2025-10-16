import { createContext, useContext, useState, useEffect } from "react";
import {
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../services/AuthService.jsx";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Set axios defaults
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const authLogin = async (email, password) => {
    try {
      const response = await login({ email, password });
      console.log("Login API response:", response.data);

      if (response.data.success) {
        const { user: newUser, token: authToken } = response.data.data;

        const userWithDefaults = {
          ...newUser,
          role: newUser.role || "leader",
          avatar: newUser.avatar || null,
        };

        setToken(authToken);
        setUser(userWithDefaults);
        localStorage.setItem("user", JSON.stringify(userWithDefaults));
        localStorage.setItem("token", authToken);

        return { success: true };
      }

      return {
        success: false,
        error: response.data.message || "ログインに失敗しました",
        fieldErrors: response.data.errors || {},
      };
    } catch (error) {
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: errorData.message || "サーバーエラーが発生しました",
        fieldErrors: errorData.errors || {},
      };
    }
  };
  const authLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  const updateUser = (userData) => {
    // Ensure required fields are present when updating
    const updatedUser = {
      ...userData,
      role: userData.role || "leader",
      avatar: userData.avatar || null,
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Role-based helper functions
  const hasRole = (role) => {
    return user?.role === role;
  };

  const isSuperuser = () => hasRole("superuser");
  const isHrAdmin = () => hasRole("hr_admin");
  const isSupervisor = () => hasRole("supervisor");
  const isLeader = () => hasRole("leader");

  const canManageUsers = () => isSuperuser();
  const canManageSchools = () => isSuperuser() || isHrAdmin();
  const canManageStudents = () => isSuperuser() || isHrAdmin();
  const canManageEmployees = () =>
    isSuperuser() || isSupervisor() || isLeader();
  const canManageAttendance = () =>
    isSuperuser() || isSupervisor() || isLeader();

  const authForgotPassword = async (email) => {
    try {
      const response = await forgotPassword(email);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        return {
          success: false,
          error:
            "パスワードリセットリンクの送信中にエラーが発生しました。もう一度お試しください。",
          fieldErrors: errorData.errors,
        };
      }

      return {
        success: false,
        error: errorData?.message || "Forgot Password failed",
        fieldErrors: {},
      };
    }
  };

  const authResetPassword = async (data) => {
    try {
      const response = await resetPassword(data);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        return {
          success: false,
          error: "Please check your input.",
          fieldErrors: errorData.errors,
        };
      }

      return {
        success: false,
        error:
          errorData?.message ||
          "パスワードのリセット中にエラーが発生しました。もう一度お試しください。",
        fieldErrors: {},
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login: authLogin,
    logout: authLogout,
    updateUser,
    isAuthenticated: !!user && !!token,
    // Role functions
    hasRole,
    isSuperuser,
    isHrAdmin,
    isSupervisor,
    isLeader,
    canManageUsers,
    canManageSchools,
    canManageStudents,
    canManageEmployees,
    canManageAttendance,
    forgotPassword: authForgotPassword,
    resetPassword: authResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
