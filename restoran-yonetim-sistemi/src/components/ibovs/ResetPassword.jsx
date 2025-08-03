import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { token } = useParams(); // URL'den token'ı al
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return;
        }
        setError('');
        // TODO: Backend'e istek gönderilecek (token ve yeni şifre ile).
        console.log(`Şifre şu token için sıfırlandı (simülasyon): ${token}`);
        setSuccess('Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.');

        // Başarılı olunca kullanıcıyı girişe yönlendir
        setTimeout(() => {
            navigate('/login');
        }, 2000);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
            <Paper elevation={16} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight={700} color="primary">
                        Yeni Şifre Belirle
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Lütfen yeni şifrenizi oluşturun.
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
                        autoFocus
                    />
                    <TextField
                        label="Yeni Şifre (Tekrar)"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                    <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2, py: 1.5 }} disabled={!!success}>
                        Şifreyi Güncelle
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default ResetPassword;