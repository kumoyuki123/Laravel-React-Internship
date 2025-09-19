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
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  EventAvailable,
  Person,
  School,
  AccessTime,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceApi, studentApi } from '../../services/ApiService';

export default function AttendenceList() {
  const { canManageAttendance } = useAuth();
  
  // State management
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    date: '',
    status: '',
    check_in_time: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchAttendances();
    fetchStudents();
  }, []);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const response = await attendanceApi.getAll();
      if (response.data.success) {
        setAttendances(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
      showSnackbar('Failed to fetch attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAll();
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dialog handlers
  const handleOpenDialog = (attendance = null) => {
    if (attendance) {
      setEditingAttendance(attendance);
      setFormData({
        student_id: attendance.student_id,
        date: attendance.date,
        status: attendance.status,
        check_in_time: attendance.check_in_time || ''
      });
    } else {
      setEditingAttendance(null);
      setFormData({
        student_id: '',
        date: new Date().toISOString().split('T')[0],
        status: '',
        check_in_time: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAttendance(null);
    setFormData({
      student_id: '',
      date: '',
      status: '',
      check_in_time: ''
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

  const validateForm = () => {
    const errors = {};
    if (!formData.student_id) errors.student_id = 'Student is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.status) errors.status = 'Status is required';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingAttendance) {
        await attendanceApi.update(editingAttendance.id, {
          status: formData.status,
          check_in_time: formData.check_in_time
        });
        showSnackbar('Attendance updated successfully');
      } else {
        await attendanceApi.create(formData);
        showSnackbar('Attendance record created successfully');
      }
      fetchAttendances();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save attendance';
      showSnackbar(errorMessage, 'error');
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    }
  };

  // Delete handlers
  const handleDeleteClick = (attendance) => {
    setAttendanceToDelete(attendance);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await attendanceApi.delete(attendanceToDelete.id);
      showSnackbar('Attendance record deleted successfully');
      fetchAttendances();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete attendance';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setAttendanceToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setAttendanceToDelete(null);
  };

  // Filter attendances
  const filteredAttendances = attendances.filter(attendance => {
    const matchesSearch = attendance.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendance.student?.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendance.date.includes(searchTerm);
    const matchesStatus = statusFilter === '' || attendance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAttendances = filteredAttendances.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle />;
      case 'absent': return <Cancel />;
      case 'late': return <Schedule />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading attendance records...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <EventAvailable color="primary" />
          <Typography variant="h4" component="h1">
            Attendance Management
          </Typography>
        </Box>
        {canManageAttendance() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ minWidth: 160 }}
          >
            Add Attendance
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <TextField
          placeholder="Search by student name, school, or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300, flexGrow: 1 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status Filter"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="present">Present</MenuItem>
            <MenuItem value="absent">Absent</MenuItem>
            <MenuItem value="late">Late</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Attendance Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Student Name</strong></TableCell>
              <TableCell><strong>School</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Check-in Time</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              {canManageAttendance() && <TableCell><strong>Actions</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAttendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageAttendance() ? 7 : 6} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm || statusFilter ? 'No attendance records found matching your criteria.' : 'No attendance records available.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAttendances.map((attendance) => (
                <TableRow key={attendance.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {new Date(attendance.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person fontSize="small" />
                      <Typography variant="body2">
                        {attendance.student?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<School />}
                      label={attendance.student?.school?.name || 'N/A'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(attendance.status)}
                      label={attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                      size="small"
                      color={getStatusColor(attendance.status)}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {attendance.check_in_time ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime fontSize="small" />
                        <Typography variant="body2">
                          {attendance.check_in_time}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Not recorded
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(attendance.created_at).toLocaleDateString()}
                  </TableCell>
                  {canManageAttendance() && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit Attendance">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(attendance)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Attendance">
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
        
        {/* Pagination */}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAttendance ? 'Edit Attendance' : 'Add New Attendance'}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Student"
                  value={formData.student_id}
                  onChange={(e) => handleInputChange('student_id', e.target.value)}
                  error={!!formErrors.student_id}
                  helperText={formErrors.student_id}
                  required
                  disabled={!!editingAttendance}
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} - {student.school?.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                  required
                  disabled={!!editingAttendance}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  error={!!formErrors.status}
                  helperText={formErrors.status}
                  required
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Check-in Time"
                  type="time"
                  value={formData.check_in_time}
                  onChange={(e) => handleInputChange('check_in_time', e.target.value)}
                  error={!!formErrors.check_in_time}
                  helperText={formErrors.check_in_time || 'Leave empty if not applicable'}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAttendance ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attendance record?
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
