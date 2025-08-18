/**
 * Token Manager Debug Script
 * 
 * Run this in the browser console to debug token storage issues
 */

(function() {
    console.log('🔍 Token Manager Debug');
    console.log('======================');
    
    // Check if tokenManager is available
    let tokenManager;
    try {
        // Try to access tokenManager from window
        tokenManager = window.tokenManager;
        if (!tokenManager) {
            console.log('❌ TokenManager not found on window object');
            console.log('ℹ️ This is normal - tokenManager is module-scoped for security');
        }
    } catch (e) {
        console.log('❌ Error accessing tokenManager:', e.message);
    }
    
    // Check localStorage for legacy tokens
    console.log('\n📦 Storage Check:');
    const legacyToken = localStorage.getItem('token');
    if (legacyToken) {
        console.log('✅ Legacy token found in localStorage:', legacyToken.substring(0, 30) + '...');
    } else {
        console.log('❌ No legacy token in localStorage');
    }
    
    // Check for encrypted tokens
    const encryptedKeys = Object.keys(localStorage).filter(key => key.startsWith('encrypted_'));
    console.log('\n🔐 Encrypted Storage:');
    if (encryptedKeys.length > 0) {
        encryptedKeys.forEach(key => {
            const value = localStorage.getItem(key);
            console.log(`✅ ${key}: ${value.substring(0, 40)}...`);
        });
    } else {
        console.log('❌ No encrypted data found');
    }
    
    // Check for general storage data
    console.log('\n📄 General Storage:');
    const generalKeys = ['token', 'refreshToken', 'tableCapacities', 'theme', 'restaurantName'];
    generalKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
        }
    });
    
    // Check current login status
    console.log('\n👤 Authentication Status:');
    
    // Check if user appears to be logged in
    const hasEncryptedUser = localStorage.getItem('encrypted_user');
    if (hasEncryptedUser) {
        console.log('✅ Encrypted user data found - user appears to be logged in');
    } else {
        console.log('❌ No encrypted user data - user not logged in');
    }
    
    // Instructions
    console.log('\n💡 Debug Instructions:');
    console.log('1. If no legacy token AND no encrypted data: User needs to log in');
    console.log('2. If legacy token exists: Token migration should happen automatically');
    console.log('3. If encrypted data exists: Check that components are using secureStorage');
    console.log('4. Try logging in with valid credentials to test token storage');
    
    // Test secureStorage availability
    console.log('\n🔧 SecureStorage Test:');
    try {
        if (window.secureStorage || localStorage.getItem('encrypted_user')) {
            console.log('✅ SecureStorage appears to be working');
        } else {
            console.log('⚠️ SecureStorage may not be initialized yet');
        }
    } catch (e) {
        console.log('❌ SecureStorage error:', e.message);
    }
    
})();
