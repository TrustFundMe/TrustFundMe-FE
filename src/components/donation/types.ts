export type ExpenditureItem = {
    id: string;
    name: string;
    description: string;
    unit: string;
    price: number;
};

export type PaymentMethod = 'payos' | 'paypal' | 'cash';

export type RecentDonor = {
    id: number;
    name: string;
    amount: number;
    time: string;
};
