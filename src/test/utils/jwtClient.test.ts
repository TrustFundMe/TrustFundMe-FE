import { describe, it, expect } from 'vitest';
import { decodeJwtPayload, getJwtRoleClient } from '@/utils/jwtClient';

describe('decodeJwtPayload', () => {
  it('decodes a valid 3-part JWT payload', () => {
    // JWT with payload: { "sub": "123", "role": "ADMIN", "exp": 9999999999 }
    const payload = { sub: '123', role: 'ADMIN', exp: 9999999999 };
    const base64Url = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Url}.signature`;

    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });

  it('returns null for token with less than 2 parts', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
    expect(decodeJwtPayload('part1')).toBeNull();
  });

  it('returns null for malformed base64', () => {
    const token = 'header.invalid!!!.signature';
    expect(decodeJwtPayload(token)).toBeNull();
  });

  it('returns null for invalid JSON in payload', () => {
    const invalidBase64 = Buffer.from('not json').toString('base64url');
    const token = `header.${invalidBase64}.signature`;
    expect(decodeJwtPayload(token)).toBeNull();
  });

  it('decodes payload with special characters correctly', () => {
    const payload = { name: 'Nguyễn Văn A', role: 'FUND_OWNER' };
    const base64Url = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `header.${base64Url}.sig`;

    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });
});

describe('getJwtRoleClient', () => {
  it('returns role string from valid token', () => {
    const payload = { sub: '1', role: 'ADMIN', exp: 9999999999 };
    const base64Url = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `h.${base64Url}.s`;

    expect(getJwtRoleClient(token)).toBe('ADMIN');
  });

  it('returns null for null/undefined token', () => {
    expect(getJwtRoleClient(null)).toBeNull();
    expect(getJwtRoleClient(undefined)).toBeNull();
  });

  it('returns null when token has no role field', () => {
    const payload = { sub: '1', exp: 9999999999 };
    const base64Url = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `h.${base64Url}.s`;

    expect(getJwtRoleClient(token)).toBeNull();
  });

  it('returns null when role is not a string', () => {
    const payload = { role: 123 };
    const base64Url = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `h.${base64Url}.s`;

    expect(getJwtRoleClient(token)).toBeNull();
  });

  it('returns role even for empty string role (edge case)', () => {
    const payload = { role: '' };
    const base64Url = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `h.${base64Url}.s`;

    expect(getJwtRoleClient(token)).toBe('');
  });
});
