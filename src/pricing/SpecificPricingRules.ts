import Decimal from 'decimal.js';
import { Item, PricingRulesResult } from '../entities/Entities';
import { applyRules, partition } from '../helpers/Helpers';
import { PricingRule } from './PricingRule';


/**
 * Default pricing rule that sums the total of the items without any discounts.
 * This just returns the sum of the retail prices of the items.
 */
export class DefaultPricingRule extends PricingRule {
    apply(items: Item[]): PricingRulesResult | null {
        const total = items.reduce((sum, item) => sum.plus(item.retailPrice), new Decimal(0));
        return { discountedPrice: total };
    }
}

/**
 * Applies a X for Y deal to the given items.
 * @param itemType - The item type to which the deal applies.
 * @param requiredQuantity- The number of items required to get the deal.
 * @param chargeQuantity- The number of items that will be charged.
 */
export class XForYDealPricingRule extends PricingRule {
    constructor(private itemType: Item, private requiredQuantity: number, private chargeQuantity: number) {
        super();
    }

    apply(items: Item[]): PricingRulesResult | null {
        if (this.chargeQuantity >= this.requiredQuantity) return null;

        let total = new Decimal(0);
        const [applicableItems, otherItems] = partition(items, item => item.id === this.itemType.id);

        if (applicableItems.length >= this.requiredQuantity) {
            total = total.plus(new Decimal(Math.floor(applicableItems.length / this.requiredQuantity) * this.chargeQuantity).times(applicableItems[0].retailPrice));
            total = total.plus(new Decimal(applicableItems.length % this.requiredQuantity).times(applicableItems[0].retailPrice));
            total = total.plus(otherItems.reduce((sum, item) => sum.plus(item.retailPrice), new Decimal(0)));
            return { discountedPrice: total };
        } else {
            return null;
        }
    }
}

/**
 * Applies a fixed price deal to the given items.
 * 
 * @param itemsType - The item type to which the deal applies.
 * @param fixedPrice - The new fixed price for the items of the itemType (if new fixed price is smaller than the itemType). 
 * @returns A PricingRulesResult object containing the discounted price if the rule is applicable, otherwise null.
 */
export class FixedPriceDeal extends PricingRule {
    constructor(private itemType: Item, private fixedPrice: Decimal) {
        super();
    }

    apply(items: Item[]): PricingRulesResult | null {
        let total = new Decimal(0);
        // we should apply the rule only if the fixed price is less than the retail price
        const [applicableItems, otherItems] = partition(items, item => (item.id === this.itemType.id && this.fixedPrice.lt(item.retailPrice)));

        if (applicableItems.length >= 1) {
            total = total.plus(this.fixedPrice.times(applicableItems.length));
            total = total.plus(otherItems.reduce((sum, item) => sum.plus(item.retailPrice), new Decimal(0)));
            return { discountedPrice: total };
        } else {
            return null;
        }
    }
}

/**
 * Applies a free item deal if a certain quantity of another item exists.
 * 
 * @param items - An array of Item objects to which the pricing rule will be applied.
 * @returns A PricingRulesResult object containing the discounted price if the rule is applicable, otherwise null.
 */
export class FreeItemWithAnother extends PricingRule {
    constructor(private requiredItemType: Item, private requiredQuantity: number, private freeItemType: Item) {
        super();
    }

    apply(items: Item[]): PricingRulesResult | null {
        let total = new Decimal(0);
        const [requiredItems, otherItems] = partition(items, item => item.id === this.requiredItemType.id);
        const [freeItems, remainingItems] = partition(otherItems, item => item.id === this.freeItemType.id);
        if (requiredItems.length >= this.requiredQuantity && freeItems.length > 0) {
            total = total.plus(new Decimal(requiredItems.length).times(requiredItems[0].retailPrice));
            total = total.plus(new Decimal(freeItems.length - 1).times(freeItems[0].retailPrice)); // One free item
            total = total.plus(remainingItems.reduce((sum, item) => sum.plus(item.retailPrice), new Decimal(0)));
            return { discountedPrice: total };
        } else {
            return null;
        }
    }
}

/**
 * Concrete implementation of PricingRule that applies a discount rate.
 * if the total after other discounts exceeds the specified threshold.
 * Question: not sure about this requirement `This is on top of the other pricing rules for MYER`
 * Assumption: I assumed we will check the amount yieded by the other "inner" to check against the threshold.
 * 
 * 
 * @param rules - An array of PricingRule objects 
 * @param threshold - The total price threshold that must be exceeded for the discount to be applied.
 * @param discountRate - The discount rate to be applied if the threshold is exceeded.
 */
export class CompositePercentRule extends PricingRule {
    private threshold: Decimal;
    private discountRate: Decimal;
    private rules: PricingRule[];

    constructor(rules: PricingRule[], threshold: Decimal, discountRate: Decimal) {
        super();
        this.threshold = threshold;
        this.discountRate = discountRate;
        this.rules = rules;
    }

    apply(items: Item[]): PricingRulesResult | null {
        const theResult = applyRules(items, this.rules);
        if (!theResult) {
            return null;
        }
        if (theResult && theResult.discountedPrice.greaterThanOrEqualTo(this.threshold)) {
            theResult.discountedPrice = theResult.discountedPrice.times(new Decimal(1).minus(this.discountRate));
        }
        return theResult;
    }
}

/**
 * Concrete implementation to use when holding multi rules
 * e.g. someCustomer -> new MultiRule([new XForYDealPricingRule(classicAd, 3, 2),new FixedPriceDeal(standoutAd, new Decimal(299.99))])],
 * 
 * @param rules - An array of PricingRule objects 
 */
export class MultiRule extends PricingRule {
    private rules: PricingRule[];

    constructor(rules: PricingRule[]) {
        super();
        this.rules = rules;
    }

    apply(items: Item[]): PricingRulesResult | null {
        return applyRules(items, this.rules);
    }
}