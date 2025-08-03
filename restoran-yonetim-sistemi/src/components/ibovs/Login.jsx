import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link eklendi
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }
    setError('');

    const role = login(username, password);

    if (role) {
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'kasiyer') {
        navigate('/kasiyer');
      } else {
        navigate('/garson');
      }
    } else {
      setError('Kullanıcı adı veya şifre yanlış.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
      <Paper elevation={16} sx={{
        p: { xs: 3, sm: 4 },
        width: '100%',
        maxWidth: 400,
        borderRadius: 4,
      }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Restoran Sistemi
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Lütfen giriş yapın
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Kullanıcı Adı"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <TextField
            label="Şifre"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2, py: 1.5 }}>
            Giriş Yap
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Button>Şifremi Unuttum</Button>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;