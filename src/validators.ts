import { DateTime } from 'luxon';

export type ValidationResult = {
    isValid: boolean;
    report: Report;
};

export type Report = {
    rawValue: string;
    attribute: string;
    expected: string;
    actual: string;
};

export interface Validators {
    validate(): ValidationResult;
}

/**
 * not ( undefined, null, '')
 */
export class NotEmptyValidator implements Validators {
    readonly name: string;
    readonly value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }

    validate(): ValidationResult {
        const report: Report = {
            rawValue: String(this.value),
            attribute: this.name,
            expected: 'not empty',
            actual: String(this.value),
        };

        const isValid =
            this.value !== undefined &&
            this.value !== null &&
            this.value !== '';

        return {
            isValid,
            report,
        };
    }
}

/**
 * regexp.pattern.test(value)
 */
export class RegExpValidator implements Validators {
    readonly name: string;
    readonly value: string;
    readonly pattern: RegExp;

    constructor(name: string, value: string, pattern: RegExp) {
        this.name = name;
        this.value = value;
        this.pattern = pattern;
    }

    validate(): ValidationResult {
        const report: Report = {
            rawValue: this.value,
            attribute: this.name,
            expected: `pattern: ${this.pattern}`,
            actual: this.value,
        };

        const isValid = this.pattern.test(this.value);

        return {
            isValid,
            report,
        };
    }
}

/**
 * literalTypes array
 */
export class LiteralTypeCheckValidator implements Validators {
    readonly name: string;
    readonly value: string;
    readonly literalTypes: string[];

    constructor(name: string, value: string, ...literalTypes: string[]) {
        this.name = name;
        this.value = value;
        this.literalTypes = literalTypes;
    }

    validate(): ValidationResult {
        const report: Report = {
            rawValue: this.value,
            attribute: this.name,
            expected: `type: ${this.literalTypes.join('|')}`,
            actual: this.value,
        };

        let isValid = false;
        this.literalTypes.forEach((l) => {
            if (this.value === l) {
                isValid = true;
            }
        });

        return {
            isValid,
            report,
        };
    }
}

/**
 * valid datetime
 */
export class DateTimeValidator implements Validators {
    readonly name: string;
    readonly value: string;
    readonly dateFormat: string;

    constructor(name: string, value: string, dateFormat: string) {
        this.name = name;
        this.value = value;
        this.dateFormat = dateFormat;
    }

    validate(): ValidationResult {
        const report: Report = {
            rawValue: this.value,
            attribute: this.name,
            expected: `dateFormat: ${this.dateFormat}`,
            actual: this.value,
        };
        let dateTime;
        if (this.value !== undefined && this.value !== null) {
            dateTime = DateTimeValidator.getDateTime(
                this.value,
                this.dateFormat,
            );
        }

        const isValid =
            dateTime !== undefined && dateTime !== null && dateTime.isValid;

        return {
            isValid,
            report,
        };
    }
    private static getDateTime(value: string, dateFormat: string): DateTime {
        return DateTime.fromFormat(value, dateFormat);
    }
}

/**
 * ISO datetime
 */
export class ISODateTimeValidator implements Validators {
    readonly name: string;
    readonly value: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }

    validate(): ValidationResult {
        const report: Report = {
            rawValue: this.value,
            attribute: this.name,
            expected: 'valid ISO string. ex: 2011-10-05T14:48:00.000+09:00',
            actual: this.value,
        };

        if (this.value === undefined || this.value === null)
            return { isValid: false, report };
        if (this.value === '') return { isValid: true, report };

        const isValid =
            this.value !== undefined &&
            this.value !== null &&
            DateTime.fromISO(this.value).isValid;

        return {
            isValid,
            report,
        };
    }
}

/**
 * min length
 */
export class MinLengthValidator implements Validators {
    readonly name: string;
    readonly value: string;
    readonly minLength: number;

    constructor(name: string, value: string, minLength: number) {
        this.name = name;
        this.value = value;
        this.minLength = minLength;
    }

    validate(): ValidationResult {
        let actual: number;

        if (this.value === undefined || this.value === null) {
            actual = 0;
        } else {
            actual = this.value.length;
        }

        const report: Report = {
            rawValue: this.value,
            attribute: this.name,
            expected: `min length: ${this.minLength}`,
            actual: actual.toString(),
        };

        const isValid = this.minLength <= actual;

        return {
            isValid,
            report,
        };
    }
}

/**
 * max length
 */
export class MaxLengthValidator implements Validators {
    readonly name: string;
    readonly value: string;
    readonly maxLength: number;

    constructor(name: string, value: string, maxLength: number) {
        this.name = name;
        this.value = value;
        this.maxLength = maxLength;
    }

    validate(): ValidationResult {
        let actual: number;

        if (this.value === undefined || this.value === null) {
            actual = 0;
        } else {
            actual = this.value.length;
        }

        const report: Report = {
            rawValue: this.value,
            attribute: this.name,
            expected: `max length: ${this.maxLength}`,
            actual: actual.toString(),
        };

        const isValid = actual <= this.maxLength;

        return {
            isValid,
            report,
        };
    }
}

/**
 * number
 */
export class NumberRangeValidator implements Validators {
    readonly name: string;
    readonly value: number;
    readonly min: number;
    readonly max: number;

    constructor(name: string, value: number, min: number, max: number) {
        this.name = name;
        this.value = value;
        this.min = min;
        this.max = max;
    }

    validate(): ValidationResult {
        const actual: number = this.value;

        const report: Report = {
            rawValue: String(this.value),
            attribute: this.name,
            expected: `between: ${this.min} - ${this.max}`,
            actual: actual.toString(),
        };

        const isValid =
            !isNaN(actual) && this.min <= actual && actual <= this.max;

        return {
            isValid,
            report,
        };
    }
}

/**
 * includes
 */
export class ContainsValidator implements Validators {
    readonly name: string;
    readonly value: string;
    readonly master: string[];

    constructor(name: string, value: string, master: string[]) {
        this.name = name;
        this.value = value;
        this.master = master;
    }

    validate(): ValidationResult {
        const actual = this.value;

        const isValid = this.master.includes(actual);

        const report: Report = {
            rawValue: String(this.value),
            attribute: this.name,
            expected: `${JSON.stringify(this.master)} contains.`,
            actual: isValid.toString(),
        };

        return {
            isValid,
            report,
        };
    }
}

/**
 *  multiple Validator and composite
 */
export class CompositeValidator implements Validators {
    readonly validators: Validators[];

    constructor(...validators: (Validators | undefined)[]) {
        this.validators = validators.filter(Boolean) as Validators[];
    }

    validate(): ValidationResult {
        let result: ValidationResult = {
            isValid: false,
            report: {
                attribute: 'validators',
                rawValue: JSON.stringify(this.validators),
                expected: 'at least one validator',
                actual: String(this.validators.length),
            },
        };
        if (this.validators.length === 0) {
            return result;
        }
        for (const v of this.validators) {
            result = v.validate();
            if (!result.isValid) {
                return result;
            }
        }
        return {
            ...result,
            isValid: true,
        };
    }
}

/**
 * multiple Validator or composite
 */
export class OrCompositeValidator implements Validators {
    readonly validators: Validators[];

    constructor(...validators: Validators[]) {
        this.validators = validators;
    }

    validate(): ValidationResult {
        const defaultResult: ValidationResult = {
            isValid: false,
            report: {
                attribute: 'validators',
                rawValue: JSON.stringify(this.validators),
                expected: 'at least one validator',
                actual: String(this.validators.length),
            },
        };
        if (this.validators.length === 0) {
            return defaultResult;
        }

        return this.validators.reduce(
            (
                previousResult: ValidationResult,
                validator: Validators,
            ): ValidationResult => {
                const thisResult = validator.validate();

                return {
                    isValid: previousResult.isValid || thisResult.isValid,
                    report:
                        !previousResult.isValid && !thisResult.isValid
                            ? thisResult.report
                            : previousResult.report,
                };
            },
            defaultResult,
        );
    }
}
