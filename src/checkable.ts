import { ValidationResult, Validators } from './validators';

/**
 * ドメインオブジェクトにバリデーションのチェック機能もたせる抽象クラス
 */
export abstract class Checkable {
    readonly validator: Validators;

    protected constructor(validator: Validators) {
        this.validator = validator;
    }

    check(): ValidationResult {
        return this.validator.validate();
    }
}
