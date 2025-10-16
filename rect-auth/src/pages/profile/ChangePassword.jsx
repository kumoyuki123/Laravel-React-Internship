import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { changePassword } from "../../services/AuthService";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({});
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      const response = await changePassword(formData);

      if (response.data.success) {
        setSuccess("パスワードが正常に変更されました");
        setTimeout(() => {
          navigate("/dashboard/profile");
        }, 2000);
      } else {
        // Laravel sometimes sends message only
        setErrors({
          general: response.data.message || "パスワードの変更に失敗しました",
        });
      }
    } catch (error) {
      if (error.response?.status === 422) {
        // Laravel validation errors
        setErrors(error.response.data.errors || {});
      } else {
        setErrors({
          general:
            error.response?.data?.message || "パスワードの変更に失敗しました",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        パスワード変更
      </Typography>

      <Card sx={{ maxWidth: 600, margin: "auto" }}>
        <CardContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="現在のパスワード"
              name="current_password"
              type="password"
              value={formData.current_password}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              error={!!errors.current_password}
              helperText={errors.current_password?.[0]}
            />
            <TextField
              fullWidth
              label="新しいパスワード"
              name="new_password"
              type="password"
              value={formData.new_password}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              error={!!errors.new_password}
              helperText={
                errors.new_password?.[0] || "6文字以上で入力してください"
              }
            />
            <TextField
              fullWidth
              label="新しいパスワード（確認）"
              name="new_password_confirmation"
              type="password"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              error={!!errors.new_password_confirmation}
              helperText={errors.new_password_confirmation?.[0]}
            />
            <Box sx={{ display: "flex", gap: 2, marginTop: 3 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "処理中..." : "パスワード変更"}
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#606060",
                  minWidth: 100,
                }}
                onClick={() => navigate("/dashboard/profile")}
                disabled={loading}
              >
                キャンセル
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;
