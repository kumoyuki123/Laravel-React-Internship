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
      showSnackbar('Employee updated successfully');
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
      showSnackbar('Employee deleted successfully');
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

  const getJpLevelColor = (level) => {
    if (!level) return 'default';
    switch (level.toUpperCase()) {
      case 'N1': return 'error';
      case 'N2': return 'warning';
      case 'N3': return 'info';
      case 'N4': return 'success';
      case 'N5': return 'primary';
      default: return 'default';
    }
  };

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
          <Work color="primary" />
          <Typography variant="h4" component="h1">
            Employees Management
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search employees by student name, school, JP level, or skills..."
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
              <TableCell><strong>Student Name</strong></TableCell>
              <TableCell><strong>School</strong></TableCell>
              <TableCell><strong>IQ Score</strong></TableCell>
              <TableCell><strong>JP Level</strong></TableCell>
              <TableCell><strong>Skills & Languages</strong></TableCell>
              <TableCell><strong>Created Date</strong></TableCell>
              {canManageEmployees() && <TableCell><strong>Actions</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageEmployees() ? 7 : 6} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm ? 'No employees found matching your search.' : 'No employees available.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
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
                        color={getJpLevelColor(employee.jp_level)}
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
                        <Tooltip title="Edit Employee Skills">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(employee)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Employee">
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
        <DialogTitle>
          Edit Employee Skills - {editingEmployee?.student?.name}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  Student: {editingEmployee?.student?.name} | 
                  School: {editingEmployee?.school?.name} | 
                  IQ Score: {editingEmployee?.iq_score}/100
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Japanese Level"
                  value={formData.jp_level}
                  onChange={(e) => handleInputChange('jp_level', e.target.value)}
                  error={!!formErrors.jp_level}
                  helperText={formErrors.jp_level}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select JP Level</option>
                  <option value="N5">N5 (Beginner)</option>
                  <option value="N4">N4 (Elementary)</option>
                  <option value="N3">N3 (Intermediate)</option>
                  <option value="N2">N2 (Upper Intermediate)</option>
                  <option value="N1">N1 (Advanced)</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Skills & Programming Languages"
                  multiline
                  rows={4}
                  value={formData.skill_language}
                  onChange={(e) => handleInputChange('skill_language', e.target.value)}
                  error={!!formErrors.skill_language}
                  helperText={formErrors.skill_language || 'e.g., PHP, JavaScript, Python, React, Laravel'}
                  placeholder="Enter programming languages, frameworks, and technical skills..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete employee record for "{employeeToDelete?.student?.name}"? 
            This will not delete the student record.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
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