import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }
    setError('');
    // TODO: Backend'e istek gönderilecek.
    console.log(`Şifre sıfırlama maili şu adrese gönderildi (simülasyon): ${email}`);
    setSuccess('Şifre sıfırlama talimatları e-posta adresinize gönderildi.');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
      <Paper elevation={16} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Şifremi Unuttum
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Hesabınıza ait e-posta adresini girin.
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="E-posta Adresi"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2, py: 1.5 }}>
            Sıfırlama Linki Gönder
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button>Giriş ekranına dön</Button>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ForgotPassword;