/**
 * Real-Time Storage Inspector
 * 
 * This tool monitors localStorage changes in real-time during login
 */

(function() {
    console.log('🔍 Real-Time Storage Inspector');
    console.log('==============================');
    
    let isMonitoring = false;
    let storageSnapshot = {};
    
    // Take a snapshot of current localStorage
    function takeSnapshot() {
        const snapshot = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            snapshot[key] = localStorage.getItem(key);
        }
        return snapshot;
    }
    
    // Compare snapshots to detect changes
    function compareSnapshots(oldSnapshot, newSnapshot) {
        const changes = {
            added: [],
            modified: [],
            removed: []
        };
        
        // Check for added and modified
        Object.keys(newSnapshot).forEach(key => {
            if (!(key in oldSnapshot)) {
                changes.added.push({ key, value: newSnapshot[key] });
            } else if (oldSnapshot[key] !== newSnapshot[key]) {
                changes.modified.push({ 
                    key, 
                    oldValue: oldSnapshot[key], 
                    newValue: newSnapshot[key] 
                });
            }
        });
        
        // Check for removed
        Object.keys(oldSnapshot).forEach(key => {
            if (!(key in newSnapshot)) {
                changes.removed.push({ key, oldValue: oldSnapshot[key] });
            }
        });
        
        return changes;
    }
    
    // Monitor localStorage changes
    function monitorStorage() {
        const newSnapshot = takeSnapshot();
        const changes = compareSnapshots(storageSnapshot, newSnapshot);
        
        if (changes.added.length || changes.modified.length || changes.removed.length) {
            console.log('📦 localStorage Change Detected:');
            
            changes.added.forEach(change => {
                console.log(`➕ Added: ${change.key}`, 
                    change.value.length > 100 ? change.value.substring(0, 100) + '...' : change.value);
            });
            
            changes.modified.forEach(change => {
                console.log(`🔄 Modified: ${change.key}`);
                console.log('  Old:', change.oldValue.length > 50 ? change.oldValue.substring(0, 50) + '...' : change.oldValue);
                console.log('  New:', change.newValue.length > 50 ? change.newValue.substring(0, 50) + '...' : change.newValue);
            });
            
            changes.removed.forEach(change => {
                console.log(`❌ Removed: ${change.key}`, 
                    change.oldValue.length > 50 ? change.oldValue.substring(0, 50) + '...' : change.oldValue);
            });
        }
        
        storageSnapshot = newSnapshot;
    }
    
    window.startStorageMonitor = function() {
        if (isMonitoring) {
            console.log('⚠️ Storage monitor is already running');
            return;
        }
        
        console.log('📡 Starting localStorage monitor...');
        storageSnapshot = takeSnapshot();
        isMonitoring = true;
        
        // Monitor every 500ms
        window.storageMonitorInterval = setInterval(monitorStorage, 500);
        console.log('✅ Monitor started - now perform login and watch for changes');
    };
    
    window.stopStorageMonitor = function() {
        if (!isMonitoring) {
            console.log('⚠️ Storage monitor is not running');
            return;
        }
        
        clearInterval(window.storageMonitorInterval);
        isMonitoring = false;
        console.log('🛑 Storage monitor stopped');
    };
    
    // Test token retrieval
    window.testTokenRetrieval = function() {
        console.log('🧪 Testing Token Retrieval');
        console.log('===========================');
        
        // Check all possible locations for token
        const locations = {
            'localStorage.token': localStorage.getItem('token'),
            'localStorage.encrypted_token': localStorage.getItem('encrypted_token'),
            'localStorage.user': localStorage.getItem('user'),
            'localStorage.encrypted_user': localStorage.getItem('encrypted_user')
        };
        
        Object.entries(locations).forEach(([location, value]) => {
            if (value) {
                console.log(`✅ ${location}:`, value.substring(0, 50) + '...');
                
                // If it's the token, try to parse it if it looks like JSON
                if (location.includes('token') && value.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(value);
                        console.log(`  📋 Parsed structure:`, Object.keys(parsed));
                        if (parsed.value) {
                            console.log(`  🎫 Actual token:`, parsed.value.substring(0, 30) + '...');
                        }
                    } catch (e) {
                        console.log(`  ❌ Parse error:`, e.message);
                    }
                }
            } else {
                console.log(`❌ ${location}: Not found`);
            }
        });
        
        // Test secureStorage if available
        try {
            // Note: secureStorage might not be accessible from console
            console.log('\n🔐 Testing SecureStorage Access:');
            console.log('(This may not work from console due to module scoping)');
        } catch (e) {
            console.log('❌ SecureStorage not accessible:', e.message);
        }
    };
    
    // Instructions
    console.log('\n📚 Usage:');
    console.log('1. startStorageMonitor() - Start monitoring localStorage changes');
    console.log('2. Perform login through UI');
    console.log('3. stopStorageMonitor() - Stop monitoring');
    console.log('4. testTokenRetrieval() - Check token locations');
    
    console.log('\n💡 This will help us see EXACTLY what happens to storage during login');
    
})();
