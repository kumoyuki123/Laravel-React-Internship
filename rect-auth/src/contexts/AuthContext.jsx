import React, { createContext, useContext, useState, useEffect } from 'react';
import { register, login, logout } from '../services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set axios defaults
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
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

      if (response.data.success) {
        const { user: newUser, token: authToken } = response.data.data;

        // Add default values for missing fields
        const userWithDefaults = {
          ...newUser,
          role: newUser.role || 'leader', // Default role
          avatar: newUser.avatar || null,   // Default avatar
        };

        setToken(authToken);
        setUser(userWithDefaults);
        localStorage.setItem('user', JSON.stringify(userWithDefaults));
        localStorage.setItem("token", authToken);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || "Login failed",
          fieldErrors: {},
        };
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        return {
          success: false,
          error: "入力内容を確認してください",
          fieldErrors: errorData.errors,
        };
      }

      return {
        success: false,
        error: errorData?.message || "Login failed",
        fieldErrors: {},
      };
    }
  };

  const authRegister = async (userData) => {
    try {
      const response = await register(userData);
      
      if (response.data.success) {
        const { user: newUser, token: authToken } = response.data.data;
        
        // Add default values for missing fields
        const userWithDefaults = {
          ...newUser,
          role: newUser.role || 'leader',
          avatar: newUser.avatar || null,
        };
        
        setUser(userWithDefaults);
        setToken(authToken);
        
        localStorage.setItem('user', JSON.stringify(userWithDefaults));
        localStorage.setItem('token', authToken);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        return {
          success: false,
          error: "入力内容を確認してください",
          fieldErrors: errorData.errors,
        };
      }

      return {
        success: false,
        error: errorData?.message || "Registration failed",
        fieldErrors: {},
      };
    }
  };

  const authLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const updateUser = (userData) => {
    // Ensure required fields are present when updating
    const updatedUser = {
      ...userData,
      role: userData.role || 'leader',
      avatar: userData.avatar || null,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Role-based helper functions
  const hasRole = (role) => {
    return user?.role === role;
  };

  const isSuperuser = () => hasRole('superuser');
  const isHrAdmin = () => hasRole('hr_admin');
  const isSupervisor = () => hasRole('supervisor');
  const isLeader = () => hasRole('leader');

  const canManageUsers = () => isSuperuser();
  const canManageSchools = () => isSuperuser() || isHrAdmin() || isSupervisor();
  const canManageStudents = () => isSuperuser() || isHrAdmin() || isSupervisor() || isLeader();
  const canManageEmployees = () => isSuperuser() || isHrAdmin() || isSupervisor();
  const canManageAttendance = () => isSuperuser() || isHrAdmin() || isSupervisor() || isLeader();

  const value = {
    user,
    token,
    loading,
    login: authLogin,
    register: authRegister,
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
    canManageAttendance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};