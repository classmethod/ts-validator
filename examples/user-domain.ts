import * as v from '../src/index';
import { Validator } from '../src';
import { ValidationResult } from '../src';

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
