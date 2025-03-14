import Decimal from 'decimal.js';
import { Item } from '../entities/Entities';
import { PricingRule } from '../pricing/PricingRule';
import { DefaultPricingRule } from '../pricing/SpecificPricingRules';

export class Checkout {
    private items: Item[] = [];
    private pricingRule: PricingRule;
    
    constructor(pricingRule?: PricingRule) {
        this.pricingRule = pricingRule ?? new DefaultPricingRule();
    }

    add(item: Item): void {
        this.items.push(item);
    }

    total(): Decimal {
        if (this.items.length === 0) {
            return new Decimal(0);
        }
        const result = this.pricingRule.calculateTotal(this.items);
        return result?.discountedPrice??  new Decimal(0);
    }
}