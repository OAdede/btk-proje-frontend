import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useBootstrap } from '../../context/BootstrapContext';

const BootstrapAdmin = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const { setNeedsBootstrap, resetApplicationState } = useBootstrap();

    // Using the same color scheme as Login.jsx
    const lightColors = {
        background: '#F5EFFF',
        cardBackground: '#CBC3E3',
        surfaceBackground: '#E5D9F2',
        primary: '#A294F9',
        accent: '#CDC1FF',
        text: '#1A0B3D',
        textSecondary: '#2D1B69',
        border: '#CDC1FF',
        danger: '#EF4444',
        success: '#10B981'
    };

    // Countdown timer for automatic redirect
    useEffect(() => {
        let timer;
        if (success && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (success && countdown === 0) {
            // Auto redirect when countdown reaches 0 - use the reset method
            resetApplicationState();
        }
        return () => clearTimeout(timer);
    }, [success, countdown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !name) {
            setError('E-posta adresi ve isim gereklidir');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Geçerli bir e-posta adresi girin');
            return;
        }

        // Basic name validation
        if (name.trim().length < 2) {
            setError('İsim en az 2 karakter olmalıdır');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await authService.bootstrapAdmin(email, name.trim());
            
            setSuccess(true);
            setMessage(
                'İlk admin hesabınız oluşturuldu! ' +
                'E-posta adresinize geçici şifreniz gönderildi. ' +
                'Bu bilgilerle giriş yapabilir ve şifrenizi değiştirebilirsiniz.'
            );
            
            // Note: We don't clear storage here immediately, let the countdown/button handle it
            // This allows the user to see the success message properly
            
        } catch (error) {
            setError(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                minHeight: '100vh',
                background: lightColors.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    background: lightColors.cardBackground,
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 8px 25px 0 rgba(167, 139, 250, 0.15)',
                    width: '100%',
                    maxWidth: '500px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: lightColors.text, marginBottom: '20px' }}>
                        Admin Hesabı Oluşturuldu
                    </h2>
                    <div style={{
                        background: lightColors.success + '20',
                        color: lightColors.success,
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: `1px solid ${lightColors.success}40`
                    }}>
                        <h5 style={{ margin: '0 0 10px 0' }}>Başarılı!</h5>
                        <p style={{ margin: '0 0 15px 0' }}>{message}</p>
                        <p style={{ margin: '0 0 10px 0' }}>
                            E-posta gelmezse spam klasörünü kontrol edin.
                        </p>
                        <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>
                            {countdown} saniye sonra giriş sayfasına yönlendirileceksiniz...
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            // Use the comprehensive reset method
                            resetApplicationState();
                        }}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px 0 rgba(167, 139, 250, 0.2)',
                            background: `linear-gradient(90deg, ${lightColors.primary} 0%, ${lightColors.accent} 100%)`,
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Şimdi Giriş Sayfasına Git
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: lightColors.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: lightColors.cardBackground,
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 8px 25px 0 rgba(167, 139, 250, 0.15)',
                width: '100%',
                maxWidth: '500px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img 
                        src="/logo-dark.png" 
                        alt="Logo" 
                        style={{ 
                            height: '60px', 
                            marginBottom: '20px',
                            display: 'block',
                            margin: '0 auto 20px auto'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <h2 style={{ color: lightColors.text, margin: '0 0 10px 0' }}>
                        İlk Admin Hesabını Oluştur
                    </h2>
                    <p style={{ color: lightColors.textSecondary, margin: '0', fontSize: '14px' }}>
                        Restoran yönetim sisteminize hoş geldiniz! 
                        İlk admin hesabınızı oluşturmak için bilgilerinizi girin.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            margin: '0 0 16px 0',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: lightColors.danger + '20',
                            color: lightColors.danger,
                            fontSize: '14px',
                            border: `1px solid ${lightColors.danger}40`
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label 
                            htmlFor="name" 
                            style={{ 
                                display: 'block',
                                color: lightColors.text,
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px'
                            }}
                        >
                            Admin İsmi
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Admin İsmi"
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: `2px solid ${lightColors.border}`,
                                background: lightColors.surfaceBackground,
                                color: lightColors.text,
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ 
                            fontSize: '12px', 
                            color: lightColors.textSecondary,
                            marginTop: '5px'
                        }}>
                            Admin hesabı için görünen isim.
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label 
                            htmlFor="email" 
                            style={{ 
                                display: 'block',
                                color: lightColors.text,
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '8px'
                            }}
                        >
                            Admin E-posta Adresi
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@restoran.com"
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: `2px solid ${lightColors.border}`,
                                background: lightColors.surfaceBackground,
                                color: lightColors.text,
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ 
                            fontSize: '12px', 
                            color: lightColors.textSecondary,
                            marginTop: '5px'
                        }}>
                            Bu e-posta adresine şifre belirleme bağlantısı gönderilecek.
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px 0 rgba(167, 139, 250, 0.2)',
                            background: loading ? lightColors.border : `linear-gradient(90deg, ${lightColors.primary} 0%, ${lightColors.accent} 100%)`,
                            color: '#ffffff',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Admin Hesabı Oluşturuluyor...' : 'Admin Hesabını Oluştur'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <small style={{ color: lightColors.textSecondary, fontSize: '12px' }}>
                        Bu işlem yalnızca sistemde hiç kullanıcı yokken gerçekleştirilebilir.
                        Admin hesabı oluşturduktan sonra normal giriş sayfasından sisteme giriş yapabilirsiniz.
                    </small>
                </div>
            </div>
        </div>
    );
};

export default BootstrapAdmin;
