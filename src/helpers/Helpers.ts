import Decimal from 'decimal.js';
import { Item, PricingRulesResult } from '../entities/Entities';
import { PricingRule } from '../pricing/PricingRule';

export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
    return array.reduce(
        ([pass, fail], elem) => {
            return predicate(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
        },
        [[], []] as [T[], T[]]
    );
}

/**
 *  helper function to help apply the rules if we have sub rules
 *  The requirenment is a bit ambiguos, if we have several what should we do?
 *  I assumed we would apply the one that gives the best discount
 */
export const applyRules = (items: Item[], rules: PricingRule[]): PricingRulesResult | null => {
    let bestTotal = new Decimal(Infinity);

    for (const rule of rules) {
        const result = rule.apply(items);
        if (result && result.discountedPrice.lessThan(bestTotal)) {
            bestTotal = result.discountedPrice;
        }
    }

    if (bestTotal.equals(new Decimal(Infinity))) {
        return null;
    }

    return { discountedPrice: bestTotal };
};
