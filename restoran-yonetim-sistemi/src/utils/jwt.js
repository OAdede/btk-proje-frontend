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

export function getRoleInfoFromToken(token) {
    const payload = decodeJwtPayload(token);
    if (!payload) return { roleId: undefined, role: undefined, userId: undefined, email: undefined, name: undefined, surname: undefined };
    // Common claim names mapping
    const roleIdRaw = payload.roleId ?? payload.role_id ?? payload.rid;
    const roleId = typeof roleIdRaw === 'string' && /^\d+$/.test(roleIdRaw) ? parseInt(roleIdRaw, 10) : roleIdRaw;
    const role = payload.role ?? (typeof roleId === 'number' ? (roleId === 0 ? 'admin' : roleId === 1 ? 'garson' : roleId === 2 ? 'kasiyer' : undefined) : undefined);
    const userId = payload.userId ?? payload.sub ?? payload.uid;
    const email = payload.email ?? payload.mail;
    const name = payload.name ?? payload.given_name ?? payload.firstName;
    const surname = payload.surname ?? payload.family_name ?? payload.lastName;
    return { roleId, role, userId, email, name, surname };
}


