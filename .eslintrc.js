module.exports = {
    "env": {
        "browser": true,
        "es2020": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "ignorePatterns": [
        "*.d.ts",
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,

    },
    "overrides": [
        {
            "files": ["*.test.ts"],
            "rules": {
                "@typescript-eslint/no-non-null-assertion": 0,
                "@typescript-eslint/no-empty-function": 0

            }
        }
    ]
};
