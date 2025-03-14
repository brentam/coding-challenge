import { Checkout } from '../src/checkout/Checkout';
import { getCustomerPricingRules } from '../src/repository/CustomerPricingRepository';
import { classicAd, premiumAd, standoutAd } from '../src/repository/ItemRepository';
import { defaultCustomer, secondBite, axilCoffeeRoasters, myer } from "../src/repository/CustomerPricingRepository";

describe('Checkout', () => {
    describe('Default Customer', () => {
        it('should calculate total for default customer with one of each ad', () => {
            const pricingRule = getCustomerPricingRules(defaultCustomer);
            const co = new Checkout(pricingRule);
            co.add(classicAd);
            co.add(standoutAd);
            co.add(premiumAd);
            expect(co.total().toString()).toBe('987.97');
        });

        it('should calculate total for default customer with multiple ads', () => {
            const pricingRule = getCustomerPricingRules(defaultCustomer);
            const co = new Checkout(pricingRule);
            co.add(classicAd);
            co.add(classicAd);
            co.add(standoutAd);
            co.add(premiumAd);
            expect(co.total().toString()).toBe('1257.96');
        });
    });

    describe('SecondBite Customer', () => {
        it('should calculate total for SecondBite customer with 3 classic ads and 1 premium ad', () => {
            const pricingRule = getCustomerPricingRules(secondBite);
            const co = new Checkout(pricingRule);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(premiumAd);
            expect(co.total().toString()).toBe('934.97');
        });

        it('should calculate total for SecondBite customer with 6 classic ads', () => {
            const pricingRule = getCustomerPricingRules(secondBite);
            const co = new Checkout(pricingRule);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            expect(co.total().toString()).toBe('1079.96');
        });
    });

    describe('Axil Coffee Roasters Customer', () => {
        it('should calculate total for Axil Coffee Roasters customer with 3 standout ads and 1 premium ad', () => {
            const pricingRule = getCustomerPricingRules(axilCoffeeRoasters);
            const co = new Checkout(pricingRule);
            co.add(standoutAd);
            co.add(standoutAd);
            co.add(standoutAd);
            co.add(premiumAd);
            expect(co.total().toString()).toBe('1294.96');
        });

        it('should calculate total for Axil Coffee Roasters customer with 1 standout ad and 1 premium ad', () => {
            const pricingRule = getCustomerPricingRules(axilCoffeeRoasters);
            const co = new Checkout(pricingRule);
            co.add(standoutAd); // this should be discounted 299.99
            co.add(premiumAd);  // this should be 394.99
            expect(co.total().toString()).toBe('694.98');
        });
    });

    describe('MYER Customer', () => {

        /*
          the total original price => 5*322.99 + 394.99 = 2067.93
          two rule will apply in this case:
            1. 5 for 4 standout ads => (5 * 322.99)- 322.99 +394.99 = 1686.95
            2. Fixed priced deal for premium, total with discount => 5*322.99 + ​389.99 = 2004.94
            
            so we pick the one with the best discount => 1686.95
            since the total is above 1000, we apply 20% discount on top of that => 1349.56
        */
        it('should calculate percentage after apply inner discounts {5for4 or FixedDeal}', () => {
            const pricingRule = getCustomerPricingRules(myer);
            const co = new Checkout(pricingRule);
            co.add(standoutAd);
            co.add(standoutAd);
            co.add(standoutAd);
            co.add(standoutAd);
            co.add(standoutAd);
            co.add(premiumAd);
            expect(co.total().toString()).toBe('1349.56');
        });


        /*
          total original price=> 5*269.99 + 322.99 + 394.99 = 2067.93
          two rules will apply in this case
            1. Fixed priced deal for premium, total with discount => 5*269.99 + 322.99 + ​389.99 = 2062.93​
            2. FreeItemWithAnother(1 free standout if 3 or more classic ads) =>5*269.99 + 322.99 - 322.99 + 394.99  = 1744.94
        
            so we pick the one with the best discount => 1744.94
            since the total is above 1000, we apply 20% discount on top of that => 1395.952
        
        */
        it('should calculate percentage after apply inner discounts {FixedDeal or FreeItem}', () => {
            const pricingRule = getCustomerPricingRules(myer);
            const co = new Checkout(pricingRule);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(standoutAd);
            co.add(premiumAd);

            expect(co.total().toString()).toBe('1395.952');
        });


        /*
          total original price=> 3*269.99 + 322.99 = 1132.96
          one rules will apply in this case
            1. Get 1 free Stand out Ad when purchasing 3 or more Classic Ads. => ​1132.96 - 322.99 = 809.97
        
            since the total after the inner rules is 809.97, since it is below 1000,
            we do not apply the 20% discount
        */
        it('should calculate total without percentage when the previous selected discounts bring the total below 1000', () => {
            const pricingRule = getCustomerPricingRules(myer);
            const co = new Checkout(pricingRule);
            co.add(classicAd);
            co.add(classicAd);
            co.add(classicAd);
            co.add(standoutAd);

            expect(co.total().toString()).toBe('809.97');
        });

    });
});