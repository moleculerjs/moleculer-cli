const fs = require("fs");
const path = require("path");
const os = require("os");

const inquirer = require("inquirer");
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
function handler(opts) {
	Object.assign(values, opts);

	const configPath = path.join(os.homedir(), ".moleculer-templates.json");
	return (
		Promise.resolve()
			//check for existing template alias config file
			.then(() => {
				return new Promise((resolve, reject) => {
					fs.exists(configPath, exists => {
						if (exists) {
							fs.readFile(configPath, (err, config) => {
								if (err) {
									reject();
								}
								values.aliasedTemplates = JSON.parse(config);
								resolve();
							});
						} else {
							resolve();
						}
					});
				});
			})
			// check if template name already exists
			.then(() => {
				const { templateName, aliasedTemplates } = values;
				if (aliasedTemplates[templateName]) {
					// if exists ask for overwrite
					return inquirer.prompt([{
						type: "confirm",
						name: "continue",
						message: kleur.yellow().bold(`The alias '${templateName}' already exists with value '${aliasedTemplates[templateName]}'! Overwrite?`),
						default: false
					}]).then(answers => {
						if (!answers.continue)
							process.exit(0);
					});
				}
			})
			// write template name and repo url
			.then(() => {
				const { templateName, templateUrl, aliasedTemplates } = values;
				const newAliases = JSON.stringify(Object.assign(aliasedTemplates, { [templateName]: templateUrl }));
				fs.writeFileSync(configPath, newAliases);
			})
			.catch(err => fail(err))
	);
}
