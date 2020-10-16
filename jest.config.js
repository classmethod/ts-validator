module.exports = {
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    coverageReporters: ['json-summary', 'text', 'lcov'],
};
