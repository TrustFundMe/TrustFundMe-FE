export function decodeJwtPayload(token: string): any | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getJwtRoleClient(token: string | undefined | null): string | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  return typeof role === 'string' ? role : null;
}
