TypeScript validator
---

Validate your value.

### How to use

* Basic usage: validate individual values by factory
* Application: Create checkable interface, for example
* Advanced: Create your own validator (and PR!)


### install

```
yarn add @cm-madlabs/ts-validator
```


Validate individual values by factory
---

```ts
import * as tv from '@cm-madlabs/ts-validator';

const age = '22a';
const result = tv.Factory.numberFormatValidator(
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

