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
    Validators,
} from './validators';

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
