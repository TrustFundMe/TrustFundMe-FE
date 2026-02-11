import { AxiosError } from "axios";

export function formatApiError(err: unknown): string {
    const ax = err as AxiosError<any>;
    const status = ax?.response?.status;
    const data = ax?.response?.data;

    const fromServer =
        (typeof data === 'string' && data) ||
        (data && typeof data === 'object' && (data.message || data.error || data.details)) ||
        '';

    if (status === 401) return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
    if (status === 403) return 'Bạn không có quyền thực hiện hành động này.';
    if (status === 400)
        return fromServer ? `Yêu cầu không hợp lệ: ${fromServer}` : 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.';

    // Explicit check for Network Error / Connection Reset
    if (ax.message === 'Network Error') {
        return 'Lỗi kết nối (Connection Reset). File có thể quá lớn so với giới hạn của Server hoặc Proxy.';
    }

    if (status) return fromServer ? `Lỗi hệ thống (${status}): ${fromServer}` : `Yêu cầu thất bại (${status}).`;

    return ax.message || 'Lỗi kết nối. Vui lòng thử lại sau.';
}
