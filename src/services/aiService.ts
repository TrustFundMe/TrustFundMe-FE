import axios from 'axios';

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8089';

const aiApi = axios.create({
    baseURL: AI_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

        const response = await axios.post(`${AI_BASE_URL}/api/parse-expenditure-excel`, formData, {
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
};

