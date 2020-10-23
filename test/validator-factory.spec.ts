import { HtmlColorRegExp } from '../src/regexp';
import { formatValidator } from '../src/validator-factory';

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
        const suc = formatValidator({
            name: 'htmlColor',
            value,
            format: HtmlColorRegExp,
        });
        expect(suc.validate()).toEqual({
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
