/**
 * Login Test Helper
 * 
 * This script helps test the login process and token storage
 */

window.debugLogin = async function(email = 'admin@restaurant.com', password = 'admin123') {
    console.log('🧪 Testing Login Process');
    console.log('========================');
    
    try {
        // Clear existing data first
        console.log('🧹 Clearing existing authentication data...');
        localStorage.clear();
        
        // Try to access AuthContext
        console.log('🔍 Attempting login with:', email);
        
        // Since we can't directly access React context from console,
        // let's check if we can access the authService
        if (window.authService) {
            console.log('✅ AuthService found, attempting login...');
            const result = await window.authService.login(email, password);
            console.log('📥 Login result:', result);
        } else {
            console.log('❌ AuthService not available on window');
            console.log('ℹ️ You need to log in through the application UI');
        }
        
    } catch (error) {
        console.error('❌ Login test failed:', error.message);
        
        if (error.message.includes('Failed to fetch')) {
            console.log('🔌 Backend connection issue detected');
            console.log('💡 Make sure the backend server is running');
        }
    }
    
    // Check storage after attempted login
    console.log('\n📦 Post-login storage check:');
    console.log('Legacy token:', localStorage.getItem('token') ? '✅ Found' : '❌ Not found');
    console.log('Encrypted user:', localStorage.getItem('encrypted_user') ? '✅ Found' : '❌ Not found');
    
    const encryptedKeys = Object.keys(localStorage).filter(key => key.startsWith('encrypted_'));
    console.log('Encrypted keys:', encryptedKeys.length > 0 ? encryptedKeys : 'None');
};

// Instructions
console.log('🎯 Login Debug Helper Loaded');
console.log('Usage: debugLogin() or debugLogin("your@email.com", "password")');
console.log('Note: You can also log in through the UI and then run token-debug.js');
