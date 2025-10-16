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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  CheckCircle,
  Cancel,
  Schedule,
} from "@mui/icons-material";
import ErrorIcon from "@mui/icons-material/Error";
import { useAuth } from "../../contexts/AuthContext";
import { attendanceApi, studentApi } from "../../services/ApiService";
import { useNavigate } from "react-router-dom";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";

export default function AttendenceList() {
  const navigate = useNavigate();
  const { canManageAttendance } = useAuth();

  // State management
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    date: "",
    status: "present",
    check_in_time: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch data
  useEffect(() => {
    fetchAttendances();
    fetchStudents();
  }, []);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getAll();
      if (response.data?.data) {
        setAttendances(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
      showSnackbar("Failed to fetch attendances", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAll();
      if (response.data?.data) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
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
  const handleOpenDialog = (attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      student_id: attendance.student_id || "",
      date: attendance.date || "",
      status: attendance.status || "present",
      check_in_time: attendance.check_in_time || "",
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAttendance(null);
    setFormData({
      student_id: "",
      date: "",
      status: "present",
      check_in_time: "",
    });
    setFormErrors({});
  };

  // Form
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };
  const calculateStatus = (checkInTime, date) => {
    if (!checkInTime) return "absent";
    const [hours, minutes] = checkInTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const lateThreshold = 8 * 60;
    return totalMinutes > lateThreshold ? "late" : "present";
  };
  const handleSubmit = async () => {
    setFormErrors({});
    const calculatedStatus = calculateStatus(
      formData.check_in_time,
      formData.date
    );
    const submitData = {
      ...formData,
      status: calculatedStatus,
    };

    try {
      await attendanceApi.update(editingAttendance.id, submitData);
      showSnackbar("Attendance updated successfully");
      fetchAttendances();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving attendance:", error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        showSnackbar("Please fix the form errors", "error");
      } else {
        const errorMessage =
          error.response?.data?.message || "Failed to save attendance";
        showSnackbar(errorMessage, "error");
      }
    }
  };

  // Delete
  const handleDeleteClick = (attendance) => {
    setAttendanceToDelete(attendance);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await attendanceApi.delete(attendanceToDelete.id);
      showSnackbar("Attendance deleted successfully");
      fetchAttendances();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete attendance";
      showSnackbar(errorMessage, "error");
    } finally {
      setDeleteConfirmOpen(false);
      setAttendanceToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setAttendanceToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter attendances
  const filteredAttendances = attendances.filter((attendance) => {
    const matchesSearch =
      attendance.student?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      attendance.student?.school?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      attendance.date.includes(searchTerm);
    const matchesStatus =
      statusFilter === "" || attendance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedAttendances = filteredAttendances.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      present: "出席",
      absent: "欠席",
      late: "遅刻",
    };
    return statusLabels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle />;
      case "absent":
        return <Cancel />;
      case "late":
        return <Schedule />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>出席情報を読み込み中...</Typography>
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
        <Box display="flex" alignItems="center" gap={2}>
          <EditCalendarIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            出席管理
          </Typography>
        </Box>
        {canManageAttendance() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/dashboard/attendenceCreate")}
            sx={{ minWidth: 140 }}
          >
            出席追加
          </Button>
        )}
      </Box>

      {/* Search and Filter */}
      <Box
        display="flex"
        gap={2}
        mb={3}
        sx={{ justifyContent: "space-between" }}
      >
        <TextField
          placeholder="検索 . . ."
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
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>状態</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="状態"
          >
            <MenuItem value="">全て</MenuItem>
            <MenuItem value="present">出席</MenuItem>
            <MenuItem value="absent">欠席</MenuItem>
            <MenuItem value="late">遅刻</MenuItem>
          </Select>
        </FormControl>
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
                <strong>学生名</strong>
              </TableCell>
              <TableCell>
                <strong>大学名</strong>
              </TableCell>
              <TableCell>
                <strong>先生名</strong>
              </TableCell>
              <TableCell>
                <strong>先生メールアドレス</strong>
              </TableCell>
              <TableCell>
                <strong>日付</strong>
              </TableCell>
              <TableCell>
                <strong>ステータス</strong>
              </TableCell>
              <TableCell>
                <strong>チェックイン時間</strong>
              </TableCell>
              {canManageAttendance() && (
                <TableCell>
                  <strong>アクション</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAttendances.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManageAttendance() ? 6 : 5}
                  align="center"
                >
                  <Typography color="textSecondary" py={4}>
                    {searchTerm
                      ? "検索結果が見つかりません"
                      : "出席記録がありません"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAttendances.map((attendance) => (
                <TableRow key={attendance.id} hover>
                  <TableCell>{attendance.id}</TableCell>
                  <TableCell>{attendance.student?.name || "N/A"}</TableCell>
                  <TableCell>
                    {attendance.student?.school?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {attendance.student?.school?.teacher_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {attendance.student?.school?.teacher_email || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(attendance.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(attendance.status)}
                      label={getStatusLabel(attendance.status)}
                      size="small"
                      color={getStatusColor(attendance.status)}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {attendance.check_in_time || "00:00:00"}
                  </TableCell>
                  {canManageAttendance() && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="出席編集">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(attendance)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="出席削除">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(attendance)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
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
          count={filteredAttendances.length}
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
        <DialogTitle
          sx={{ textAlign: "center", fontSize: 24, fontWeight: "bold", pb: 1 }}
        >
          出席編集
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <FormControl fullWidth>
              <InputLabel>学生</InputLabel>
              <Select
                value={formData.student_id}
                onChange={(e) =>
                  handleInputChange("student_id", e.target.value)
                }
                label="学生"
                error={!!formErrors.student_id}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.student_id && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.5 }}
                >
                  {formErrors.student_id[0]}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="日付"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              error={!!formErrors.date}
              helperText={formErrors.date ? formErrors.date[0] : ""}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="チェックイン時間"
              type="time"
              value={formData.check_in_time}
              onChange={(e) =>
                handleInputChange("check_in_time", e.target.value)
              }
              error={!!formErrors.check_in_time}
              helperText={
                formErrors.check_in_time
                  ? formErrors.check_in_time[0]
                  : "8:00以前: 出席, 8:00以降: 遅刻, 未入力: 欠席"
              }
              InputLabelProps={{ shrink: true }}
            />

            {/* Display auto-calculated status */}
            <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                自動判定ステータス:
              </Typography>
              <Typography
                variant="body2"
                color={getStatusColor(
                  calculateStatus(formData.check_in_time, formData.date)
                )}
              >
                {getStatusLabel(
                  calculateStatus(formData.check_in_time, formData.date)
                )}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#606060", minWidth: 100 }}
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

      {/* Delete Confirmation Dialog */}
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
        <DialogContent sx={{ textAlign: "center" }}>
          出席記録を削除しますか？
          <br />
          この操作は取り消せません。
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, p: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#606060", minWidth: 100 }}
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
