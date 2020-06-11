module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		"ecmaVersion": 6,
		"sourceType": "module",
	},
	plugins: [
		'@typescript-eslint',
	],
	"env": {
        "browser": true,
        "node": true
    },
	extends: [
//		'eslint:recommended',
//		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		"no-console": 1,
		"no-func-assign": 2,
		"no-import-assign": 2,
		"no-irregular-whitespace": 2,
		"no-prototype-builtins": 2,
		"no-unreachable": 2,
		"no-unsafe-finally": 2,
		"use-isnan": 2,
		"valid-typeof": 2,
		"block-scoped-var": 1,
		"default-case": 1,
		"default-case-last": 1,
		"no-empty-function": 1,
		"no-new": 1,
		"no-return-await": 2,
		"require-await": 2,
		"no-label-var": 2,
		"camelcase": [2, {"properties": "always"}],
		"comma-style": [2, "last"],
		"eol-last": [1, "always"],
		"func-call-spacing": [2, "never"],
		"func-style": [2, "expression"],
		"no-lonely-if": 1,
		"no-trailing-spaces": 1,
		"no-var": 2,
		"no-mixed-spaces-and-tabs": 2,
	}
};