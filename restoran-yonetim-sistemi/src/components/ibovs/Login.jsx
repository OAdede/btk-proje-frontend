import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { AuthContext } from '../../context/AuthContext'; // AuthContext'i import et

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('garson'); // Varsayılan rol
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }
    setError('');

    // AuthContext üzerinden rolü kaydet
    login(role);

    // Role göre yönlendirme yap
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'kasiyer') {
      navigate('/kasiyer');
    } else {
      navigate('/garson');
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
          <ToggleButtonGroup
            color="primary"
            value={role}
            exclusive
            onChange={handleRoleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="garson">Garson</ToggleButton>
            <ToggleButton value="kasiyer">Kasiyer</ToggleButton>
            <ToggleButton value="admin">Admin</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label="Kullanıcı Adı"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
