import { Item } from "../entities/Entities";
import Decimal from 'decimal.js';

/*
    This repository is a simple in-memory repository that stores the products/items that can be purchased.
    In real world scenarios, this would be replaced by a database or some other form of persistent storage.
*/

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

export { classicAd, standoutAd, premiumAd };