/**
 * Login Flow Debug Helper (refactored)
 * - Opt-in, non-intrusive logging (no console override until started)
 * - Captures console levels (log/info/warn/error) with timestamps
 * - Safe start/stop with restoration and optional filters
 * - Utilities to inspect/clear logs and check storage
 */
(function () {
    'use strict';

    let isDebugging = false;
    let originalConsole = {};
    let captureLevels = ['log', 'info', 'warn', 'error'];
    const logs = [];
    let maxLogs = 1000; // prevent unbounded growth
    let includePatterns = null; // e.g., ['tokenmanager', 'authcontext', 'login']

    function ts() {
        try {
            return new Date().toISOString().split('T')[1].split('.')[0];
        } catch { return ''; }
    }

    function toStr(v) {
        try {
            if (typeof v === 'string') return v;
            if (v instanceof Error) return v.stack || v.message;
            return JSON.stringify(v);
        } catch {
            try { return String(v); } catch { return '[unprintable]'; }
        }
    }

    function installConsoleHooks() {
        if (isDebugging) return;
        isDebugging = true;
        originalConsole = {};
        captureLevels.forEach((level) => {
            const orig = console[level] ? console[level].bind(console) : console.log.bind(console);
            originalConsole[level] = orig;
            console[level] = function (...args) {
                try {
                    if (logs.length >= maxLogs) logs.shift();
                    logs.push({ ts: ts(), level, args: args.map(toStr) });
                } catch { /* ignore capture errors */ }
                try { orig(...args); } catch { /* ignore printing errors */ }
            };
        });
    }

    function restoreConsole() {
        if (!isDebugging) return;
        captureLevels.forEach((level) => {
            if (originalConsole[level]) {
                console[level] = originalConsole[level];
            }
        });
        originalConsole = {};
        isDebugging = false;
    }

    function printAnalysis() {
        const log = originalConsole.log || console.log;
        log('📊 Login Flow Analysis:');
        log('======================');

        const lines = logs.map((l) => `[${l.ts}] [${l.level}] ${l.args.join(' ')}`);
        lines.forEach((line) => {
            if (!includePatterns || includePatterns.length === 0) return log(line);
            const lc = line.toLowerCase();
            if (includePatterns.some((p) => lc.includes(String(p).toLowerCase()))) log(line);
        });

        const count = (kw) => lines.filter((line) => line.toLowerCase().includes(kw)).length;
        const tokenNotFoundCount = count('no token found');
        const tokenStoredCount = count('token stored successfully');
        const loginStartCount = count('starting login process');

        log('\n📈 Summary:');
        log(`- "No token found" messages: ${tokenNotFoundCount}`);
        log(`- "Token stored successfully" messages: ${tokenStoredCount}`);
        log(`- Login attempts: ${loginStartCount}`);

        if (tokenNotFoundCount > loginStartCount) {
            log('⚠️ More "No token found" than login attempts suggests initialization checks');
        }
        if (tokenStoredCount > 0 && tokenNotFoundCount > tokenStoredCount) {
            log('⚠️ Token stored but still getting "No token found" - possible race condition');
        }

        log('\n💡 Next Steps:');
        log('1. Check if "Token stored successfully" appears');
        log('2. Check if "No token found" stops after successful storage');
        log('3. Verify login completes with "Login completed successfully"');
    }

    // Public API
    window.startLoginDebug = function startLoginDebug(options = {}) {
        if (options.maxLogs && Number.isFinite(options.maxLogs)) maxLogs = options.maxLogs;
        if (Array.isArray(options.captureLevels) && options.captureLevels.length > 0) captureLevels = options.captureLevels;
        if (Array.isArray(options.filter)) includePatterns = options.filter;
        installConsoleHooks();
        const log = originalConsole.log || console.log;
        log('🎬 Starting login flow debug...');
        log('📝 Login logging started - now attempt login through UI');
    };

    window.stopLoginDebug = function stopLoginDebug(opts = {}) {
        // opts.print=false to skip analysis print
        restoreConsole();
        if (opts.print !== false) printAnalysis();
    };

    window.getLoginLogs = function getLoginLogs() { return logs.slice(); };
    window.clearLoginLogs = function clearLoginLogs() { logs.length = 0; };
    window.setLoginDebugFilter = function setLoginDebugFilter(patterns) {
        includePatterns = Array.isArray(patterns) ? patterns : null;
    };

    // Quick storage check
    window.checkCurrentAuth = function checkCurrentAuth() {
        const log = originalConsole.log || console.log;
        log('🔍 Current Authentication State:');
        log('================================');
        let localStorage_token = null, localStorage_user = null, encrypted_user = null;
        try { localStorage_token = localStorage.getItem('token'); } catch {}
        try { localStorage_user = localStorage.getItem('user'); } catch {}
        try { encrypted_user = localStorage.getItem('encrypted_user'); } catch {}

        log('localStorage token:', localStorage_token ? '✅ Found' : '❌ Not found');
        log('localStorage user:', localStorage_user ? '✅ Found' : '❌ Not found');
        log('encrypted_user:', encrypted_user ? '✅ Found' : '❌ Not found');

        try {
            const allKeys = Object.keys(localStorage || {});
            const tokenLikeKeys = allKeys.filter((key) => key && (
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('auth') ||
                key.toLowerCase().includes('user')
            ));
            if (tokenLikeKeys.length > 0) log('Token-like keys found:', tokenLikeKeys);
            else log('No token-like keys found in localStorage');
        } catch {}
    };

    // Optional autostart via flag
    if (window.__LOGIN_DEBUG_AUTOSTART__ === true) {
        window.startLoginDebug();
    }
})();
