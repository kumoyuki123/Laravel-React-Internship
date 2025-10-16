import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { userApi } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";

export default function UserCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "leader",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    try {
      const response = await userApi.create(formData);

      if (response.data.success) {
        setSuccess("User created successfully!");
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "leader",
        });

        // Redirect to user list after 2 seconds
        setTimeout(() => {
          navigate("/dashboard/userList");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("User creation error:", error);

      // Handle Laravel validation errors (422 status)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setError(
          error.response.data.message ||
            "Validation failed. Please check your input."
        );
      } else if (error.response?.data?.message) {
        // Handle other API errors
        setError(error.response.data.message);
      } else {
        // Handle network or other errors
        setError("Failed to create user. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          新しいユーザー作成
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard/userList")}
          disabled={loading}
        >
          戻る
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="名前"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.name}
            helperText={
              fieldErrors.name
                ? Array.isArray(fieldErrors.name)
                  ? fieldErrors.name[0]
                  : fieldErrors.name
                : ""
            }
          />

          <TextField
            fullWidth
            label="メールアドレス"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.email}
            helperText={
              fieldErrors.email
                ? Array.isArray(fieldErrors.email)
                  ? fieldErrors.email[0]
                  : fieldErrors.email
                : ""
            }
          />

          <TextField
            fullWidth
            label="パスワード"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.password}
            helperText={
              fieldErrors.password
                ? Array.isArray(fieldErrors.password)
                  ? fieldErrors.password[0]
                  : fieldErrors.password
                : "Minimum 6 to Maximum 8 characters"
            }
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>役割</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
              error={!!fieldErrors.role}
            >
              <MenuItem value="hr_admin">HR Admin</MenuItem>
              <MenuItem value="supervisor">Supervisor</MenuItem>
              <MenuItem value="leader">Leader</MenuItem>
            </Select>
            {fieldErrors.role && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {Array.isArray(fieldErrors.role)
                  ? fieldErrors.role[0]
                  : fieldErrors.role}
              </Typography>
            )}
          </FormControl>

          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#606060",
                minWidth: 100,
              }}
              onClick={() => navigate("/dashboard/userList")}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 100 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "ユーザー作成"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
