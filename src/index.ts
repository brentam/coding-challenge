import { Checkout } from "./checkout/Checkout";
import { getCustomerPricingRules } from "./repository/CustomerPricingRepository";
import { classicAd, premiumAd } from "./repository/ItemRepository";
import { secondBite } from "./repository/CustomerPricingRepository";

// just a entry proint to run the application if needed
function entry() {
    const pricingRule = getCustomerPricingRules(secondBite)

    const co: Checkout = new Checkout(pricingRule);
    co.add(classicAd);
    co.add(classicAd);
    co.add(classicAd);
    co.add(premiumAd);

    console.log(`total price ${co.total()}!`);

}

entry();



