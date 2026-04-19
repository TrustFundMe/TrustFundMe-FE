import { describe, it, expect } from 'vitest';
import { formatApiError } from '@/utils/errorUtils';

describe('formatApiError', () => {
  it('returns 401 session expired message', () => {
    const err = {
      response: { status: 401, data: { message: 'Token expired' } },
      message: 'Request failed',
    } as any;
    expect(formatApiError(err)).toBe('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  });

  it('returns 403 forbidden message', () => {
    const err = {
      response: { status: 403, data: { message: 'Access denied' } },
      message: 'Request failed',
    } as any;
    expect(formatApiError(err)).toBe('Bạn không có quyền thực hiện hành động này.');
  });

  it('returns 400 with server message', () => {
    const err = {
      response: { status: 400, data: { message: 'Invalid input' } },
      message: 'Bad request',
    } as any;
    expect(formatApiError(err)).toBe('Yêu cầu không hợp lệ: Invalid input');
  });

  it('returns generic 400 when no server message', () => {
    const err = {
      response: { status: 400, data: {} },
      message: 'Bad request',
    } as any;
    expect(formatApiError(err)).toBe('Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.');
  });

  it('returns network error message for Connection Reset', () => {
    const err = {
      response: undefined,
      message: 'Network Error',
    } as any;
    expect(formatApiError(err)).toBe('Lỗi kết nối (Connection Reset). File có thể quá lớn so với giới hạn của Server hoặc Proxy.');
  });

  it('returns generic error with status code', () => {
    const err = {
      response: { status: 500, data: { error: 'Internal server error' } },
      message: 'Server error',
    } as any;
    expect(formatApiError(err)).toBe('Lỗi hệ thống (500): Internal server error');
  });

  it('returns fallback message for unknown error without response', () => {
    const err = { message: 'Something went wrong' } as any;
    expect(formatApiError(err)).toBe('Something went wrong');
  });

  it('handles error with data.error string field', () => {
    const err = {
      response: { status: 422, data: { error: 'Unprocessable entity' } },
      message: 'Request failed',
    } as any;
    expect(formatApiError(err)).toBe('Lỗi hệ thống (422): Unprocessable entity');
  });

  it('handles error with data.details field', () => {
    const err = {
      response: { status: 400, data: { details: 'Field "email" is required' } },
      message: 'Bad request',
    } as any;
    expect(formatApiError(err)).toBe('Yêu cầu không hợp lệ: Field "email" is required');
  });
});
