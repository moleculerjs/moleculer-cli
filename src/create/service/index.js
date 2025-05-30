/*
 * moleculer-cli
 * Copyright (c) 2025 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const render = require("consolidate").handlebars.render;
const glob = require("glob").sync;
const { fail } = require("../../utils");


module.exports = async (opts) => {
	const values = Object.assign({}, opts);
	const _typescript = values.typescript ? true : false;
	const name = opts._[2];

	return (
		Promise.resolve()
			.then(() => {
				const answers_options = [
					{
						type: "input",
						name: "serviceFolder",
						message: "Service directory",
						default: "./services",
						async validate(input) {
							if (!fs.existsSync(path.resolve(input))) {
								console.log(`The  ${input} doesn't exists!`);
								fail("Aborted");
							}
							return true;
						},
					},
				];

				if (!name)
					answers_options.push({
						type: "input",
						name: "serviceName",
						message: "Service name",
						default: "test",
					});

				return inquirer.prompt(answers_options).then((answers) => {
					answers.name = answers.serviceName;
					answers.serviceName = answers.serviceName || name;
					answers.serviceName = answers.serviceName.replace(
						/[^\w\s]/gi,
						"-"
					);

					answers.className = answers.serviceName
						.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
							return g1.toUpperCase() + g2.toLowerCase();
						})
						.replace(/[^\w\s]/gi, "");

					Object.assign(values, answers);
					const { serviceFolder, serviceName } = values;
					const file_name = `${serviceName.toLowerCase()}.service${
						_typescript ? ".ts" : ".js"
					}`;
					const newServicePath = path.join(
						serviceFolder,
						`${serviceName.toLowerCase()}.service${
							_typescript ? ".ts" : ".js"
						}`
					);

					if (fs.existsSync(newServicePath)) {
						return inquirer
							.prompt([
								{
									type: "confirm",
									name: "sure",
									message: `The file ${file_name} already exists! Do you want to overwrite it?`,
									default: false,
								},
							])
							.then(({ sure }) => {
								if (!sure) fail("Aborted");
							});
					}
				});
			})
			.then(() => {
				const templatePath = _typescript
					? path.join(__dirname, "typescript.template")
					: path.join(__dirname, "javascript.template");
				const template = fs.readFileSync(templatePath, "utf8");
				return new Promise((resolve, reject) => {
					render(template, values, async function (err, res) {
						if (err) return reject(err);

						const { serviceFolder, serviceName } = values;
						const newServicePath = path.join(
							serviceFolder,
							`${serviceName.toLowerCase()}.service${
								_typescript ? ".ts" : ".js"
							}`
						);

						fs.writeFileSync(
							path.resolve(`${newServicePath}`),
							res,
							"utf8"
						);

						resolve();
					});
				});
			})

			// Error handler
			.catch((err) => fail(err))
	);
};
