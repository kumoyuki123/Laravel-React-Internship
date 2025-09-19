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
  DialogContentText
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  School,
  Work,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../../contexts/AuthContext';
import { studentApi, schoolApi } from '../../services/ApiService';

export default function StudentList() {
  const { canManageStudents } = useAuth();
  
  // State management
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState({
    school_id: '',
    roll_no: '',
    name: '',
    email: '',
    nrc_no: '',
    phone: '',
    major: '',
    year: '',
    iq_score: ''
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
    fetchStudents();
    fetchSchools();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getAll();
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showSnackbar('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await schoolApi.getAll();
      if (response.data.success) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dialog handlers
  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        school_id: student.school_id,
        roll_no: student.roll_no,
        name: student.name,
        email: student.email,
        nrc_no: student.nrc_no,
        phone: student.phone,
        major: student.major,
        year: student.year,
        iq_score: student.iq_score
      });
    } else {
      setEditingStudent(null);
      setFormData({
        school_id: '',
        roll_no: '',
        name: '',
        email: '',
        nrc_no: '',
        phone: '',
        major: '',
        year: '',
        iq_score: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    setFormData({
      school_id: '',
      roll_no: '',
      name: '',
      email: '',
      nrc_no: '',
      phone: '',
      major: '',
      year: '',
      iq_score: ''
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
    if (!formData.school_id) errors.school_id = 'School is required';
    if (!formData.roll_no.trim()) errors.roll_no = 'Roll number is required';
    if (!formData.name.trim()) errors.name = 'Student name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.nrc_no.trim()) errors.nrc_no = 'NRC number is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.major.trim()) errors.major = 'Major is required';
    if (!formData.year.trim()) errors.year = 'Year is required';
    if (!formData.iq_score) {
      errors.iq_score = 'IQ score is required';
    } else if (formData.iq_score < 0 || formData.iq_score > 100) {
      errors.iq_score = 'IQ score must be between 0 and 100';
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
      if (editingStudent) {
        await studentApi.update(editingStudent.id, formData);
        showSnackbar('Student updated successfully');
      } else {
        await studentApi.create(formData);
        showSnackbar('Student created successfully');
      }
      fetchStudents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save student';
      showSnackbar(errorMessage, 'error');
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    }
  };

  // Delete handlers
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await studentApi.delete(studentToDelete.id);
      showSnackbar('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete student';
      showSnackbar(errorMessage, 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setStudentToDelete(null);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading students...</Typography>
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
          <Person color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            学生管理
          </Typography>
        </Box>
        {canManageStudents() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ minWidth: 140 }}
          >
            追加
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
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
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Students Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(92,155,16,0.5)" }}>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Roll No</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>School</strong>
              </TableCell>
              <TableCell>
                <strong>Major</strong>
              </TableCell>
              <TableCell>
                <strong>Year</strong>
              </TableCell>
              <TableCell>
                <strong>IQ Score</strong>
              </TableCell>
              <TableCell>
                <strong>Employee</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              {canManageStudents() && (
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageStudents() ? 9 : 8} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm
                      ? "No students found matching your search."
                      : "No students available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {student.roll_no}
                    </Typography>
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<School />}
                      label={student.school?.name || "N/A"}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{student.major}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${student.iq_score}/100`}
                      size="small"
                      color={student.iq_score >= 60 ? "success" : "error"}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {student.employee ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Yes"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<Cancel />}
                        label="No"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  {canManageStudents() && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="学生の編集">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(student)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="学生の削除">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(student)}
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
          count={filteredStudents.length}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStudent ? "Edit Student" : "Add New Student"}
        </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="School"
                  value={formData.school_id}
                  onChange={(e) =>
                    handleInputChange("school_id", e.target.value)
                  }
                  error={!!formErrors.school_id}
                  helperText={formErrors.school_id}
                  required
                >
                  {schools.map((school) => (
                    <MenuItem key={school.id} value={school.id}>
                      {school.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  value={formData.roll_no}
                  onChange={(e) => handleInputChange("roll_no", e.target.value)}
                  error={!!formErrors.roll_no}
                  helperText={formErrors.roll_no}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NRC Number"
                  value={formData.nrc_no}
                  onChange={(e) => handleInputChange("nrc_no", e.target.value)}
                  error={!!formErrors.nrc_no}
                  helperText={formErrors.nrc_no}
                  placeholder="e.g., 9/MaHaMa(N)456456"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  placeholder="e.g., 09-979789609"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Major"
                  value={formData.major}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  error={!!formErrors.major}
                  helperText={formErrors.major}
                  placeholder="e.g., EC, IT, Civil"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  error={!!formErrors.year}
                  helperText={formErrors.year}
                  placeholder="e.g., First Year, Second Year"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="IQ Score"
                  type="number"
                  value={formData.iq_score}
                  onChange={(e) =>
                    handleInputChange(
                      "iq_score",
                      parseInt(e.target.value) || ""
                    )
                  }
                  error={!!formErrors.iq_score}
                  helperText={
                    formErrors.iq_score ||
                    "Score ≥ 60 will automatically create employee record"
                  }
                  inputProps={{ min: 0, max: 100 }}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? "Update" : "Create"}
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
          <DialogContentText component="div" className='text-center'>
            学生『{studentToDelete?.name}』を削除してもよろしいですか？<br />これにより、関連する従業員および出席記録も削除されます。
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