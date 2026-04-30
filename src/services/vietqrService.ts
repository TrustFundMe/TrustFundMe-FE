export interface VietQRBank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
}

export const vietqrService = {
    async getBanks(): Promise<VietQRBank[]> {
        try {
            const res = await fetch('https://api.vietqr.io/v2/banks');
            const data = await res.json();
            return data.data || [];
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
