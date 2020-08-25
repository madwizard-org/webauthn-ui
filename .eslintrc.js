module.exports = {
    "env": {
        "browser": true,
        "es2020": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "airbnb-base"
    ],

    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "settings": {
        'import/extensions': [".js",".ts"],
        'import/parsers': {
            '@typescript-eslint/parser': [".ts"]
        },
        'import/resolver': {
            'node': {
                'extensions': [".js",".ts"]
            }
        }
    },
    "ignorePatterns": [
        "*.d.ts",
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "import/extensions": ['error', 'ignorePackages', {
            ts: 'never',

        }],
        "max-len": 0,
        "no-plusplus": 0

    },
    "overrides": [
        {
            "files": ["*.test.ts"],
            "env": {
                "jest": true
            },
            "rules": {
                "@typescript-eslint/no-non-null-assertion": 0,
                "@typescript-eslint/no-empty-function": 0
            }
        }
    ]
};
