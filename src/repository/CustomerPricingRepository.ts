import Decimal from 'decimal.js';
import { classicAd, standoutAd, premiumAd } from './ItemRepository';
import { Customer } from '../entities/Entities';
import { PricingRule } from '../pricing/PricingRule';
import { CompositePercentRule, XForYDealPricingRule, FixedPriceDeal, FreeItemWithAnother, DefaultPricingRule } from '../pricing/SpecificPricingRules';

/*
    This repository is a simple in-memory repository that stores 
    the Customers and the Customers<->PricingRule relationship for the application.
    In real world scenarios, this would be replaced by a database/ws or some other form of persistent storage.
*/


// this represent a default custormer,
// for the purpose of this project, a single customer with no pricing rules is enough.
// in real world scenario, we would have several customers without pricing rules.
const defaultCustomer: Customer = { id: 1, name: "Default" };

// other customers according to the requirements
const secondBite: Customer = { id: 2, name: "SecondBite" };
const axilCoffeeRoasters: Customer = { id: 3, name: "Axil Coffee Roasters" };
const myer: Customer = { id: 4, name: "MYER" };


// this map stores the pricing rules for each customer
const customerPricingRules: Map<number, PricingRule> = new Map<number, PricingRule>([
    [secondBite.id, new XForYDealPricingRule(classicAd, 3, 2)],
    [axilCoffeeRoasters.id, new FixedPriceDeal(standoutAd, new Decimal(299.99))],
    [myer.id,
    new CompositePercentRule([
        new XForYDealPricingRule(standoutAd, 5, 4),
        new FixedPriceDeal(premiumAd, new Decimal(389.99)),
        new FreeItemWithAnother(classicAd, 3, standoutAd)
    ], new Decimal(1000), new Decimal(0.2))
    ]
]);

export function getCustomerPricingRules(customer: Customer): PricingRule {
    return customerPricingRules.get(customer.id) || new DefaultPricingRule();
}

export { customerPricingRules, defaultCustomer, secondBite, axilCoffeeRoasters, myer };

