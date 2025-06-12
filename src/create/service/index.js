/*
 * moleculer-cli
 * Copyright (c) 2025 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const render = require("@ladjs/consolidate").handlebars.render;
const { fail } = require("../../utils");

module.exports = async opts => {
	try {
		const name = opts._[2];
		const values = Object.assign({}, opts);
		// const _typescript = values.typescript ? true : false;

		if (opts.answers) {
			const loadedAnswers = require(path.resolve(opts.answers));
			console.log("Loaded answers:", loadedAnswers);
			Object.assign(values, loadedAnswers);
		} else {
			const inquirer = (await import("inquirer")).default;

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
					}
				}
			];

			if (!name) {
				answers_options.push({
					type: "input",
					name: "serviceName",
					message: "Service name",
					default: "test"
				});
			}

			const answers = await inquirer.prompt(answers_options);
			answers.name = answers.serviceName;
			answers.serviceName = answers.serviceName || name;

			Object.assign(values, answers);
		}

		values.serviceName = values.serviceName.replace(/[^\w\s]/gi, "-");
		values.className = values.serviceName
			.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
				return g1.toUpperCase() + g2.toLowerCase();
			})
			.replace(/[^\w\s]/gi, "");

		const { serviceFolder, serviceName } = values;
		const fileName = `${serviceName.toLowerCase()}.service${values.typescript ? ".ts" : ".js"}`;
		const newServicePath = path.join(serviceFolder, fileName);

		if (fs.existsSync(newServicePath)) {
			const inquirer = (await import("inquirer")).default;
			const ans = await inquirer.prompt([
				{
					type: "confirm",
					name: "sure",
					message: `The file ${fileName} already exists! Do you want to overwrite it?`,
					default: false
				}
			]);
			if (!ans.sure) fail("Aborted");
		}

		const templatePath = values.typescript
			? path.join(__dirname, "typescript.template")
			: path.join(__dirname, "javascript.template");
		const template = fs.readFileSync(templatePath, "utf8");

		await new Promise((resolve, reject) => {
			render(template, values, async (err, res) => {
				if (err) return reject(err);

				const { serviceFolder, serviceName } = values;
				const newServicePath = path.join(
					serviceFolder,
					`${serviceName.toLowerCase()}.service${values.typescript ? ".ts" : ".js"}`
				);

				fs.writeFileSync(path.resolve(`${newServicePath}`), res, "utf8");

				resolve();
			});
		});

		console.log(`Service created at ${path.resolve(newServicePath)}`);
	} catch (err) {
		fail(err);
	}
};
