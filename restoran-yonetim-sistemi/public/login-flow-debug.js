/**
 * Login Flow Debug Helper
 * 
 * This script helps debug the exact sequence during login
 */

console.log('🔬 Login Flow Debug Helper Loaded');

// Override console.log temporarily to track sequence
const originalLog = console.log;
const loginLogs = [];

window.startLoginDebug = function() {
    console.log('🎬 Starting login flow debug...');
    loginLogs.length = 0; // Clear previous logs
    
    // Intercept console.log to capture sequence
    console.log = function(...args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logEntry = `[${timestamp}] ${args.join(' ')}`;
        loginLogs.push(logEntry);
        originalLog.apply(console, args);
    };
    
    console.log('📝 Login logging started - now attempt login through UI');
};

window.stopLoginDebug = function() {
    // Restore original console.log
    console.log = originalLog;
    
    console.log('📊 Login Flow Analysis:');
    console.log('======================');
    
    loginLogs.forEach(log => {
        if (log.includes('TokenManager') || log.includes('AuthContext') || log.includes('login')) {
            console.log(log);
        }
    });
    
    // Analysis
    const tokenNotFoundCount = loginLogs.filter(log => log.includes('No token found')).length;
    const tokenStoredCount = loginLogs.filter(log => log.includes('Token stored successfully')).length;
    const loginStartCount = loginLogs.filter(log => log.includes('Starting login process')).length;
    
    console.log('\n📈 Summary:');
    console.log(`- "No token found" messages: ${tokenNotFoundCount}`);
    console.log(`- "Token stored successfully" messages: ${tokenStoredCount}`);
    console.log(`- Login attempts: ${loginStartCount}`);
    
    if (tokenNotFoundCount > loginStartCount) {
        console.log('⚠️ More "No token found" than login attempts suggests initialization checks');
    }
    
    if (tokenStoredCount > 0 && tokenNotFoundCount > tokenStoredCount) {
        console.log('⚠️ Token stored but still getting "No token found" - possible race condition');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Check if "Token stored successfully" appears');
    console.log('2. Check if "No token found" stops after successful storage');
    console.log('3. Verify login completes with "Login completed successfully"');
};

// Auto-instructions
console.log('📚 Usage:');
console.log('1. Run: startLoginDebug()');
console.log('2. Attempt login through the UI');
console.log('3. Run: stopLoginDebug()');
console.log('4. Review the analysis');

// Quick storage check
window.checkCurrentAuth = function() {
    console.log('🔍 Current Authentication State:');
    console.log('================================');
    
    // Check various storage locations
    const localStorage_token = localStorage.getItem('token');
    const localStorage_user = localStorage.getItem('user');
    const encrypted_user = localStorage.getItem('encrypted_user');
    
    console.log('localStorage token:', localStorage_token ? '✅ Found' : '❌ Not found');
    console.log('localStorage user:', localStorage_user ? '✅ Found' : '❌ Not found');
    console.log('encrypted_user:', encrypted_user ? '✅ Found' : '❌ Not found');
    
    // Check for any tokens in general storage
    const allKeys = Object.keys(localStorage);
    const tokenLikeKeys = allKeys.filter(key => 
        key.includes('token') || key.includes('auth') || key.includes('user')
    );
    
    if (tokenLikeKeys.length > 0) {
        console.log('Token-like keys found:', tokenLikeKeys);
    } else {
        console.log('No token-like keys found in localStorage');
    }
};
