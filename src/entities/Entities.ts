import Decimal from 'decimal.js';

export interface Item {
    id: number;
    name: string;
    description: string;
    retailPrice: Decimal;
}

export type Customer = {
    id: number;
    name: string;
}

// right now only returing the dicounted price, 
// but we could add other info like for example the dicounted rule(s) applied...
export type PricingRulesResult = {
    discountedPrice: Decimal;
};

