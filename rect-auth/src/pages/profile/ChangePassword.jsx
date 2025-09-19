import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../services/AuthService';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.new_password !== formData.new_password_confirmation) {
      setError('新しいパスワードが一致しません');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      setLoading(false);
      return;
    }

    try {
      const response = await changePassword(formData);
      
      if (response.data.success) {
        setSuccess('パスワードが正常に変更されました');
        setTimeout(() => {
          navigate('/dashboard/profile');
        }, 2000);
      } else {
        setError(response.data.message || 'パスワードの変更に失敗しました');
      }
    } catch (error) {
      setError(error.response?.data?.message || 
               error.response?.data?.errors?.new_password?.[0] || 
               'パスワードの変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        パスワード変更
      </Typography>
      
      <Card sx={{ maxWidth: 600, margin: 'auto' }}>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="現在のパスワード"
                  name="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="新しいパスワード"
                  name="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  helperText="6文字以上で入力してください"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="新しいパスワード（確認）"
                  name="new_password_confirmation"
                  type="password"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? '処理中...' : 'パスワード変更'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard/profile')}
                    disabled={loading}
                  >
                    キャンセル
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangePassword;