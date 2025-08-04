import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const successMessage = await requestPasswordReset(email);
      setMessage(successMessage);
    } catch (err) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      <Paper elevation={16} sx={{
        p: { xs: 2, sm: 5 },
        minWidth: 350,
        maxWidth: 420,
        borderRadius: 5,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.13)',
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(2px)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight={800} color="#2d8cff" align="center" mb={0.5} letterSpacing={1} sx={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
            Şifreni Sıfırla
          </Typography>
          <Typography variant="subtitle1" color="#6b7280" align="center" mb={2} sx={{ fontWeight: 400, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
            E-posta adresinize bir sıfırlama bağlantısı göndereceğiz.
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
            autoComplete="email"
            InputProps={{ style: { borderRadius: 12, background: '#f1f5f9', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
            InputLabelProps={{ style: { color: '#7f9cf5', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2, textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{error}</Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2, textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{message}</Alert>
          )}
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, fontWeight: 700, letterSpacing: 1, borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(45,140,255,0.10)', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', background: 'linear-gradient(90deg, #2d8cff 0%, #7f9cf5 100%)' }} disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
          </Button>
          <Button component={Link} to="/login" color="secondary" fullWidth sx={{ mt: 1, borderRadius: 3, fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', color: '#2d8cff', textTransform: 'none' }}>
            Giriş ekranına geri dön
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
