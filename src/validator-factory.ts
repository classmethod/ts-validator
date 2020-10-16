import {
    CompositeValidator,
    ContainsValidator,
    ISODateTimeValidator,
    LiteralTypeCheckValidator,
    MaxLengthValidator,
    MinLengthValidator,
    NotEmptyValidator,
    NumberRangeValidator,
    OrCompositeValidator,
    RegExpValidator,
    Validator,
} from './validator';
import * as regexp from './regexp';

/**
 * general purpose `and` validator.
 * @param name parameter name
 * @param value parameter value
 * @param minLength
 * @param maxLength
 * @param format
 */
export function formatValidator({
    name,
    value,
    minLength,
    maxLength,
    format,
}: {
    name: string;
    value: string;
    minLength?: number;
    maxLength?: number;
    format?: RegExp;
}): Validator {
    const required = new NotEmptyValidator(name, value);
    const min = minLength
        ? new MinLengthValidator(name, value, minLength)
        : undefined;
    const max = maxLength
        ? new MaxLengthValidator(name, value, maxLength)
        : undefined;
    const f = format ? new RegExpValidator(name, value, format) : undefined;
    return new CompositeValidator(required, min, max, f);
    1;
}

/**
 * NotEmpty
 */
export function notEmptyValidator(name: string, value: string): Validator {
    return new NotEmptyValidator(name, value);
}

/**
 * NotEmpty && UUIDv4
 */
export function uuidV4CheckValidator(name: string, value: string): Validator {
    const required = new NotEmptyValidator(name, value);
    const r = new RegExpValidator(name, value, regexp.UUIDv4RegExp);
    return new CompositeValidator(required, r);
}

/**
 * NotEmpty && NumberRegex && NumberRange
 */
export function numberRangeValidator(
    name: string,
    value: string,
    min: number,
    max: number,
): Validator {
    const required = new NotEmptyValidator(name, value);
    const f = new RegExpValidator(name, value, regexp.NumberRegExp);
    const range = new NumberRangeValidator(name, Number(value), min, max);
    return new CompositeValidator(required, f, range);
}

/**
 * NotEmpty && MinLength && MaxLength
 */
export function lengthValidator(
    name: string,
    value: string,
    minLength: number,
    maxLength: number,
): Validator {
    const notEmpty = new NotEmptyValidator(name, value);
    const min = new MinLengthValidator(name, value, minLength);
    const max = new MaxLengthValidator(name, value, maxLength);
    return new CompositeValidator(notEmpty, min, max);
}

/**
 * Same as `Array.includes`. But we can get validation report.
 */
export function containsValidator(
    name: string,
    value: string,
    master: string[],
): Validator {
    const notNull = new NotEmptyValidator(name, value);
    const contains = new ContainsValidator(name, value, master);
    return new CompositeValidator(notNull, contains);
}

/**
 * literal check
 */
export function literalCheckValidator(
    name: string,
    value: string,
    ...literalTypes: string[]
): Validator {
    return new LiteralTypeCheckValidator(name, value, ...literalTypes);
}

/**
 * ISODateTimeValidator
 */
export function isoDateValidator(name: string, value: string): Validator {
    return new ISODateTimeValidator(name, value);
}

/**
 * alphanumeric regex
 */
export function alphanumericValidator(
    name: string,
    value: string,
    minLength: number,
    maxLength: number,
): Validator {
    return formatValidator({
        name,
        value,
        minLength,
        maxLength,
        format: regexp.AlphanumericReqExp,
    });
}

/**
 * number regex
 */
export function numberFormatValidator(
    name: string,
    value: string,
    minLength: number,
    maxLength: number,
): Validator {
    return formatValidator({
        name,
        value,
        maxLength,
        minLength,
        format: regexp.NumberRegExp,
    });
}

/**
 * empty string ''
 */
export function emptyStringValidator(name: string, value: string): Validator {
    return literalCheckValidator(name, value, '');
}

/**
 * and
 */
export function and(...validators: Validator[]): Validator {
    return new CompositeValidator(...validators);
}

/**
 * or
 */
export function or(...validators: Validator[]): Validator {
    return new OrCompositeValidator(...validators);
}
