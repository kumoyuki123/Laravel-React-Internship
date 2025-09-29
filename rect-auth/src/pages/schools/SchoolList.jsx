import React, { useState, useEffect } from 'react';
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
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  TablePagination,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  School,
  Person,
  Work
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { schoolApi } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';
import ErrorIcon from "@mui/icons-material/Error";

export default function SchoolList() {
  const { canManageSchools } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    teacher_name: '',
    teacher_email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolApi.getAll();
      if (response.data.success) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      showSnackbar('Failed to fetch schools', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dialog handlers
  const handleOpenDialog = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      teacher_name: school.teacher_name,
      teacher_email: school.teacher_email
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchool(null);
    setFormData({ name: '', teacher_name: '', teacher_email: '' });
    setFormErrors({});
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const handleSubmit = async () => {
    setFormErrors({});

    try {
      await schoolApi.update(editingSchool.id, formData);
      showSnackbar('大学が正常に更新されました。');
      fetchSchools();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving school:', error);
      
      // Handle Laravel validation errors
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        showSnackbar('フォームのエラーを修正してください。', 'error');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to save school';
        showSnackbar(errorMessage, 'error');
      }
    }
  };

  // Delete handlers
  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await schoolApi.delete(schoolToDelete.id);
      showSnackbar('大学は正常に削除されました。');
      fetchSchools();
    } catch (error) {
      console.error('Error deleting school:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete school';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setSchoolToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSchoolToDelete(null);
  };

  // Filter schools based on search term
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.teacher_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSchools = filteredSchools.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading schools...</Typography>
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
          <School color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            大学管理
          </Typography>
        </Box>
        {canManageSchools() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/dashboard/schoolCreate")}
            sx={{ minWidth: 140 }}
          >
            学校追加
          </Button>
        )}
      </Box>

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
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Schools Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>学校名</strong>
              </TableCell>
              <TableCell>
                <strong>教師名</strong>
              </TableCell>
              <TableCell>
                <strong>教師メールアドレス</strong>
              </TableCell>
              <TableCell>
                <strong>学生数</strong>
              </TableCell>
              <TableCell>
                <strong>社会員数</strong>
              </TableCell>
              <TableCell>
                <strong>作成日</strong>
              </TableCell>
              {canManageSchools() && (
                <TableCell>
                  <strong>アクション</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSchools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageSchools() ? 7 : 6} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm
                      ? "No schools found matching your search."
                      : "No schools available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedSchools.map((school) => (
                <TableRow key={school.id} hover>
                  <TableCell>{school.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {school.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{school.teacher_name}</TableCell>
                  <TableCell>{school.teacher_email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<Person />}
                      label={school.students?.length || 0}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Work />}
                      label={school.employees?.length || 0}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(school.created_at).toLocaleDateString()}
                  </TableCell>
                  {canManageSchools() && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="学校を編集">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(school)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="学校を削除">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(school)}
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

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredSchools.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ textAlign: "center", fontSize: 24, fontWeight: "bold", pb: 1 }}
        >
          学校編集
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              fullWidth
              label="学校名"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name ? formErrors.name[0] : ''}
            />
            <TextField
              fullWidth
              label="教師名"
              value={formData.teacher_name}
              onChange={(e) =>
                handleInputChange("teacher_name", e.target.value)
              }
              error={!!formErrors.teacher_name}
              helperText={formErrors.teacher_name ? formErrors.teacher_name[0] : ''}
            />
            <TextField
              fullWidth
              label="教師メールアドレス"
              type="email"
              value={formData.teacher_email}
              onChange={(e) =>
                handleInputChange("teacher_email", e.target.value)
              }
              error={!!formErrors.teacher_email}
              helperText={formErrors.teacher_email ? formErrors.teacher_email[0] : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", py: 2 }}>
          本当に削除しますか？
        </DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
          <ErrorIcon color="error" sx={{ fontSize: 40 }} />
        </Box>
        <DialogContent>
          {" "}
          <DialogContentText component="div" className="text-center">
            大学『{schoolToDelete?.name}』を削除してもよろしいですか？
            <br />
            これにより、関連する従業員および出席記録も削除されます。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, p: 3 }}>
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