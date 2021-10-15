/*
 * moleculer-cli
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const render = require("consolidate").handlebars.render;
const ui = new inquirer.ui.BottomBar();

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
						name: "mixinFolder",
						message: "Mixin directory",
						default: "./mixins",
						async validate(input) {
							if (!fs.existsSync(path.resolve(input))) {
								ui.log.write(`The  ${input} doesn't exists!`);
								fail("Aborted");
							}
							return true;
						},
					},
				];

				if (!name)
					answers_options.push({
						type: "input",
						name: "mixinName",
						message: "Mixin name",
						default: "test",
					});

				return inquirer.prompt(answers_options).then((answers) => {
					answers.name = answers.mixinName;
					answers.mixinName = answers.mixinName || name;
					answers.mixinName = answers.mixinName.replace(
						/[^\w\s]/gi,
						"-"
					);

					answers.className = answers.mixinName
						.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
							return g1.toUpperCase() + g2.toLowerCase();
						})
						.replace(/[^\w\s]/gi, "");

					Object.assign(values, answers);
					const { mixinFolder, mixinName } = values;
					const file_name = `${mixinName.toLowerCase()}.mixin${
						_typescript ? ".ts" : ".js"
					}`;
					const newMixinPath = path.join(
						mixinFolder,
						`${mixinName.toLowerCase()}.mixin${
							_typescript ? ".ts" : ".js"
						}`
					);

					if (fs.existsSync(newMixinPath)) {
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
					? path.join(
							__dirname,
							"moleculer-db.typescript.mixin.template"
					  )
					: path.join(__dirname, "moleculer-db.mixin.template");
				const template = fs.readFileSync(templatePath, "utf8");
				return new Promise((resolve, reject) => {
					render(template, values, async function (err, res) {
						if (err) return reject(err);

						const { mixinFolder, mixinName } = values;
						const newMixinPath = path.join(
							mixinFolder,
							`${mixinName.toLowerCase()}.mixin${
								_typescript ? ".ts" : ".js"
							}`
						);

						console.log(
							`Create new mixin file to '${newMixinPath}'...`
						);
						fs.writeFileSync(
							path.resolve(`${newMixinPath}`),
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
