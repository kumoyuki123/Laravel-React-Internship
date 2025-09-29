import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { attendanceApi, studentApi } from '../../services/ApiService';
import { useNavigate } from 'react-router-dom';

export default function AttendanceCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [students, setStudents] = useState([]);
  
  const [formData, setFormData] = useState({
    student_id: '',
    date: '',
    status: 'present',
    check_in_time: ''
  });

  // Fetch students for dropdown
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAll();
      if (response.data?.data) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calculateStatus = (checkInTime, date) => {
    if (!checkInTime) return "absent";
    const [hours, minutes] = checkInTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const lateThreshold = 8 * 60;
    return totalMinutes > lateThreshold ? "late" : "present";
  };

  // Format time to include seconds (HH:MM:SS)
  const formatTimeWithSeconds = (timeString) => {
    if (!timeString) return null;
    
    // If already has seconds, return as is
    if (timeString.includes(':') && timeString.split(':').length === 3) {
      return timeString;
    }
    
    // Add seconds (00) if only HH:MM format
    return timeString + ':00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
    const formattedTime = formatTimeWithSeconds(formData.check_in_time);
    const calculatedStatus = calculateStatus(formData.check_in_time, formData.date);
    const submitData = {
      student_id: formData.student_id,
      date: formData.date,
      status: calculatedStatus,
      check_in_time: formattedTime
    };

    try {
      const response = await attendanceApi.create(submitData);
      if (response.data.success) {
        setSuccess('出席記録が作成されました！');
        setFormData({
          student_id: '',
          date: '',
          status: 'present',
          check_in_time: ''
        });
        setTimeout(() => {
          navigate('/dashboard/attendenceList');
        }, 2000);
      }
    } catch (error) {
      console.error('Attendance creation error:', error);
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setError('フォームにエラーがあります。修正してください。');
      } else {
        setError(error.response?.data?.message || '出席記録の作成に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          新しい出席記録作成
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/dashboard/attendenceList')}>
          戻る
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>学生</InputLabel>
            <Select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              label="学生"
              error={!!fieldErrors.student_id}
            >
              {students.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.student_id && (
              <Typography variant="caption" color="error">
                {fieldErrors.student_id[0]}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="日付"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.date}
            helperText={fieldErrors.date ? fieldErrors.date[0] : ''}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="チェックイン時間"
            name="check_in_time"
            type="time"
            value={formData.check_in_time}
            onChange={handleChange}
            margin="normal"
            error={!!fieldErrors.check_in_time}
            helperText={
              fieldErrors.check_in_time ? fieldErrors.check_in_time[0] : 
              'HH:MM形式で入力してください (例: 08:00, 08:30) - 秒は自動で追加されます'
            }
            InputLabelProps={{ shrink: true }}
          />

          {/* Status Preview */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'grey.50', 
            borderRadius: 1, 
            mt: 2,
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              ステータス自動判定:
            </Typography>
            <Typography 
              variant="body1" 
              color={
                calculateStatus(formData.check_in_time, formData.date) === 'present' ? 'success.main' :
                calculateStatus(formData.check_in_time, formData.date) === 'late' ? 'warning.main' :
                'error.main'
              }
              fontWeight="bold"
            >
              {calculateStatus(formData.check_in_time, formData.date) === 'present' ? '出席' :
               calculateStatus(formData.check_in_time, formData.date) === 'late' ? '遅刻' : '欠席'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formData.check_in_time ? 
                `チェックイン時間: ${formData.check_in_time}:00 (自動変換)` : 
                'チェックイン時間が未入力のため欠席になります'}
            </Typography>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#606060", minWidth: 100 }}
              onClick={() => navigate('/dashboard/attendenceList')}
              disabled={loading}
            >
              キャンセル
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? <CircularProgress size={24} /> : '出席作成'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}