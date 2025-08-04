import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            return setError('Lütfen tüm alanları doldurun.');
        }
        if (password !== confirmPassword) {
            return setError('Şifreler eşleşmiyor.');
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const successMessage = await resetPassword(token, password);
            setMessage(successMessage);

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message || 'Şifre sıfırlama başarısız oldu.');
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
                        Yeni Şifre Belirle
                    </Typography>
                    <Typography variant="subtitle1" color="#6b7280" align="center" mb={2} sx={{ fontWeight: 400, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                        Lütfen yeni şifrenizi girin.
                    </Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="Yeni Şifre"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        InputProps={{ style: { borderRadius: 12, background: '#f1f5f9', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
                        InputLabelProps={{ style: { color: '#7f9cf5', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
                    />
                    <TextField
                        label="Yeni Şifreyi Onayla"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        InputProps={{ style: { borderRadius: 12, background: '#f1f5f9', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
                        InputLabelProps={{ style: { color: '#7f9cf5', fontWeight: 500, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } }}
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 2, textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{error}</Alert>
                    )}
                    {message && (
                        <Alert severity="success" sx={{ mt: 2, borderRadius: 2, textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{message}</Alert>
                    )}
                    <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, fontWeight: 700, letterSpacing: 1, borderRadius: 3, background: 'linear-gradient(90deg, #2d8cff 0%, #7f9cf5 100%)' }} disabled={loading}>
                        {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ResetPassword;
