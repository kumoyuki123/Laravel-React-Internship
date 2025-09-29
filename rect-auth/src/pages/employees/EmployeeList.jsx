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
  Tooltip,
  Grid
} from '@mui/material';
import {
  Edit,
  Delete,
  Search,
  Work,
  Person,
  School,
  Psychology
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { employeeApi } from '../../services/ApiService';
import ErrorIcon from "@mui/icons-material/Error";

export default function EmployeeList() {
  const { canManageEmployees } = useAuth();
  
  // State management
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState({
    jp_level: '',
    skill_language: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAll();
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      showSnackbar('Failed to fetch employees', 'error');
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
  const handleOpenDialog = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      jp_level: employee.jp_level || '',
      skill_language: employee.skill_language || ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFormData({
      jp_level: '',
      skill_language: ''
    });
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
    try {
      await employeeApi.update(editingEmployee.id, formData);
      showSnackbar('従業員が正常に更新されました。');
      fetchEmployees();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating employee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update employee';
      showSnackbar(errorMessage, 'error');
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    }
  };

  // Delete handlers
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await employeeApi.delete(employeeToDelete.id);
      showSnackbar('従業員が正常に削除されました。');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete employee';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.jp_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.skill_language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading employees...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Work color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            従業員管理
          </Typography>
        </Box>
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

      {/* Employees Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>学生名</strong></TableCell>
              <TableCell><strong>大学名</strong></TableCell>
              <TableCell><strong>IQスコア</strong></TableCell>
              <TableCell><strong>日本語レベル</strong></TableCell>
              <TableCell><strong>プログラム言語</strong></TableCell>
              <TableCell><strong>作成日</strong></TableCell>
              {canManageEmployees() && <TableCell><strong>アクション</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageEmployees() ? 7 : 6} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm ? '検索条件に一致する従業員は見つかりませんでした。': '利用可能な従業員がいません。'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    {employee.id}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        {employee.student?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<School />}
                      label={employee.school?.name || 'N/A'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Psychology />}
                      label={`${employee.iq_score}/100`}
                      size="small"
                      color={employee.iq_score >= 80 ? 'success' : employee.iq_score >= 70 ? 'info' : 'warning'}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {employee.jp_level ? (
                      <Chip
                        label={employee.jp_level}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.skill_language ? (
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {employee.skill_language}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(employee.created_at).toLocaleDateString()}
                  </TableCell>
                  {canManageEmployees() && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="従業員のスキルを編集する">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(employee)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="従業員を削除">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(employee)}
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
          count={filteredEmployees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: 24, fontWeight: 'bold', pb: 1 }}>
          スキル編集 - {editingEmployee?.student?.name}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            {/* Student Info Section */}
            <Box sx={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.04)', 
              p: 2, 
              borderRadius: 1, 
              mb: 3,
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{fontSize:20}}>
                学生情報
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2">
                  <strong>名前:</strong> {editingEmployee?.student?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>大学:</strong> {editingEmployee?.school?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>IQ スコア:</strong> {editingEmployee?.iq_score}/100
                </Typography>
              </Box>
            </Box>

            {/* Japanese Level Field */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                select
                label="日本語レベル"
                value={formData.jp_level}
                onChange={(e) => handleInputChange('jp_level', e.target.value)}
                error={!!formErrors.jp_level}
                helperText={formErrors.jp_level ? formErrors.jp_level[0] : ''}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">日本語レベルを選択</option>
                <option value="N5">N5 (初心者)</option>
                <option value="N4">N4 (初級)</option>
                <option value="N3">N3 (中級)</option>
                <option value="N2">N2 (中上級)</option>
                <option value="N1">N1 (上級)</option>
              </TextField>
            </Box>

            {/* Skills Field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="スキル & プログラミング言語"
                multiline
                rows={4}
                value={formData.skill_language}
                onChange={(e) => handleInputChange('skill_language', e.target.value)}
                error={!!formErrors.skill_language}
                helperText={formErrors.skill_language ? formErrors.skill_language[0] : '例: PHP, JavaScript, Python, React, Laravel'}
                placeholder="プログラミング言語、フレームワーク、技術スキルを入力..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start'
                  }
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
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
            学生『{employeeToDelete?.student?.name}』を削除してもよろしいですか？
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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