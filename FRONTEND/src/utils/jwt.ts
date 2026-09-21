import { JwtPayload, UserRole } from '../types/auth';

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

export function getUserRoleFromToken(token: string): UserRole | null {
  const payload = parseJwt(token);
  return payload?.role || null;
}

export function getUsernameFromToken(token: string): string | null {
  const payload = parseJwt(token);
  return payload?.sub || null;
}
