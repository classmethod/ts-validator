import {
    CompositeValidator,
    MaxLengthValidator,
    MinLengthValidator,
    OrCompositeValidator,
    Validator,
} from '../src';

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
