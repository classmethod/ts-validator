import {
    CompositeValidator,
    DateTimeValidator,
    MaxLengthValidator,
    MinLengthValidator,
    NotEmptyValidator,
    RegExpValidator,
} from '../src/validator';
import {
    AlphanumericLowerReqExp,
    AlphanumericReqExp,
    AsciiRegExp,
    NumberRegExp,
    Utf8ZenkakuAndReturnRegExp,
} from '../src/regexp';

describe('NotEmptyValidator', () => {
    test.each`
        name            | value      | expected
        ${'address'}    | ${'tokyo'} | ${{ isValid: true, actual: 'tokyo' }}
        ${'first name'} | ${''}      | ${{ isValid: false, actual: '' }}
        ${'first name'} | ${null}    | ${{ isValid: false, actual: 'null' }}
    `(
        'input: $value expected: $expected.isValid',
        ({ name, value, expected }) => {
            const suc = new NotEmptyValidator(name, value);
            expect(suc.validate()).toEqual({
                isValid: expected.isValid,
                report: {
                    actual: expected.actual,
                    attribute: name,
                    expected: 'not empty',
                    rawValue: String(value),
                },
            });
        },
    );
});

describe('MinLengthValidator', () => {
    test.each`
        name         | value                           | minlength | expected
        ${'address'} | ${'tokyo'}                      | ${4}      | ${{ isValid: true, actual: '5' }}
        ${'address'} | ${'hokkaido'}                   | ${8}      | ${{ isValid: true, actual: '8' }}
        ${'address'} | ${'hokkaido'}                   | ${9}      | ${{ isValid: false, actual: '8' }}
        ${'address'} | ${'東京'}                       | ${1}      | ${{ isValid: true, actual: '2' }}
        ${'address'} | ${'北海道'}                     | ${3}      | ${{ isValid: true, actual: '3' }}
        ${'address'} | ${'北海道'}                     | ${4}      | ${{ isValid: false, actual: '3' }}
        ${'address'} | ${'tokyo東京'}                  | ${7}      | ${{ isValid: true, actual: '7' }}
        ${'address'} | ${'tokyo東京'}                  | ${8}      | ${{ isValid: false, actual: '7' }}
        ${'address'} | ${'tokyo東京 hokkaido北海道　'} | ${20}     | ${{ isValid: true, actual: '20' }}
        ${'address'} | ${'tokyo東京 hokkaido北海道　'} | ${21}     | ${{ isValid: false, actual: '20' }}
        ${'address'} | ${''}                           | ${0}      | ${{ isValid: true, actual: '0' }}
        ${'address'} | ${''}                           | ${1}      | ${{ isValid: false, actual: '0' }}
        ${'address'} | ${' '}                          | ${1}      | ${{ isValid: true, actual: '1' }}
        ${'address'} | ${'　'}                         | ${1}      | ${{ isValid: true, actual: '1' }}
    `(
        'input: $value expected: $expected.isValid',
        ({ name, value, minlength, expected }) => {
            const suc = new MinLengthValidator(name, value, minlength);
            expect(suc.validate()).toEqual({
                isValid: expected.isValid,
                report: {
                    actual: expected.actual,
                    attribute: name,
                    expected: `min length: ${minlength}`,
                    rawValue: value,
                },
            });
        },
    );
});

describe('MaxLengthValidator', () => {
    test.each`
        name         | value                           | maxlength | expected
        ${'address'} | ${'tokyo'}                      | ${6}      | ${{ isValid: true, actual: '5' }}
        ${'address'} | ${'hokkaido'}                   | ${8}      | ${{ isValid: true, actual: '8' }}
        ${'address'} | ${'hokkaido'}                   | ${7}      | ${{ isValid: false, actual: '8' }}
        ${'address'} | ${'東京'}                       | ${3}      | ${{ isValid: true, actual: '2' }}
        ${'address'} | ${'北海道'}                     | ${3}      | ${{ isValid: true, actual: '3' }}
        ${'address'} | ${'北海道'}                     | ${2}      | ${{ isValid: false, actual: '3' }}
        ${'address'} | ${'tokyo東京'}                  | ${7}      | ${{ isValid: true, actual: '7' }}
        ${'address'} | ${'tokyo東京'}                  | ${6}      | ${{ isValid: false, actual: '7' }}
        ${'address'} | ${'tokyo東京 hokkaido北海道　'} | ${20}     | ${{ isValid: true, actual: '20' }}
        ${'address'} | ${'tokyo東京 hokkaido北海道　'} | ${19}     | ${{ isValid: false, actual: '20' }}
        ${'address'} | ${''}                           | ${0}      | ${{ isValid: true, actual: '0' }}
        ${'address'} | ${''}                           | ${1}      | ${{ isValid: true, actual: '0' }}
        ${'address'} | ${' '}                          | ${1}      | ${{ isValid: true, actual: '1' }}
        ${'address'} | ${'　'}                         | ${1}      | ${{ isValid: true, actual: '1' }}
    `(
        'input: $value expected: $expected.isValid',
        ({ name, value, maxlength, expected }) => {
            const suc = new MaxLengthValidator(name, value, maxlength);
            expect(suc.validate()).toEqual({
                isValid: expected.isValid,
                report: {
                    actual: expected.actual,
                    attribute: name,
                    expected: `max length: ${maxlength}`,
                    rawValue: value,
                },
            });
        },
    );
});

describe('RegExpValidator', () => {
    test.each`
        name              | value                     | pattern                       | expected
        ${'address'}      | ${'Tokyo'}                | ${AlphanumericReqExp}         | ${{ isValid: true, actual: 'Tokyo' }}
        ${'address'}      | ${''}                     | ${AlphanumericReqExp}         | ${{ isValid: true, actual: '' }}
        ${'address'}      | ${'tokyo'}                | ${AlphanumericLowerReqExp}    | ${{ isValid: true, actual: 'tokyo' }}
        ${'phone number'} | ${'0120123123'}           | ${NumberRegExp}               | ${{ isValid: true, actual: '0120123123' }}
        ${'address'}      | ${'北海道'}               | ${Utf8ZenkakuAndReturnRegExp} | ${{ isValid: true, actual: '北海道' }}
        ${'address'}      | ${'!#$%&123'}             | ${AsciiRegExp}                | ${{ isValid: true, actual: '!#$%&123' }}
        ${'address'}      | ${'Tokyo&Hokkaido'}       | ${AlphanumericReqExp}         | ${{ isValid: false, actual: 'Tokyo&Hokkaido' }}
        ${'address'}      | ${'東京'}                 | ${AlphanumericReqExp}         | ${{ isValid: false, actual: '東京' }}
        ${'address'}      | ${'　'}                   | ${AlphanumericReqExp}         | ${{ isValid: false, actual: '　' }}
        ${'address'}      | ${'Tokyo Hokkaido'}       | ${AlphanumericReqExp}         | ${{ isValid: false, actual: 'Tokyo Hokkaido' }}
        ${'address'}      | ${'Tokyo'}                | ${AlphanumericLowerReqExp}    | ${{ isValid: false, actual: 'Tokyo' }}
        ${'address'}      | ${'東京'}                 | ${AlphanumericLowerReqExp}    | ${{ isValid: false, actual: '東京' }}
        ${'phone number'} | ${'０１２０１２３１２３'} | ${NumberRegExp}               | ${{ isValid: false, actual: '０１２０１２３１２３' }}
        ${'phone number'} | ${'#0120123123#'}         | ${NumberRegExp}               | ${{ isValid: false, actual: '#0120123123#' }}
        ${'phone number'} | ${'tokyo123'}             | ${NumberRegExp}               | ${{ isValid: false, actual: 'tokyo123' }}
        ${'address'}      | ${'hokkaido'}             | ${Utf8ZenkakuAndReturnRegExp} | ${{ isValid: false, actual: 'hokkaido' }}
        ${'address'}      | ${'hokkaido北海道'}       | ${Utf8ZenkakuAndReturnRegExp} | ${{ isValid: false, actual: 'hokkaido北海道' }}
        ${'address'}      | ${' '}                    | ${Utf8ZenkakuAndReturnRegExp} | ${{ isValid: false, actual: ' ' }}
        ${'address'}      | ${'!#$%&東京'}            | ${AsciiRegExp}                | ${{ isValid: false, actual: '!#$%&東京' }}
        ${'address'}      | ${'！＃＄％＆'}           | ${AsciiRegExp}                | ${{ isValid: false, actual: '！＃＄％＆' }}
    `(
        'input: $value expected: $expected.isValid',
        ({ name, value, pattern, expected }) => {
            const suc = new RegExpValidator(name, value, pattern);
            expect(suc.validate()).toEqual({
                isValid: expected.isValid,
                report: {
                    actual: expected.actual,
                    attribute: name,
                    expected: `pattern: ${pattern}`,
                    rawValue: value,
                },
            });
        },
    );
});

describe('DateTimeValidator', () => {
    test.each`
        name          | value                             | dateFormat          | expected
        ${'birthday'} | ${'202001311200'}                 | ${'yyyyMMddHHmm'}   | ${{ isValid: true, actual: '202001311200' }}
        ${'birthday'} | ${'20200130120000'}               | ${'yyyyMMddHHmmss'} | ${{ isValid: true, actual: '20200130120000' }}
        ${'birthday'} | ${'202001321200'}                 | ${'yyyyMMddHHmm'}   | ${{ isValid: false, actual: '202001321200' }}
        ${'birthday'} | ${'202001301200'}                 | ${'yyyyMMddHHmmss'} | ${{ isValid: false, actual: '202001301200' }}
        ${'birthday'} | ${'２０２００１３０１２００'}     | ${'yyyyMMddHHmm'}   | ${{ isValid: false, actual: '２０２００１３０１２００' }}
        ${'birthday'} | ${'２０２００１３０１２００００'} | ${'yyyyMMddHHmmss'} | ${{ isValid: false, actual: '２０２００１３０１２００００' }}
        ${'birthday'} | ${'2020０１３０12００'}           | ${'yyyyMMddHHmm'}   | ${{ isValid: false, actual: '2020０１３０12００' }}
        ${'birthday'} | ${''}                             | ${'yyyyMMddHHmm'}   | ${{ isValid: false, actual: '' }}
    `(
        'input: $value expected: $expected.isValid',
        ({ name, value, dateFormat, expected }) => {
            const suc = new DateTimeValidator(name, value, dateFormat);
            expect(suc.validate()).toEqual({
                isValid: expected.isValid,
                report: {
                    actual: expected.actual,
                    attribute: name,
                    expected: `dateFormat: ${dateFormat}`,
                    rawValue: value,
                },
            });
        },
    );
});

describe('CompositeValidator', () => {
    const validLength = new MaxLengthValidator('name', '20191209122311', 14);
    const invalidLength = new MaxLengthValidator('name', '20191209122311', 1);

    const validDateTime = new DateTimeValidator(
        'birthday',
        '20191209122311',
        'yyyyMMddHHmmss',
    );
    const inValidDateTime = new DateTimeValidator(
        'birthday',
        '201912091223',
        'yyyyMMddHHmmss',
    );
    const invalidComposite = new CompositeValidator();

    test.each`
        validators                                            | expected
        ${[validLength, validDateTime]}                       | ${{ isValid: true, reportValidator: validDateTime }}
        ${[validLength, inValidDateTime]}                     | ${{ isValid: false, reportValidator: inValidDateTime }}
        ${[invalidLength, validDateTime]}                     | ${{ isValid: false, reportValidator: invalidLength }}
        ${[invalidComposite, inValidDateTime, validDateTime]} | ${{ isValid: false, reportValidator: invalidComposite }}
        ${[]}                                                 | ${{ isValid: false, reportValidator: invalidComposite }}
    `(
        'invalid: first inValid report valid: last valid report: $validators ',
        ({ validators, expected }) => {
            const suc = new CompositeValidator(...validators);
            const expectedValidate = expected.reportValidator.validate();
            expect(suc.validate()).toEqual(expectedValidate);
        },
    );
});
