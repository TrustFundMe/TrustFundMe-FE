export interface VietQRBank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
}

/**
 * Map VietQR bank codes to the codes used in our system.
 * VietQR returns "MB" for MB Bank, but our system uses "MBB".
 */
const BANK_CODE_MAP: Record<string, string> = {
    MB: 'MBB',
};

function normalizeBankCode(code: string): string {
    return BANK_CODE_MAP[code] ?? code;
}

export const vietqrService = {
    async getBanks(): Promise<VietQRBank[]> {
        try {
            const res = await fetch('https://api.vietqr.io/v2/banks');
            const data = await res.json();
            const banks: VietQRBank[] = data.data || [];
            // Normalize bank codes to match our system's expected codes
            return banks.map((b) => ({ ...b, code: normalizeBankCode(b.code) }));
        } catch (error) {
            console.error('Failed to fetch banks from VietQR:', error);
            return [];
        }
    },

    async lookupAccount(bin: string, accountNumber: string): Promise<string | null> {
        const apiKey = process.env.NEXT_PUBLIC_VIETQR_API_KEY;
        const clientId = process.env.NEXT_PUBLIC_VIETQR_CLIENT_ID;

        if (!apiKey || !clientId) {
            console.warn('VietQR API keys are missing (NEXT_PUBLIC_VIETQR_API_KEY, NEXT_PUBLIC_VIETQR_CLIENT_ID)');
            return null;
        }

        try {
            const res = await fetch('https://api.vietqr.io/v2/lookup', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'x-client-id': clientId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bin, accountNumber })
            });

            const result = await res.json();
            if (result.code === "00") {
                return result.data.accountName;
            }
            return null;
        } catch (error) {
            console.error('Failed to lookup account from VietQR:', error);
            return null;
        }
    }
};
