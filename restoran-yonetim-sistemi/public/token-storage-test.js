/**
 * Token Storage Test
 * 
 * Test if tokenManager storage/retrieval is working correctly
 */

window.testTokenStorage = function() {
    console.log('🧪 Token Storage Test');
    console.log('====================');
    
    // Create a fake JWT token for testing
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.test';
    
    console.log('1. Testing direct localStorage storage...');
    
    // Test 1: Direct localStorage
    localStorage.setItem('token', testToken);
    const retrieved1 = localStorage.getItem('token');
    console.log('Direct localStorage:', retrieved1 === testToken ? '✅ Works' : '❌ Failed');
    
    // Test 2: SecureStorage simulation (how tokenManager should work)
    console.log('\n2. Testing secureStorage simulation...');
    
    const tokenData = {
        value: testToken,
        timestamp: Date.now(),
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem('token', JSON.stringify(tokenData));
    
    // Simulate secureStorage.getItem for GENERAL data
    const storedData = localStorage.getItem('token');
    let retrievedToken = null;
    
    if (storedData) {
        try {
            const parsed = JSON.parse(storedData);
            if (parsed.expiry && Date.now() > parsed.expiry) {
                console.log('❌ Token expired');
            } else {
                retrievedToken = parsed.value;
            }
        } catch (error) {
            console.log('❌ Parse error:', error.message);
        }
    }
    
    console.log('SecureStorage simulation:', retrievedToken === testToken ? '✅ Works' : '❌ Failed');
    
    // Test 3: Check what's actually in localStorage after login
    console.log('\n3. Current localStorage contents:');
    const allKeys = Object.keys(localStorage).filter(key => 
        key.includes('token') || key.includes('user') || key.includes('auth')
    );
    
    allKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value ? value.substring(0, 100) + '...' : 'null');
        
        // Try to parse if it looks like JSON
        if (value && (value.startsWith('{') || value.startsWith('['))) {
            try {
                const parsed = JSON.parse(value);
                console.log(`  Structure:`, Object.keys(parsed));
            } catch (e) {
                console.log(`  Not valid JSON`);
            }
        }
    });
    
    // Clean up test
    localStorage.removeItem('token');
    
    console.log('\n💡 If SecureStorage simulation works, the issue is in tokenManager integration');
};

// Immediate test of current state
console.log('🔍 Current Authentication State Check');
window.testTokenStorage();
