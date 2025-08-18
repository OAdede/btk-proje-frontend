# 🔒 Authentication Security Migration Guide

## Overview
This guide helps migrate from scattered localStorage token access to a centralized, secure token management system. The migration is designed to be gradual and non-breaking.

## ⚠️ Security Issues We're Fixing

### Critical Issues:
1. **Token exposure in logs** - Partial tokens visible in debug output
2. **No expiration checking** - App doesn't validate token expiration before API calls
3. **Scattered token access** - 30+ locations directly accessing localStorage
4. **No automatic logout** - Users stay "authenticated" with expired tokens
5. **Inconsistent auth headers** - Different patterns across services

### Benefits of Migration:
- ✅ Automatic token expiration checking
- ✅ Centralized token management
- ✅ Consistent error handling
- ✅ Preparation for refresh tokens
- ✅ Better security logging
- ✅ Easy to add HTTPS-only cookies later

## 📁 New Files Added

### `src/utils/tokenManager.js`
- Centralized token storage and validation
- Automatic expiration checking
- Safe token debugging
- Callback system for token events

### `src/utils/httpClient.js`
- HTTP client with automatic auth headers
- Global 401 error handling
- Request/response interceptors
- Consistent API error handling

## 🔄 Migration Steps

### Phase 1: Foundation (✅ COMPLETED)
1. ✅ Added `tokenManager.js` and `httpClient.js`
2. ✅ Updated `authService.js` core methods
3. ✅ Updated `AuthContext.jsx` to use tokenManager
4. ✅ Fixed token exposure in `BackendTest.jsx`

### Phase 2: Service Migration (NEXT)
**For each service file, replace this pattern:**

**OLD (Insecure):**
```javascript
const token = localStorage.getItem('token');
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};
```

**NEW (Secure):**
```javascript
import tokenManager from '../utils/tokenManager.js';
// Use tokenManager for automatic validation
const headers = tokenManager.getHeaders();
```

**Or even better, use httpClient:**
```javascript
import httpClient from '../utils/httpClient.js';
// Automatic auth headers + error handling
const response = await httpClient.get('/api/endpoint');
```

### Phase 3: Component Updates
Replace manual token checks in components:

**OLD:**
```javascript
const token = localStorage.getItem('token');
if (!token) {
    // handle not authenticated
}
```

**NEW:**
```javascript
import tokenManager from '../utils/tokenManager.js';
if (!tokenManager.isAuthenticated()) {
    // handle not authenticated - automatically checks expiration
}
```

## 🎯 Service Migration Priority

**High Priority (Core Auth):**
1. ✅ `authService.js` (COMPLETED)
2. `userService.js` 
3. `personnelService.js`

**Medium Priority (Business Logic):**
4. `reservationService.js`
5. `analyticsService.js` 
6. `settingsService.js`

**Low Priority (Admin Features):**
7. `salonService.js`
8. `diningTableService.js`
9. `activityLogService.js`

## 📋 Migration Checklist Template

For each service file:

- [ ] Import tokenManager/httpClient
- [ ] Replace `localStorage.getItem('token')` calls
- [ ] Replace manual header construction
- [ ] Update error handling to use httpClient patterns
- [ ] Test authentication flow
- [ ] Test with expired token
- [ ] Update any related components

## 🧪 Testing Strategy

### Manual Testing:
1. **Normal Flow**: Login → Use features → Logout
2. **Expiration**: Login → Wait for token expiration → Try to use features
3. **Invalid Token**: Manually corrupt token in localStorage → Try to use features
4. **Network Errors**: Disconnect network → Try to use features

### Automated Testing:
```javascript
// Example test for tokenManager
import tokenManager from '../utils/tokenManager.js';

test('tokenManager rejects expired tokens', () => {
    const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MzA0NDQ4MDB9.invalid';
    tokenManager.setToken(expiredToken);
    expect(tokenManager.isAuthenticated()).toBe(false);
});
```

## 🚨 Important Notes

### For Team Members:

1. **Don't use direct localStorage calls** for tokens anymore
2. **Always import tokenManager** when you need auth status
3. **Use httpClient** for new API calls
4. **Test with expired tokens** during development
5. **Check console for tokenManager logs** in development

### Backward Compatibility:
- Old code continues to work during migration
- Legacy functions available in tokenManager.js
- No breaking changes to existing functionality

### Environment Variables:
Make sure you have proper environment setup:
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📞 Getting Help

### Common Issues:

**"Token undefined" errors:**
- Import tokenManager: `import tokenManager from '../utils/tokenManager.js'`
- Use `tokenManager.getToken()` instead of localStorage

**"Headers not working" errors:**
- Use `tokenManager.getHeaders()` for complete headers
- Or use `httpClient` for automatic header management

**"Automatic logout not working":**
- Check that AuthContext is properly set up with tokenManager callbacks
- Verify token expiration is correctly set in JWT

### Code Review Checklist:
- [ ] No direct localStorage.getItem('token') calls
- [ ] Using tokenManager or httpClient
- [ ] Error handling for expired tokens
- [ ] No token values in console.log statements
- [ ] Proper import statements

## 🔮 Future Enhancements

Once migration is complete, we can easily add:
- ✅ Refresh token mechanism
- ✅ Secure httpOnly cookie storage
- ✅ Automatic token refresh
- ✅ Better offline handling
- ✅ Request queuing during token refresh
- ✅ Enhanced security logging

---

**Migration Status**: Phase 1 Complete ✅
**Next Steps**: Begin Phase 2 service migration
**Estimated Completion**: 2-3 sprints with gradual rollout
