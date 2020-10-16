![](coverage/badge-branches.svg)
![](coverage/badge-functions.svg)
![](coverage/badge-lines.svg)
![](coverage/badge-statements.svg)

TypeScript validator
---

Validate your value.

### How to use

* Basic usage: validate individual values using factory
* Application: Create checkable interface, for example
* Advanced: Create your own validator (and PR!)


### install

```
yarn add @cm-madlabs/ts-validator
```


Validate individual values using factory
---

`Factory` is utility function-kit to validate your value.  

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

In application usage
---

In your application, we recommend you to define a validatable domain object  -- embedding this validators.

examples/user-domain.ts
```ts
import * as v from '@cm-madlabs/ts-validator';
import { Validator } from '@cm-madlabs/ts-validator';
import { ValidationResult } from '@cm-madlabs/ts-validator';

export abstract class Checkable {
    readonly validator: v.Validator;

    protected constructor(validator: Validator) {
        this.validator = validator;
    }

    check(): v.ValidationResult {
        return this.validator.validate();
    }
}

export class Name extends Checkable {
    static readonly key = 'name';

    constructor(readonly value: string) {
        super(v.Factory.lengthValidator(Name.key, value, 1, 100));
        this.value = value;
    }
}

export class LoginStatus extends Checkable {
    static readonly key = 'login_status';
    static readonly possibleValue = ['LoggedIn', 'Logout'];

    constructor(readonly value: string) {
        super(
            v.Factory.containsValidator(
                LoginStatus.key,
                value,
                LoginStatus.possibleValue,
            ),
        );
        this.value = value;
    }
}

export class UserDomainObject {
    name: Name;
    type: LoginStatus;

    static of({
        name,
        status,
    }: {
        name: string;
        status: string;
    }): UserDomainObject {
        const obj = new UserDomainObject();
        obj.name = new Name(name);
        obj.type = new LoginStatus(status);
        return obj;
    }

    validateAll(): ValidationResult[] {
        return Object.values(this).map((checkable: Checkable) =>
            checkable.check(),
        );
    }
}

const user = UserDomainObject.of({
    name: 'waddy',
    status: '',
});

const validateResult: ValidationResult[] = user.validateAll();
const invalids = validateResult.filter((r) => !r.isValid);
if (invalids.length) {
    const report = JSON.stringify(invalids.map((r) => r.report));
    console.error(report);
    throw new Error(JSON.stringify(report));
} else {
    // do your stuff
    console.log('do your stuff');
}

```
`yarn ts-node examples/user-domain.ts` will raise exception.


Advanced: Create your own validator
---

You can define your own validator and factory.

### 1. Define factory 
 
If our repository validator make sense, your task is only to define composite factory.
For example, length `5` or `7` postal code validator:

```ts
import {
    CompositeValidator,
    MaxLengthValidator,
    MinLengthValidator,
    OrCompositeValidator,
    Validator,
} from '@cm-madlabs/ts-validator';

export function postalCodeValidator(value: string): Validator {
    const key = 'postal_code';
    const minFive = new MinLengthValidator(key, value, 5);
    const maxFive = new MaxLengthValidator(key, value, 5);

    const minSeven = new MinLengthValidator(key, value, 7);
    const maxSeven = new MaxLengthValidator(key, value, 7);

    const five = new CompositeValidator(minFive, maxFive);
    const seven = new CompositeValidator(minSeven, maxSeven);

    return new OrCompositeValidator(five, seven);
}
``` 



### 2. Define validator

Otherwise, you can also define your own Validator:

```ts
export class SjisZenkakuValidator implements Validator {
    readonly name: string;
    readonly value: string;
    readonly patternSjis: RegExp = new RegExp('^[81-9f|e0-fc]+$');

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }

    validate(): ValidationResult {
        const pattern = this.patternSjis;

        function check(v: string): boolean {
            
            const buffer = Buffer.from(v);
            const sjisBytes = encoding.convert(buffer, 'SJIS');

            // bytes
            const byteLength = sjisBytes.length;

            // get first
            const leftByte = (sjisBytes[0] & 0xff).toString(16);

            // mulibytes && character is valid
            return byteLength === 2 && pattern.test(leftByte);
        }

        const isValid = this.value
            .split('')
            .map(check)
            .reduce((pre, cur) => pre && cur, true);

        return {
            isValid,
            report: {
                attribute: this.name,
                rawValue: this.value,
                expected: `sjis pattern: ${this.patternSjis}`,
                actual: this.value,
            },
        };
    }
}
```