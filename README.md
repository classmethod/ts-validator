TypeScript validator
---

Validate your value.

### How to use

* Basic usage: validate individual values.


Validate individual values
---

```ts
import * as tv from '@cm-madlabs/ts-validator';

const age = '22a';
const result = tv.ValidatorFactory.numberFormatValidator(
    'age',
    age,
    1,
    3,
).validate();

console.log(JSON.stringify(result));
// {"isValid":false,"report":{"rawValue":"22a","attribute":"age","expected":"pattern: /^[0-9]+$/","actual":"22a"}}


// We can applicate to throw error, for example.
if (!result.isValid) {
    throw new Error(JSON.stringify(result.report));
}
// Error: {"rawValue":"22a","attribute":"age","expected":"pattern: /^[0-9]+$/","actual":"22a"}
//       at Object.<anonymous>


```

