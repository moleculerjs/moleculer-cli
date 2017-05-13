/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const render = require("consolidate").handlebars.render;

const { fail } = require("../utils");

/**
 * Yargs command
 */
module.exports = {
	command: "create <module>",
	describe: "Create a Moleculer module (service, middleware)",
	handler(opts) {
		if (opts.module.toLowerCase() == "service")
			return addService(opts);
		else {
			fail("Invalid module type. Available modules: service");
		}
	}
};



/**
 * Service generator
 * 
 * @param {any} opts 
 * @returns 
 */
function addService(opts) {
	let values = Object.assign({}, opts);

	return Promise.resolve()
		.then(() => {
			return inquirer.prompt([
				{
					type: "input",
					name: "serviceFolder",
					message: "Service directory",
					default: "./services",
					validate(input) {
						if (!fs.existsSync(path.resolve(input)))
							return `The '${input}' directory is not exists! Full path: ${path.resolve(input)}`;
						
						return true;
					}
				},
				{
					type: "input",
					name: "serviceName",
					message: "Service name",
					default: "test"
				}
			]).then(answers => {
				Object.assign(values, answers);

				const newServicePath = path.join(values.serviceFolder, values.serviceName + ".service.js");
				values.newServicePath = newServicePath;

				if (fs.existsSync(newServicePath)) {
					return inquirer.prompt([{
						type: "confirm",
						name: "sure",
						message: "The file is exists! Overwrite?",
						default: false
					}]).then(({ sure }) => {
						if (!sure)
							fail("Aborted");
					});
				}
			});
		})
		.then(() => {
			const templatePath = path.join(__dirname, "service.template");
			const template = fs.readFileSync(templatePath, "utf8");

			return new Promise((resolve, reject) => {
				render(template, values, function (err, res) {
					if (err) 
						return reject(err);

					const { newServicePath } = values;					
					console.log(`Create new service file to '${newServicePath}'...`);
					fs.writeFileSync(path.resolve(newServicePath), res, "utf8");

					resolve();
				});
			});
		})

		// Error handler
		.catch(err => fail(err));		
}