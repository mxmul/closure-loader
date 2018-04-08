module.exports = {
    collectCoverage: true,
    collectCoverageFrom: ['lib/**/*.js'],
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            statements: 87.67,
            branches: 79.55,
            lines: 87.59,
            functions: 84.85,
        },
    },
};
