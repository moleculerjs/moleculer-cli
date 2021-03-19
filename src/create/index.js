/*
 * moleculer-cli
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const render = require("consolidate").handlebars.render;
const glob = require("glob").sync;
var ui = new inquirer.ui.BottomBar();

const { fail } = require("../utils");

const templates = glob(path.join(__dirname, "*.template")).map(f => path.parse(f).name);

/**
 * Yargs command
 */
module.exports = {
	command: ["create service", "create service <name>"],
	describe: `Create a Moleculer service (${templates.join(",")})`,
	builder(yargs) {
		yargs.options({
			"typescript": {
				describe: "Create service for typescript",
				type: "boolean",
				default: false
			}
		});
	},
	handler(opts) {
		return addService(opts);
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
	const _typescript = values.typescript ? true : false;
	const [action, name] = values._;

	return Promise.resolve()
		.then(() => {
			const answers_options = [		{
				type: "input",
				name: "serviceFolder",
				message: "Service directory",
				default: "./services",
				async validate(input) {
					if (!fs.existsSync(path.resolve(input))){
							ui.log.write(`The  ${input} doesn't exists!`)
							fail("Aborted");
					}
					return true
				}

			}];


			if(!name)
				answers_options.push({
					type: "input",
					name: "serviceName",
					message: "Service name",
					default: "test"
				});

			return inquirer.prompt(answers_options).then(answers => {
				answers.name = answers.serviceName
				answers.serviceName = capitalizeFirstLetter(answers.serviceName || name );


				Object.assign(values, answers);
				const { serviceFolder , serviceName  } = values;
				const file_name = `${serviceName.toLowerCase()}.service${_typescript ?".ts" :".js"}`;
				const newServicePath =  path.join(serviceFolder, `${serviceName.toLowerCase()}.service${_typescript ?".ts" :".js"}`);

				if (fs.existsSync(newServicePath)) {
					return inquirer.prompt([{
						type: "confirm",
						name: "sure",
						message: `The file ${file_name} already exists! Do you want to overwrite it?`,
						default: false
					}]).then(({ sure }) => {
						if (!sure)
							fail("Aborted");
					});
				}
			});
		})
		.then(() => {
			const templatePath = _typescript ? path.join(__dirname, "typescript.service"):path.join(__dirname, "service.template");
			const template = fs.readFileSync(templatePath, "utf8");
			return new Promise( (resolve, reject) => {
				render(template, values, async function (err, res) {
					if (err)
						return reject(err);

					const { serviceFolder , serviceName  } = values;
					const newServicePath =  path.join(serviceFolder, `${serviceName.toLowerCase()}.service${_typescript ?".ts" :".js"}`);

					console.log(`Create new service file to '${newServicePath}'...`);
					fs.writeFileSync(path.resolve(`${newServicePath}`), res, "utf8");

					resolve();
				});
			});
		})

		// Error handler
		.catch(err => fail(err));
}

function capitalizeFirstLetter(string) {
	return string[0].toUpperCase() + string.slice(1);
}
