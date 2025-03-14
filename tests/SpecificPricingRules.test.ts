import Decimal from 'decimal.js';
import { Item } from '../src/entities/Entities';
import { DefaultPricingRule, XForYDealPricingRule, FixedPriceDeal, FreeItemWithAnother, CompositePercentRule } from '../src/pricing/SpecificPricingRules';

describe('SpecificPricingRules', () => {
    const classicAd: Item = {
        id: 1,
        name: "Classic Ad",
        description: "Offers the most basic level of advertisement",
        retailPrice: new Decimal(269.99)
    };

    const standoutAd: Item = {
        id: 2,
        name: "Standout Ad",
        description: "Allows advertisers to use a company logo and use a longer presentation text",
        retailPrice: new Decimal(322.99)
    };

    const premiumAd: Item = {
        id: 3,
        name: "Premium Ad",
        description: "Same benefits as Standout Ad, but also puts the advertisement at the top of the results, allowing higher visibility",
        retailPrice: new Decimal(394.99)
    };

    describe('DefaultPricingRule', () => {
        it('should sum the total of the items without any discounts', () => {
            const rule = new DefaultPricingRule();
            const items = [classicAd, standoutAd, premiumAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('987.97');
        });
    });

    describe('XForYDealPricingRule', () => {
        it('should calculateTotal the 3 for 2 ', () => {
            const rule = new XForYDealPricingRule(classicAd, 3, 2);
            const items = [classicAd, classicAd, classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('539.98'); // 3 for the price of 2, plus 1 more
        });

        it('should calculateTotal the 3 for 2 when more than 3 ads', () => {
            const rule = new XForYDealPricingRule(classicAd, 3, 2);
            const items = [classicAd, classicAd, classicAd, classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('809.97'); // 3 for the price of 2, plus 1 more
        });

        it('should calculateTotal the 3 for 2 when having multiples of 3 ads', () => {
            const rule = new XForYDealPricingRule(classicAd, 3, 2);
            const items = [classicAd, classicAd, classicAd, classicAd, classicAd, classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('1079.96'); // 6 for the price of 4, plus 1 more
        });

        it('should return all original items total if the rule is not applicable', () => {
            const rule = new XForYDealPricingRule(classicAd, 3, 2);
            const items = [classicAd, classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('539.98');
        });

        it('should return all original items total if the rule chargeQuantity is gte than requiredQuantity', () => {
            const rule = new XForYDealPricingRule(classicAd, 3, 3);
            const items = [classicAd, classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('539.98');
        });
    });

    describe('FixedPriceDeal', () => {
        it('should calculateTotal the fixed price deal', () => {
            const rule = new FixedPriceDeal(standoutAd, new Decimal(299.99));
            const items = [standoutAd, standoutAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('599.98'); // 2 * 299.99
        });

        it('should return all original items total when no ads match the itemType', () => {
            const rule = new FixedPriceDeal(standoutAd, new Decimal(299.99));
            const items = [classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('269.99');
        });

        it('should return all original items total if the rule fixed price is greater than that itemType price ', () => {
            const rule = new FixedPriceDeal(standoutAd, new Decimal(1099.99));
            const items = [standoutAd, standoutAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('645.98');  // 2 * 322.99
        });
    });

    describe('FreeItemWithAnother', () => {
        it('should calculateTotal the free item deal', () => {
            const rule = new FreeItemWithAnother(classicAd, 3, standoutAd);
            const items = [classicAd, classicAd, classicAd, standoutAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('809.97'); // 3 classic ads + 1 free standout ad
        });

        it('should calculateTotal the free item deal when more than one free item type exists', () => {
            const rule = new FreeItemWithAnother(classicAd, 3, standoutAd);
            const items = [classicAd, classicAd, classicAd, standoutAd, standoutAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('1132.96');
            // 3 classic ads + 
            // 1 free standout + another charged standout   
        });

        it('should return all original items total if there are not enough ads', () => {
            const rule = new FreeItemWithAnother(classicAd, 3, standoutAd);
            const items = [classicAd, classicAd, standoutAd];
            const result = rule.calculateTotal(items); //2x 269.99 + 322.99
            expect(result?.discountedPrice.toString()).toBe('862.97');
        });
    });

    describe('TwentyPercentRule', () => {
        it('should calculateTotal the 20% discount if the total exceeds the threshold', () => {
            const rule = new CompositePercentRule([new DefaultPricingRule()], new Decimal(1000), new Decimal(0.2));
            const items = [classicAd, classicAd, classicAd, classicAd, classicAd, classicAd, classicAd, classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('1727.936'); // 2159.92 * 0.8
        });

        // it should run the
        it('should calculateTotal the 20% discount after other inner rules are applied', () => {
            const rule = new CompositePercentRule([new FixedPriceDeal(standoutAd, new Decimal(299.99))]
                , new Decimal(1000), new Decimal(0.2));
            const items = [standoutAd, standoutAd, standoutAd, standoutAd, standoutAd, standoutAd]
            const result = rule.calculateTotal(items);
            //initial price of all 6 items 1937.94
            //after the "inner rule" FixedPriceDeal is applied we get 1799.94
            //20% discount is applied to 1799.94 and we get 1439.952
            expect(result?.discountedPrice.toString()).toBe('1439.952'); // 1799.94 * 0.8
        });

        it('should not calculateTotal the 20% discount if the total does not exceed the threshold', () => {
            const rule = new CompositePercentRule([new DefaultPricingRule()], new Decimal(1000), new Decimal(0.2));
            const items = [classicAd, classicAd, classicAd];
            const result = rule.calculateTotal(items);
            expect(result?.discountedPrice.toString()).toBe('809.97'); // No discount applied
        });
    });
});
