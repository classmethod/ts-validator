import { HtmlColorRegExp } from '../src/regexp';
import { and, falseValidator, formatValidator } from '../src/validator-factory';

describe('format: HtmlColorRegExp', () => {
    test.each`
        value                         | expected
        ${'#FFF'}                     | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'#000000'}                  | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'#ffffff'}                  | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'#FFFF'}                    | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'rgb(255, 0, 0, 0.3)'}      | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'rgba(255, 0, 0, 3)'}       | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'hsl(120, 100%, 500%)'}     | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'hsla(120, 100%, 75%, 40)'} | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'aliceblue'}                | ${{ isValid: true, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'tokyo'}                    | ${{ isValid: false, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'###'}                      | ${{ isValid: false, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'0x123'}                    | ${{ isValid: false, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'hslv(120,  60%, 70%, 2)'}  | ${{ isValid: false, expected: `pattern: ${HtmlColorRegExp}` }}
        ${'rgb(0, 0, #AAA)'}          | ${{ isValid: false, expected: `pattern: ${HtmlColorRegExp}` }}
        ${''}                         | ${{ isValid: false, expected: 'not empty' }}
    `('input: $value expected: $expected.isValid', ({ value, expected }) => {
        const name = 'htmlColor';
        const sut = formatValidator({
            name: 'htmlColor',
            value,
            format: HtmlColorRegExp,
        });
        expect(sut.validate()).toEqual({
            isValid: expected.isValid,
            report: {
                actual: value,
                attribute: name,
                expected: expected.expected,
                rawValue: value,
            },
        });
    });
});

describe('falseValidator and falseValidator', () => {
    test.each`
        value1 | value2 | expected
        ${{ name: 'string', value: '' }} | ${{ name: 'number', value: 0 }} | ${{
    isValid: true,
    actual: 'falsy',
    name: 'number',
    rawValue: '0',
}}
        ${{ name: 'string', value: null }} | ${{ name: 'string', value: undefined }} | ${{
    isValid: true,
    actual: 'falsy',
    name: 'string',
    rawValue: 'undefined',
}}
        ${{ name: 'number', value: NaN }} | ${{ name: 'number', value: null }} | ${{
    isValid: true,
    actual: 'falsy',
    name: 'number',
    rawValue: 'null',
}}
        ${{ name: 'boolean', value: false }} | ${{ name: 'boolean', value: undefined }} | ${{
    isValid: true,
    actual: 'falsy',
    name: 'boolean',
    rawValue: 'undefined',
}}
        ${{ name: 'string', value: null }} | ${{ name: 'object', value: {} }} | ${{
    isValid: false,
    actual: 'truthy',
    name: 'object',
    rawValue: '[object Object]',
}}
        ${{ name: 'array', value: [] }} | ${{ name: 'string', value: 'a' }} | ${{
    isValid: false,
    actual: 'truthy',
    name: 'array',
    rawValue: '',
}}
    `(
        'input: $value1 $value2 expected: $expected.isValid',
        ({ value1, value2, expected }) => {
            const sut = and(
                falseValidator(value1.name, value1.value),
                falseValidator(value2.name, value2.value),
            );
            expect(sut.validate()).toEqual({
                isValid: expected.isValid,
                report: {
                    actual: expected.actual,
                    attribute: expected.name,
                    expected: 'falsy',
                    rawValue: expected.rawValue,
                },
            });
        },
    );
});
