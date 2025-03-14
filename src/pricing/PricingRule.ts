import Decimal from 'decimal.js';
import { Item, PricingRulesResult } from '../entities/Entities';
import { DefaultPricingRule } from './SpecificPricingRules';

/**
 * Abstract class for pricing rules.
 */
export abstract class PricingRule {

    /**
     * Calculates the total price of the items after applying the pricing rules.
     * 
     * @param items - An array of Item objects to which the pricing rules will be applied.
     * @returns if no rules were applied, we reutrn the total of the items, otherwise we return the discounted price.
     */
    public calculateTotal(items: Item[]): PricingRulesResult {
        const result = this.apply(items);
        if (!result) {
            const total = items.reduce((sum, item) => sum.plus(item.retailPrice), new Decimal(0));
            return { discountedPrice: total };
        }
        return result;
    }


    /**
     * Applies all composed pricing rules and returns the best result.
     * 
     * @param items - An array of Item objects to which the pricing rules will be applied.
     * @returns A PricingRulesResult object containing the discounted price if the rule is applicable, otherwise null.
     */
    abstract apply(items: Item[]): PricingRulesResult | null


}