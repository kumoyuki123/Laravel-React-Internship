import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Box, Typography, Paper } from "@mui/material";

const RoleBasedRoute = ({
  children,
  allowedRoles = [],
  requirePermission = null,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Required roles: {allowedRoles.join(", ")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your role: {user?.role}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Check permission-based access
  if (requirePermission && !requirePermission()) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have the required permissions to access this page.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default RoleBasedRoute;
