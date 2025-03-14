# Coding Challenge

This project is a coding challenge for implementing a checkout system with special pricing rules for privileged customers.


## Assumptions
The requirenments are a bit ambiguous so I will list my assumptions here: 
In real development I would talk with the product ownner to clarify those points.  

1. In this requirentment `Get 20% off any order of $1000 or above.
This is on top of the other pricing rules for MYER`, I am not sure if the percentage should be applied over the total of the original items OR we should apply the other discounts and use that value to determing if we should apply the percentage.
The implementation I have chosen is the latter. The code is in the class `CompositePercentRule` in [`SpecificPricingRules.ts`](src/pricing/SpecificPricingRules.ts)

1. When we have multiple rules that should be applied like in the case of Myer, how should we calculate the final discount?
I decided that we should apply each rule on the original items independently and pick up the one that yields the best discount.
the code for this is in the function `applyRules` in [`SpecificPricingRules.ts`](src/helpers/Helpers.ts)

## Project Structure

- `src/entities/Entities.ts`: Contains the definitions for the `Item` and `Customer` types.
- `src/pricing/PricingRule.ts`: Abstract class for pricing rules.
- `src/pricing/SpecificPricingRules.ts`: Contains specific pricing rule implementations.
- `src/repository/ItemRepository.ts`: Contains the in-memory repository of items.
- `src/repository/CustomerPricingRepository.ts`: Maps customers to their respective pricing rules.
- `src/checkout/Checkout.ts`: Implements the `Checkout` class.
- `src/helper/Helpers.ts`: a few helper functions.
- `src/index.ts`: Entry point of the application.


## Setup

2. Install dependencies:
    ```sh
    npm install
    ```

3. Run the project:
Running the command below will execute a hadcoded rule in index.ts 
    ```sh
    npm start
    ```

## Usage

Here is an example of how to use the `Checkout` class:

```typescript
import { Checkout } from './src/checkout/Checkout';
import { classicAd, standoutAd, premiumAd } from './src/repository/ItemRepository';
import { getCustomerPricingRules } from './src/pricing/CustomerPricingRules';
import { secondBite } from './src/repository/CustomerRepository';

const pricingRules = getCustomerPricingRules(secondBite);
const co = new Checkout(pricingRules);
co.add(classicAd);
co.add(classicAd);
co.add(classicAd);
co.add(premiumAd);
console.log(co.total().toString()); // Should apply the 3 for 2 deal for SecondBite
```

## Testing

To run the tests, use the following command:

```sh
npm test
```

This will execute the tests and verify that the pricing rules and checkout system work as expected.