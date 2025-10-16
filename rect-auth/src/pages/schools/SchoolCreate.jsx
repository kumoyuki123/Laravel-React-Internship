import React, { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { schoolApi } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";

export default function SchoolCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    teacher_name: "",
    teacher_email: "",
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
      const response = await schoolApi.create(formData);

      if (response.data.success) {
        setSuccess("School created successfully!");
        // Reset form
        setFormData({
          name: "",
          teacher_name: "",
          teacher_email: "",
        });

        // Redirect to school list after 2 seconds
        setTimeout(() => {
          navigate("/dashboard/schoolList");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to create school");
      }
    } catch (error) {
      console.error("School creation error:", error);

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
        setError("Failed to create school. Please try again.");
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
          新しい学校作成
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard/schoolList")}
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
            label="学校名"
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
            label="教師名"
            name="teacher_name"
            value={formData.teacher_name}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.teacher_name}
            helperText={
              fieldErrors.teacher_name
                ? Array.isArray(fieldErrors.teacher_name)
                  ? fieldErrors.teacher_name[0]
                  : fieldErrors.teacher_name
                : ""
            }
          />

          <TextField
            fullWidth
            label="教師メールアドレス"
            name="teacher_email"
            type="email"
            value={formData.teacher_email}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.teacher_email}
            helperText={
              fieldErrors.teacher_email
                ? Array.isArray(fieldErrors.teacher_email)
                  ? fieldErrors.teacher_email[0]
                  : fieldErrors.teacher_email
                : ""
            }
          />

          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#606060",
                minWidth: 100,
              }}
              onClick={() => navigate("/dashboard/schoolList")}
              disabled={loading}
            >
              キャンセル
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? <CircularProgress size={24} /> : "学校作成"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
