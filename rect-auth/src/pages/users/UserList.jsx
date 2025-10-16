import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  TablePagination,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete, Search, Block } from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import { useAuth } from "../../contexts/AuthContext";
import { userApi } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";

export default function UserList() {
  const { canManageUsers, user: currentUser, isSuperuser } = useAuth();
  const navigate = useNavigate();

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const roles = [
    { value: "hr_admin", label: "HR Admin" },
    { value: "supervisor", label: "Supervisor" },
    { value: "leader", label: "Leader" },
  ];

  const roleColors = {
    superuser: "error",
    hr_admin: "warning",
    supervisor: "info",
    leader: "success",
  };

  const canCreateUser = (targetUser) => {
    return isSuperuser() && targetUser.id !== currentUser?.id;
  };

  const canEditUser = (targetUser) => {
    // Only superuser can edit users, and cannot edit themselves
    return isSuperuser() && targetUser.id !== currentUser?.id;
  };

  const canDeleteUser = (targetUser) => {
    // Only superuser can delete users, and cannot delete themselves
    return isSuperuser() && targetUser.id !== currentUser?.id;
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      if (response.data?.data) {
        setUsers(response.data.data);
      } else {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("ユーザーの取得に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  // Snackbar helpers
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dialog handlers
  const handleOpenDialog = (user) => {
    if (!canEditUser(user)) {
      showSnackbar("このユーザーを編集する権限がありません", "error");
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "" });
    setFormErrors({});
  };

  // Form
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  const handleSubmit = async () => {
    setError("");
    setFormErrors({});

    try {
      if (editingUser) {
        await userApi.update(editingUser.id, formData);
        showSnackbar("ユーザーの更新に成功しました。");
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving user:", error);

      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        showSnackbar("フォームのエラーを修正してください。", "error");
      } else {
        const errorMessage =
          error.response?.data?.message || "ユーザーの保存に失敗しました";
        showSnackbar(errorMessage, "error");
      }
    }
  };

  // Delete
  const handleDeleteClick = (user) => {
    if (!canDeleteUser(user)) {
      showSnackbar("このユーザーを削除する権限がありません", "error");
      return;
    }

    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userApi.delete(userToDelete.id);
      showSnackbar("ユーザーは正常に削除されました。");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error.response?.data?.message || "ユーザーの削除に失敗しました";
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  // Search + pagination
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>ユーザーを読み込み中...</Typography>
      </Box>
    );
  }

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
          ユーザー管理
        </Typography>
        {canManageUsers && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/dashboard/userCreate")}
          >
            ユーザー追加
          </Button>
        )}
      </Box>

      {/* Permission Notice for non-superusers */}
      {!isSuperuser() && (
        <Alert severity="info" sx={{ mb: 2 }}>
          ユーザー管理はスーパーユーザーのみが行えます。表示のみのモードです。
        </Alert>
      )}

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(92,155,16,0.2)" }}>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>名前</strong>
              </TableCell>
              <TableCell>
                <strong>メールアドレス</strong>
              </TableCell>
              <TableCell>
                <strong>ロール</strong>
              </TableCell>
              <TableCell>
                <strong>作成日</strong>
              </TableCell>
              {canManageUsers && (
                <TableCell>
                  <strong>アクション</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageUsers ? 6 : 5} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm
                      ? "検索条件に一致するユーザーは見つかりませんでした。"
                      : "ユーザーが存在しません。"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {user.name}
                      {user.id === currentUser?.id && (
                        <Chip
                          label="自分"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={roleColors[user.role] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  {canManageUsers && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip
                          title={
                            canEditUser(user) ? "ユーザー編集" : "編集不可"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(user)}
                              color={canEditUser(user) ? "primary" : "default"}
                              disabled={!canEditUser(user)}
                            >
                              {canEditUser(user) ? <Edit /> : <Block />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            canDeleteUser(user) ? "ユーザー削除" : "削除不可"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(user)}
                              color={canDeleteUser(user) ? "error" : "default"}
                              disabled={!canDeleteUser(user)}
                            >
                              {canDeleteUser(user) ? <Delete /> : <Block />}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="text-center" sx={{ fontSize: 30 }}>
          ユーザー編集
        </DialogTitle>

        <DialogContent>
          <TextField
            margin="dense"
            fullWidth
            label="名前"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name ? formErrors.name[0] : ""}
          />

          <TextField
            margin="dense"
            fullWidth
            label="メールアドレス"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={!!formErrors.email}
            helperText={formErrors.email ? formErrors.email[0] : ""}
          />

          {formData.role === "superuser" ? (
            <TextField
              margin="dense"
              fullWidth
              label="役割"
              value="スーパー管理者"
              InputProps={{ readOnly: true }}
            />
          ) : (
            <TextField
              margin="dense"
              fullWidth
              select
              label="役割"
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              error={!!formErrors.role}
              helperText={formErrors.role ? formErrors.role[0] : ""}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">役割を選択</option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </TextField>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#606060",
              minWidth: 100,
            }}
            onClick={handleCloseDialog}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            更新する
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>削除の確認</DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <ErrorIcon color="error" sx={{ fontSize: 40 }} />
        </Box>
        <DialogContent className="text-center">
          ユーザー「{userToDelete?.name}」を削除しますか？
          <br />
          この操作は取り消せません。
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, p: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#606060",
              minWidth: 100,
            }}
            onClick={handleDeleteCancel}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ minWidth: 100 }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
