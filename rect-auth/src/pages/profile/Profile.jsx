import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Grid,
  Avatar,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile } from "../../services/AuthService";
import { useState, useEffect } from "react";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(!authUser);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.data.success) {
          const userData = {
            ...response.data.user,
            role: response.data.user?.role || "メンバー",
            avatar: response.data.user?.avatar || null,
          };
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authUser) {
      fetchProfile();
    } else {
      const userWithDefaults = {
        ...authUser,
        role: authUser?.role || "メンバー",
        avatar: authUser?.avatar || null,
      };
      setUser(userWithDefaults);
      setLoading(false);
    }
  }, [authUser]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ユーザープロフィール
      </Typography>

      <Card sx={{ maxWidth: 600, margin: "auto" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              src={user?.avatar || "/img/profile.png"}
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {!user?.avatar && user?.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </Avatar>
            <Typography variant="h5">{user?.name || "ユーザー"}</Typography>
            <Typography color="textSecondary">
              {user?.role || "メンバー"}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="subtitle2"
            sx={{ fontSize: 16, fontWeight: "bold" }}
          >
            名前
          </Typography>
          <Typography variant="body1">{user?.name || "N/A"}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="subtitle2"
            sx={{ fontSize: 16, fontWeight: "bold" }}
          >
            メールアドレス
          </Typography>
          <Typography variant="body1">{user?.email || "N/A"}</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="subtitle2"
            sx={{ fontSize: 16, fontWeight: "bold" }}
          >
            メンバー登録日
          </Typography>
          <Typography variant="body1">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </Typography>

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate("/dashboard/profile/edit")}
            >
              プロフィール編集
            </Button>

            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => navigate("/dashboard/profile/change-password")}
            >
              パスワード変更
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
