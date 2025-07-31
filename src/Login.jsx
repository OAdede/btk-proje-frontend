import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';


function Login({ onForgot }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }
    setError('');
    // Backend hazır olunca burada API çağrısı yapılacak
    alert('Giriş başarılı (sahte)');
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
          <Box sx={{
            width: 70,
            height: 70,
            background: 'linear-gradient(135deg, #7f9cf5 0%, #2d8cff 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: '0 4px 16px 0 rgba(45,140,255,0.13)'
          }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: 2 }}>R</Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color="#2d8cff" align="center" mb={0.5} letterSpacing={2} sx={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
            Giriş Yap
          </Typography>
          <Typography variant="subtitle1" color="#6b7280" align="center" mb={1} sx={{ fontWeight: 400, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
            Hesabın varsa giriş yap, yoksa hemen kaydol!
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
            autoComplete="username"
            InputProps={{ style: { borderRadius: 12, background: '#f1f5f9', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
            InputLabelProps={{ style: { color: '#7f9cf5', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
          />
          <TextField
            label="Şifre"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            InputProps={{ style: { borderRadius: 12, background: '#f1f5f9', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
            InputLabelProps={{ style: { color: '#7f9cf5', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1, borderRadius: 2, textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{error}</Alert>
          )}
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2, fontWeight: 700, letterSpacing: 1, borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(45,140,255,0.10)', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', background: 'linear-gradient(90deg, #2d8cff 0%, #7f9cf5 100%)' }}>
            Giriş Yap
          </Button>
          <Button onClick={onForgot} color="secondary" fullWidth sx={{ mt: 1, borderRadius: 3, fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', color: '#2d8cff', background: '#f1f5f9', ':hover': { background: '#e0e7ff' } }}>
            Şifremi Unuttum
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
