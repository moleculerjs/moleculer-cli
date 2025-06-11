const fs = require("fs");
const path = require("path");
const os = require("os");

const kleur = require("kleur");
const { fail } = require("../utils");

/**
 * Yargs command
 */
module.exports = {
	command: "alias-template <template-name> <template-url>",
	describe: "Alias a template url by name for usage in moleculer-cli init command.",
	handler: handler
};

let values = {
	aliasedTemplates: {}
};

/**
 * Handler for yards command
 *
 * @param {any} opts
 */
async function handler(opts) {
	Object.assign(values, opts);

	const configPath = path.join(os.homedir(), ".moleculer-templates.json");

	try {
		// Check for existing template alias config file
		if (fs.existsSync(configPath)) {
			const config = await fs.promises.readFile(configPath);
			values.aliasedTemplates = JSON.parse(config);
		}

		// Check if template name already exists
		const { templateName, aliasedTemplates } = values;
		if (aliasedTemplates[templateName]) {
			const inquirer = (await import("inquirer")).default;

			const answers = await inquirer.prompt([
				{
					type: "confirm",
					name: "continue",
					message: kleur
						.yellow()
						.bold(
							`The alias '${templateName}' already exists with value '${aliasedTemplates[templateName]}'! Overwrite?`
						),
					default: false
				}
			]);
			if (!answers.continue) process.exit(0);
		}

		// Write template name and repo url
		const { templateUrl } = values;
		const newAliases = JSON.stringify(
			Object.assign(aliasedTemplates, { [templateName]: templateUrl })
		);

		await fs.promises.writeFile(configPath, newAliases);

		console.log(
			kleur
				.green()
				.bold(
					`Template alias '${templateName}' with value '${templateUrl}' has been saved!`
				)
		);
	} catch (err) {
		fail(err);
	}
}
