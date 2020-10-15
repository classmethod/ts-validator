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
 * バリデーターのファクトリクラス
 */
export class ValidatorFactory {
    /**
     * UUIDv4
     */
    static readonly UUIDv4RegExp = new RegExp(
        '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
    );

    // CloudFormation Stack Name regex
    static readonly CfnStackNameRegExp = new RegExp('^[A-Za-z][A-Za-z0-9-]*$');

    /**
     * 数字
     */
    static readonly NumberRegExp = new RegExp('^[0-9]+$');

    /**
     * 半角英数字
     */
    static readonly AlphanumericReqExp = new RegExp('^[a-zA-Z0-9]*$');

    /**
     * フォーマットチェック汎用バリデーター
     * @param name
     * @param value
     * @param minLength
     * @param maxLength
     * @param format
     */
    public static formatValidator(
        name: string,
        value: string,
        minLength: number,
        maxLength: number,
        format: RegExp,
    ): Validators {
        const required = new NotEmptyValidator(name, value);
        const min = new MinLengthValidator(name, value, minLength);
        const max = new MaxLengthValidator(name, value, maxLength);
        const f = new RegExpValidator(name, value, format);
        return new CompositeValidator(required, min, max, f);
    }

    /**
     * Null or Emptyチェック
     */
    static notEmptyValidator(name: string, value: string): Validators {
        return new NotEmptyValidator(name, value);
    }

    /**
     * UUIDv4チェック
     */
    static uuidV4CheckValidator(name: string, value: string): Validators {
        const required = new NotEmptyValidator(name, value);
        const r = new RegExpValidator(
            name,
            value,
            ValidatorFactory.UUIDv4RegExp,
        );
        return new CompositeValidator(required, r);
    }

    /**
     * 数値チェック
     *
     * @param name プロパティ名
     * @param value 値（string）
     * @param min 最小値
     * @param max 最大値
     */
    static numberRangeValidator(
        name: string,
        value: string,
        min: number,
        max: number,
    ): Validators {
        const required = new NotEmptyValidator(name, value);
        const f = new RegExpValidator(
            name,
            value,
            ValidatorFactory.NumberRegExp,
        );
        const range = new NumberRangeValidator(name, Number(value), min, max);
        return new CompositeValidator(required, f, range);
    }

    /**
     * 文字列桁数チェック（必須）
     * @param name
     * @param value
     * @param minLength
     * @param maxLength
     */
    static lengthValidator(
        name: string,
        value: string,
        minLength: number,
        maxLength: number,
    ): Validators {
        const notEmpty = new NotEmptyValidator(name, value);
        const min = new MinLengthValidator(name, value, minLength);
        const max = new MaxLengthValidator(name, value, maxLength);
        return new CompositeValidator(notEmpty, min, max);
    }

    /**
     * リストに含まれている値かどうかをチェクする。
     * Enum値に有効。
     *
     * @param name プロパティ名
     * @param value 値（string）
     * @param master 判定対象マスタ
     */
    static containsValidator(
        name: string,
        value: string,
        master: string[],
    ): Validators {
        const notNull = new NotEmptyValidator(name, value);
        const contains = new ContainsValidator(name, value, master);
        return new CompositeValidator(notNull, contains);
    }

    /**
     * リテラル型のチェック
     * @param name
     * @param value
     * @param literalTypes
     */
    static literalCheckValidator(
        name: string,
        value: string,
        ...literalTypes: string[]
    ): Validators {
        return new LiteralTypeCheckValidator(name, value, ...literalTypes);
    }

    /**
     * ISO形式の日付チェック
     * @param name
     * @param value
     */
    static isoDateValidator(name: string, value: string): Validators {
        return new ISODateTimeValidator(name, value);
    }

    /**
     * 半角英数字チェック
     * @param name
     * @param value
     * @param minLength
     * @param maxLength
     */
    static alphanumericValidator(
        name: string,
        value: string,
        minLength: number,
        maxLength: number,
    ): Validators {
        return ValidatorFactory.formatValidator(
            name,
            value,
            minLength,
            maxLength,
            ValidatorFactory.AlphanumericReqExp,
        );
    }

    /**
     * 数字のみかチェック
     * @param name
     * @param value
     * @param minLength
     * @param maxLength
     */
    static numberFormatValidator(
        name: string,
        value: string,
        minLength: number,
        maxLength: number,
    ): Validators {
        return ValidatorFactory.formatValidator(
            name,
            value,
            minLength,
            maxLength,
            ValidatorFactory.NumberRegExp,
        );
    }

    /**
     * 空文字列であることをピンポイントにチェックするバリデータ
     * @param name name
     * @param value value
     */
    static emptyStringValidator(name: string, value: string): Validators {
        return ValidatorFactory.literalCheckValidator(name, value, '');
    }

    /**
     * 複数のバリデータを指定し、すべてパスしていればOKとする
     * @param validators すべてパスしていれば良いとするバリデータ
     */
    static and(...validators: Validators[]): Validators {
        return new CompositeValidator(...validators);
    }

    /**
     * 複数のバリデータを指定し、いずれかがパスしていればOKとする
     * @param validators いずれかがパスしていれば良いとするバリデータ
     */
    static or(...validators: Validators[]): Validators {
        return new OrCompositeValidator(...validators);
    }
}

/**
 * not ( undefined, null, '') バリデーター
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
 * 正規表現バリデーター
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
 * リテラル型のチェックバリデーター
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
 * ISO日付チェックバリデータ
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
 * 最小Lengthチェックバリデーター
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
 * 最大Lengthチェックバリデータ
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
 * 数値幅のValidator
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
 * マスタに含まれているかどうかチェック
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
 * 複数のValidatorを組み合わせるValidator
 */
export class CompositeValidator implements Validators {
    readonly validators: Validators[];

    constructor(...validators: Validators[]) {
        this.validators = validators;
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
 * 複数のValidatorを受け取り、いずれかを満たしていればよしとするValidator
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

                //レポート
                // 全体がtrueになっていれば記録しない
                // 全体がfalseかつこのレポートがfalseだったら記録する
                return {
                    // いずれかがパスしていたら全体がOKになる
                    isValid: previousResult.isValid || thisResult.isValid,

                    // 最後のfalseを記録
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
