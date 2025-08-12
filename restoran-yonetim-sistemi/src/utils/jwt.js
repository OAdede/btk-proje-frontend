// Lightweight JWT payload decoder (no signature verification)
// Safely decodes Base64URL payload and returns an object, or null on failure
export function decodeJwtPayload(token) {
    try {
        if (!token || typeof token !== 'string') return null;
        const segments = token.split('.');
        if (segments.length < 2) return null;
        const base64Url = segments[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const json = atob(padded)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('');
        const payloadStr = decodeURIComponent(json);
        return JSON.parse(payloadStr);
    } catch (error) {
        console.error('Failed to decode JWT payload:', error);
        return null;
    }
}

function normalizeRoleName(input) {
    if (!input) return undefined;
    const raw = String(input)
        .replace(/^ROLE[_-]?/i, '')
        .trim()
        .toLowerCase();
    if (raw === 'admin' || raw === 'administrator') return 'admin';
    if (raw === 'garson' || raw === 'waiter' || raw === 'server') return 'garson';
    if (raw === 'kasiyer' || raw === 'cashier') return 'kasiyer';
    return raw; // fallback: return normalized raw
}

export function getRoleInfoFromToken(token) {
    const payload = decodeJwtPayload(token);
    if (!payload) return { roleId: undefined, role: undefined, userId: undefined, email: undefined, name: undefined, surname: undefined };
    // Common claim names mapping
    const roleIdRaw = payload.roleId ?? payload.role_id ?? payload.rid ?? payload.roleID ?? payload.roleIDNumber;
    const roleId = typeof roleIdRaw === 'string' && /^\d+$/.test(roleIdRaw) ? parseInt(roleIdRaw, 10) : roleIdRaw;
    let role = payload.role ?? payload.role_name ?? payload.roleType ?? (typeof roleId === 'number' ? (roleId === 0 ? 'admin' : roleId === 1 ? 'garson' : roleId === 2 ? 'kasiyer' : undefined) : undefined);

    // Support "roles" array or "authorities" list like ["ROLE_admin"]
    if (!role) {
        const rolesClaim = payload.roles ?? payload.authorities ?? payload.role_list;
        if (Array.isArray(rolesClaim) && rolesClaim.length > 0) {
            role = normalizeRoleName(rolesClaim[0]);
        } else if (typeof rolesClaim === 'string' && rolesClaim.length > 0) {
            // CSV or single string
            const first = rolesClaim.split(',')[0];
            role = normalizeRoleName(first);
        }
    }

    const userId = payload.userId ?? payload.uid ?? payload.sub;
    const email = payload.email ?? payload.mail ?? payload.sub;
    const name = payload.name ?? payload.given_name ?? payload.firstName;
    const surname = payload.surname ?? payload.family_name ?? payload.lastName;
    return { roleId, role, userId, email, name, surname };
}

export function isTokenExpired(token) {
    try {
        const payload = decodeJwtPayload(token);
        if (!payload || !payload.exp) return true;
        const nowSeconds = Math.floor(Date.now() / 1000);
        return Number(payload.exp) <= nowSeconds;
    } catch {
        return true;
    }
}


