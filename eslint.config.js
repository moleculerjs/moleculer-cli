const { defineConfig } = require("eslint/config");

const globals = require("globals");
const node = require("eslint-plugin-node");
const promise = require("eslint-plugin-promise");
//const security = require("eslint-plugin-security");
const prettier = require("eslint-plugin-prettier");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

module.exports = defineConfig([
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.commonjs,
				...Object.fromEntries(Object.entries(globals.jquery).map(([key]) => [key, "off"])),
				...globals.jest,
				...globals.jasmine
			}
		},

		extends: compat.extends(
			"eslint:recommended",
			/*"plugin:security/recommended",*/ "plugin:prettier/recommended"
		),

		plugins: {
			node,
			promise,
			prettier
			//security,
		},

		rules: {
			indent: [
				"warn",
				"tab",
				{
					SwitchCase: 1
				}
			],

			semi: ["error", "always"],
			"no-var": ["error"],
			"no-console": 0,
			"no-unused-vars": ["warn"],
			"no-trailing-spaces": ["error"],
			"no-alert": 0,
			"no-shadow": 0,
			"security/detect-object-injection": ["off"],
			"security/detect-non-literal-require": ["off"],
			"security/detect-non-literal-fs-filename": ["off"],
			"no-process-exit": ["off"],
			"node/no-unpublished-require": 0,
			"no-async-promise-executor": 0
		}
	}
]);
