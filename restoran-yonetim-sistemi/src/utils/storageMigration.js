/**
 * Storage Migration Utility
 * 
 * This script migrates existing localStorage data to secure encrypted storage
 * Run this when security updates are deployed to clean up legacy data
 */

import secureStorage from './secureStorage.js';

// Keys that contain PII and should be encrypted
const PII_KEYS_TO_MIGRATE = [
    'displayName', 
    'displayRole', 
    'profileImage', 
    'phoneNumber', 
    'email'
];

// Keys that should be moved to general secure storage (with expiration)
const GENERAL_KEYS_TO_MIGRATE = [
    'restaurantName',
    'tableCapacities', 
    'tableStatus',
    'orders',
    'completedOrders', 
    'reservations',
    'orderHistory'
];

/**
 * Migrate PII data to encrypted storage
 */
export const migratePIIData = () => {
    const migrated = [];
    const errors = [];

    PII_KEYS_TO_MIGRATE.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            if (value !== null) {
                // Store in encrypted format
                secureStorage.setItem(key, value);
                // Remove from plain localStorage
                localStorage.removeItem(key);
                migrated.push(key);
                console.log(`[Migration] Encrypted PII data: ${key}`);
            }
        } catch (error) {
            errors.push({ key, error: error.message });
            console.error(`[Migration] Failed to migrate PII data ${key}:`, error);
        }
    });

    return { migrated, errors };
};

/**
 * Migrate general data to secure storage with expiration
 */
export const migrateGeneralData = () => {
    const migrated = [];
    const errors = [];

    GENERAL_KEYS_TO_MIGRATE.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            if (value !== null) {
                // Store with 30-day expiration for general data
                secureStorage.setItem(key, value, {
                    expiry: Date.now() + (30 * 24 * 60 * 60 * 1000)
                });
                // Remove from plain localStorage
                localStorage.removeItem(key);
                migrated.push(key);
                console.log(`[Migration] Secured general data: ${key}`);
            }
        } catch (error) {
            errors.push({ key, error: error.message });
            console.error(`[Migration] Failed to migrate general data ${key}:`, error);
        }
    });

    return { migrated, errors };
};

/**
 * Complete migration of all legacy localStorage data
 */
export const migrateAllData = () => {
    console.log('[Migration] Starting complete localStorage security migration...');
    
    const piiResult = migratePIIData();
    const generalResult = migrateGeneralData();
    
    const totalMigrated = piiResult.migrated.length + generalResult.migrated.length;
    const totalErrors = piiResult.errors.length + generalResult.errors.length;
    
    console.log(`[Migration] Complete! Migrated ${totalMigrated} items, ${totalErrors} errors`);
    
    if (totalErrors > 0) {
        console.warn('[Migration] Errors occurred:', [...piiResult.errors, ...generalResult.errors]);
    }
    
    // Clean up any remaining legacy auth data that might be missed
    const legacyAuthKeys = ['userId', 'userRole', 'authToken', 'sessionData'];
    legacyAuthKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`[Migration] Removed legacy auth data: ${key}`);
        }
    });
    
    return {
        pii: piiResult,
        general: generalResult,
        summary: { totalMigrated, totalErrors }
    };
};

/**
 * Get migration status - what still needs to be migrated
 */
export const getMigrationStatus = () => {
    const piiToMigrate = PII_KEYS_TO_MIGRATE.filter(key => localStorage.getItem(key) !== null);
    const generalToMigrate = GENERAL_KEYS_TO_MIGRATE.filter(key => localStorage.getItem(key) !== null);
    
    return {
        needsMigration: piiToMigrate.length > 0 || generalToMigrate.length > 0,
        piiCount: piiToMigrate.length,
        generalCount: generalToMigrate.length,
        piiKeys: piiToMigrate,
        generalKeys: generalToMigrate
    };
};

// Auto-migrate on import if running in browser and data exists
if (typeof window !== 'undefined') {
    // Add a small delay to ensure secureStorage is initialized
    setTimeout(() => {
        const status = getMigrationStatus();
        if (status.needsMigration) {
            console.log('[Migration] Legacy data detected, running auto-migration...');
            migrateAllData();
        } else {
            console.log('[Migration] No legacy data found, migration not needed');
        }
    }, 100);
}

export default {
    migratePIIData,
    migrateGeneralData, 
    migrateAllData,
    getMigrationStatus
};
