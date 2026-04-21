import axios from 'axios';

const AI_BASE_URL = (() => {
    if (typeof window !== "undefined") {
        return "/api-ai"; // Proxy qua Next.js → tránh Mixed Content trên Vercel
    }
    return (
        process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
        process.env.NEXT_PUBLIC_BE_API_URL ||
        "http://localhost:7000"
    );
})();

const aiApi = axios.create({
    baseURL: AI_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to help debug local vs vps calls
aiApi.interceptors.request.use((config) => {
    console.log(`[AI-Service] Calling: ${config.baseURL}${config.url}`);
    return config;
});

export interface FlagAnalysisResult {
    summary: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskScore: number;
    keyFindings: string[];
    concerns: string[];
    recommendation: string;
    actionTypes: ('LOCK_CAMPAIGN' | 'SUSPEND_ACCOUNT' | 'SEND_WARNING' | 'DELETE_CONTENT' | 'REQUIRE_DOCUMENT' | 'APPROVE' | 'HIDE_POST' | 'DELETE_POST' | 'LOCK_ACCOUNT')[];
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ExpenditureAnalysisResult {
    summary: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskScore: number;
    redFlags: string[];
    spendingAnalysis: string[];
    recommendation: string;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const aiService = {
    async generateDescription(prompt: string, rules?: string) {
        const response = await aiApi.post('/api/generate-description', {
            prompt,
            rules,
        });
        return response.data;
    },

    async parseExpenditureExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await aiApi.post('/api/parse-expenditure-excel', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.items as Array<{
            name: string;
            unit: string;
            quantity: number;
            price: number;
            note: string;
        }>;
    },

    async ocrKYC(file: File, side: 'front' | 'back' = 'front') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('side', side);

        const response = await aiApi.post('/api/ocr-kyc', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data as {
            idNumber: string | null;
            fullName: string | null;
            dateOfBirth: string | null;
            gender: string | null;
            nationality: string | null;
            placeOfOrigin: string | null;
            placeOfResidence: string | null;
            expiryDate: string | null;
            issueDate: string | null;
            issuePlace: string | null;
        };
    },

    async analyzeFlag(targetData: Record<string, any>, flags: Record<string, any>[]) {
        const response = await aiApi.post<FlagAnalysisResult>('/api/analyze-flag', {
            targetData,
            flags,
        });
        return response.data;
    },

    async analyzeExpenditure(
        campaign: Record<string, any>,
        expenditure: Record<string, any>,
        items: Record<string, any>[]
    ) {
        const response = await aiApi.post<ExpenditureAnalysisResult>('/api/analyze-expenditure', {
            campaign,
            expenditure,
            items,
        });
        return response.data;
    },

    async generateSuggestionLabels(params: {
        amount: number;
        options: Array<{
            items: Array<{ name: string; quantity: number; price: number }>;
            total: number;
        }>;
    }) {
        const response = await aiApi.post<{ labels: string[] }>('/api/generate-suggestion-labels', params);
        return response.data.labels;
    },

    async analyzeEvidence(data: {
        expenditureId: number;
        plan: string;
        purpose: string;
        totalAmount: number;
        items: any[];
        photoUrls: string[];
        createdAt: string;
    }) {
        const response = await aiApi.post<ExpenditureAnalysisResult>('/api/analyze-evidence', data);
        return response.data;
    },
};
