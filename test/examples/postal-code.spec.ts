import { postalCodeValidator } from '../../examples/postal-code';

describe('postalCode factory', () => {
    test.each`
        value           | result
        ${''}           | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'1'}          | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'12'}         | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'123'}        | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'1234'}       | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'12345'}      | ${{ isValid: true, key: 'postal_code', expected: 'max length: 5', actual: '5' }}
        ${'123456'}     | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'1234567'}    | ${{ isValid: true, key: 'postal_code', expected: 'max length: 7', actual: '7' }}
        ${'12345678'}   | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'123456789'}  | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
        ${'1234567899'} | ${{ isValid: false, key: 'or', expected: 'Pass at least one validator.', actual: 'None of the validators passed.' }}
    `(
        'to validate $value exactly five or seven characters',
        ({ value, result }) => {
            const suc = postalCodeValidator(value);
            expect(suc.validate()).toEqual({
                isValid: result.isValid,
                report: {
                    actual: result.actual,
                    attribute: result.key,
                    expected: result.expected,
                    rawValue: expect.any(String),
                },
            });
        },
    );
});
