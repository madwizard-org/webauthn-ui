module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    moduleFileExtensions: ["ts","js"], // use ts first to prevent loading transpiled js files instead of ts files in src
    coveragePathIgnorePatterns: [
        "\.d\.ts$"
    ]
};