import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile } from '../../services/AuthService';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (authUser) {
          setUser({
            name: authUser.name || '',
            email: authUser.email || ''
          });
        } else {
          const response = await getProfile();
          if (response.data.success) {
            setUser({
              name: response.data.user.name || '',
              email: response.data.user.email || ''
            });
          }
        }
      } catch (error) {
        setError('プロフィール情報の取得に失敗しました');
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile(user);
      if (response.data.success) {
        // Update the user in AuthContext to keep state synchronized
        updateUser(response.data.user);
        setSuccess('プロフィールが正常に更新されました');
        setTimeout(() => {
          navigate('/dashboard/profile');
        }, 2000);
      } else {
        setError(response.data.message || 'プロフィールの更新に失敗しました');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'プロフィールの更新に失敗しました');
      console.error('Profile update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        プロフィール編集
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
                  label="名前"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="メールアドレス"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                  >
                    {submitting ? '更新中...' : '変更を保存'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard/profile')}
                    disabled={submitting}
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

export default ProfileEdit;