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
  const handleOpenDialog = (school = null) => {
    if (school) {
      setEditingSchool(school);
      setFormData({
        name: school.name,
        teacher_name: school.teacher_name,
        teacher_email: school.teacher_email
      });
    } else {
      setEditingSchool(null);
      setFormData({
        name: '',
        teacher_name: '',
        teacher_email: ''
      });
    }
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

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'School name is required';
    if (!formData.teacher_name.trim()) errors.teacher_name = 'Teacher name is required';
    if (!formData.teacher_email.trim()) {
      errors.teacher_email = 'Teacher email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.teacher_email)) {
      errors.teacher_email = 'Please enter a valid email address';
    }
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingSchool) {
        await schoolApi.update(editingSchool.id, formData);
        showSnackbar('School updated successfully');
      } else {
        await schoolApi.create(formData);
        showSnackbar('School created successfully');
      }
      fetchSchools();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving school:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save school';
      showSnackbar(errorMessage, 'error');
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
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
      showSnackbar('School deleted successfully');
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <School color="primary" />
          <Typography variant="h4" component="h1">
            Schools Management
          </Typography>
        </Box>
        {canManageSchools() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ minWidth: 140 }}
          >
            Add School
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search schools by name, teacher name, or email..."
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
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>School Name</strong></TableCell>
              <TableCell><strong>Teacher Name</strong></TableCell>
              <TableCell><strong>Teacher Email</strong></TableCell>
              <TableCell><strong>Students</strong></TableCell>
              <TableCell><strong>Employees</strong></TableCell>
              <TableCell><strong>Created Date</strong></TableCell>
              {canManageSchools() && <TableCell><strong>Actions</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSchools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageSchools() ? 7 : 6} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm ? 'No schools found matching your search.' : 'No schools available.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedSchools.map((school) => (
                <TableRow key={school.id} hover>
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
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Work />}
                      label={school.employees?.length || 0}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(school.created_at).toLocaleDateString()}
                  </TableCell>
                  {canManageSchools() && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit School">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(school)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete School">
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSchool ? 'Edit School' : 'Add New School'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              fullWidth
              label="School Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            <TextField
              fullWidth
              label="Teacher Name"
              value={formData.teacher_name}
              onChange={(e) => handleInputChange('teacher_name', e.target.value)}
              error={!!formErrors.teacher_name}
              helperText={formErrors.teacher_name}
              required
            />
            <TextField
              fullWidth
              label="Teacher Email"
              type="email"
              value={formData.teacher_email}
              onChange={(e) => handleInputChange('teacher_email', e.target.value)}
              error={!!formErrors.teacher_email}
              helperText={formErrors.teacher_email}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSchool ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{schoolToDelete?.name}"? This action cannot be undone.
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