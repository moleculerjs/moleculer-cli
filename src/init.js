/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const mkdirp = require("mkdirp");

const inquirer = require("inquirer");
const render = require("consolidate").handlebars.render;
const Metalsmith = require("metalsmith");


module.exports = {
	command: "init",
	describe: "Create a Moleculer project/module",
	handler: init
}

let values = {
	year: new Date().getFullYear()
}

function fail(msg) {
	console.error(chalk.red.bold(msg));
	process.exit(1);
}

function init(opts) {
	Object.assign(values, opts);

	return Promise.resolve()
		.then(() => {
			return inquirer.prompt([
				{
					type: "list",
					name: "projectType",
					message: "Project type",
					choices: [
						{ name: "Project", value: "project" },
						{ name: "Module", value: "module" }
					]
				},
				{
					type: "input",
					name: "projectName",
					message: "Project name"
				},
				{
					type: "list",
					name: "templateName",
					message: "Select a template",
					choices: [
						{ name: "Simple", value: "simple" }
					]
				},
			])
		})
		.then(answers => {
			Object.assign(values, answers);

			const { projectName } = values;
			const projectFolder = values.projectFolder = path.join(".", projectName);
			//if (fs.existsSync(projectFolder))
			//	return fail(`The '${projectName} directory is exists!`);

			console.log(`Create '${projectName}' folder...`);
			//mkdirp(path.join(".", projectName));

		})
		.then(() => {
			const templateFolder = path.join("..", "templates", "project", values.templateName);
			if (fs.existsSync(path.join(templateFolder, "config.js"))) {
				const templateConfig = require(path.join(templateFolder, "config.js"));
				if (templateConfig.questions) {
					return inquirer.prompt(templateConfig.questions).then(answers => Object.assign(values, answers));
				}
			}
		})
		.then(() => {
			const metalsmith = Metalsmith(templateFolder)
				//.use(ask)
				.use(template)
				.clean(false)
				.source('.')
				.destination(values.projectFolder)
				.build((err, files) => {
					if (err) throw err;
				});
		})
		.then(() => {
		})
		.then(() => {
		})
		.then(() => {
			console.log("Done");
		})
		.catch(err => console.error);
}

function template(files, metalsmith, done) {
	var keys = Object.keys(files);
	var metadata = metalsmith.metadata();

	async.each(keys, run, done);

	function run(file, done) {
		var str = files[file].contents.toString();

		if (!/{{([^{}]+)}}/g.test(str)) {
			return next()
		}

		render(str, metadata, function (err, res) {
			if (err) return done(err);
			files[file].contents = new Buffer(res);
			done();
		});
	}
}