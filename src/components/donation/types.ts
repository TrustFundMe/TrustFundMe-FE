export type ExpenditureItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    quantityLeft: number;
};

export type PaymentMethod = 'payos' | 'paypal' | 'cash';

export type RecentDonor = {
    id: number;
    name: string;
    amount: number;
    time: string;
};
