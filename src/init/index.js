/*
 * moleculer-cli
 * Copyright (c) 2018 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 *
 * Based on [vue-cli](https://github.com/vuejs/vue-cli) project
 */

const fs = require("fs");
const path = require("path");

const _ = require("lodash");
const chalk = require("chalk");
const async = require("async");
const mkdirp = require("mkdirp");
const exeq = require("exeq");
const ora = require("ora");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const multimatch = require('multimatch');
const render = require("consolidate").handlebars.render;
const Metalsmith = require("metalsmith");
const Handlebars = require("handlebars");
const match = require("minimatch");
const pkg = require("../../package.json");

const { getTempDir, fail, evaluate } = require("../utils");


/**
 * Yargs command
 */
module.exports = {
	command: "init <template-name> [project-name]",
	describe: "Create a Moleculer project from template",
	handler: handler
};

/**
 * Default values
 */
let values = {
	year: new Date().getFullYear(),
	cliVersion: pkg.version,
};

/**
 * Register handlebars helpers
 */
Handlebars.registerHelper("if_eq", (a, b, opts) => a === b ? opts.fn(this) : opts.inverse(this));
Handlebars.registerHelper("unless_eq", (a, b, opts) => a === b ? opts.inverse(this): opts.fn(this));
Handlebars.registerHelper("if_or", (v1, v2, options) => (v1 || v2) ? options.fn(this) : options.inverse(this));
Handlebars.registerHelper("if_and", (v1, v2, options) => (v1 && v2) ? options.fn(this) : options.inverse(this));

/**
 * Handler for yargs command
 *
 * @param {any} opts
 * @returns
 */
function handler(opts) {
	Object.assign(values, opts);

	let templateMeta;
	let metalsmith;

	return Promise.resolve()

		// Resolve project name & folder
		.then(() => {
			values.inPlace = false;
			if (!values.projectName || values.projectName === ".") {
				values.inPlace = true;
				values.projectName = path.relative("../", process.cwd());
			}
			values.projectPath = path.resolve(values.projectName);
		})

		// Resolve template URL from name
		.then(() => {
			let { templateName, templateRepo } = values;

			if (/^[./]|(^[a-zA-Z]:)/.test(templateName)) {
				values.tmp = path.isAbsolute(templateName) ? templateName : path.normalize(path.join(process.cwd(), templateName));

				console.log("Local template:", values.tmp);
			} else {

				if (templateName.indexOf("/") === -1) {
					templateRepo = `moleculerjs/moleculer-template-${templateName}`;
				} else {
					templateRepo = templateName;
				}

				values.templateRepo = templateRepo;
				values.tmp = getTempDir(templateName, true);

				console.log("Template repo:", templateRepo);
			}
		})

		// Download template
		.then(() => {
			if (values.templateRepo) {
				return new Promise((resolve, reject) => {
					let spinner = ora("Downloading template");
					spinner.start();
					download(values.templateRepo, values.tmp, {}, err => {
						spinner.stop();

						if (err)
							return reject(`Failed to download repo from '${values.templateRepo}'!`, err);

						resolve();
					});

				});
			}
		})

		// Prompt questions
		.then(() => {
			const { tmp } = values;
			if (fs.existsSync(path.join(tmp, "meta.js"))) {
				templateMeta = require(path.join(tmp, "meta.js"))(values);
				if (templateMeta.questions) {
					return inquirer.prompt(templateMeta.questions).then(answers => Object.assign(values, answers));
				}
			} else {
				templateMeta = {};
			}
		})

		// Check target directory
		.then(() => {
			if (fs.exists(values.projectPath)) {
				return inquirer.prompt([{
					type: "confirm",
					name: "continue",
					message: chalk.yellow.bold(`The '${values.projectName} directory is exists! Continue?`),
					default: false
				}]).then(answers => {
					if (!answers.continue)
						process.exit(0);
				});
			} else {
				console.log(`Create '${values.projectName}' folder...`);
				mkdirp(values.projectPath);
			}
		})

		// Build template
		.then(() => {
			return new Promise((resolve, reject) => {
				metalsmith = Metalsmith(values.tmp);
				Object.assign(metalsmith.metadata(), values);

				// Register custom template helpers
				if (templateMeta.helpers)
					Object.keys(templateMeta.helpers).map(key =>Handlebars.registerHelper(key, templateMeta.helpers[key]));

				// metalsmith.before
				if (templateMeta.metalsmith && _.isFunction(templateMeta.metalsmith.before))
					templateMeta.metalsmith.before.call(templateMeta, metalsmith);

				metalsmith
					.use(filterFiles(templateMeta.filters, templateMeta.skip))
					.use(renderTemplate(templateMeta.skipInterpolation));

				// metalsmith.after
				if (templateMeta.metalsmith && _.isFunction(templateMeta.metalsmith.after))
					templateMeta.metalsmith.after.call(templateMeta, metalsmith);

				// Build
				metalsmith
					.clean(false)
					.source("template")
					.destination(values.projectPath)
					.build(err => {
						if (err)
							return reject(err);

						// metalsmith.complete
						if (templateMeta.metalsmith && _.isFunction(templateMeta.metalsmith.complete))
							templateMeta.metalsmith.complete.call(templateMeta, metalsmith);

						resolve();
					});

			});
		})

		// Run 'npm install'
		.then(() => {
			return inquirer.prompt([{
				type: "confirm",
				name: "install",
				message: "Would you like to run 'npm install'?",
				default: true
			}]).then(({ install }) => {
				if (install) {
					console.log("\nRunning 'npm install'...");
					return exeq([
						"cd " + values.projectPath,
						"npm install"
					]);
				}
			});
		})

		// Show completeMessage
		.then(() => {
			return new Promise((resolve, reject) => {
				if (templateMeta.completeMessage)
					render(templateMeta.completeMessage, metalsmith.metadata(), (err, res) => {
						if (err)
							return reject(err);

						console.log(chalk.green.bold("\n" + res.split(/\r?\n/g).map(line => "   " + line).join("\n")));


						resolve();
					});
				else {
					console.log(chalk.green.bold("\nDone!"));
					resolve();
				}

			});
		})

		// Error handler
		.catch(err => fail(err));
}

/**
 * Filter files by conditions
 *
 * @param {Object?} filters
 * @returns
 */
function filterFiles(filters) {
	return function (files, metalsmith, done) {

		if (!filters)
			return done();

		const data = metalsmith.metadata();

		const fileNames = Object.keys(files);
		Object.keys(filters).forEach(glob => {
			fileNames.forEach(file => {
				if (match(file, glob, { dot: true })) {
					const condition = filters[glob];
					if (!evaluate(condition, data)) {
						delete files[file];
					}
				}
			});
		});
		done();
	};
}


/**
 * Render a template file with handlebars
 *
 */
function renderTemplate(skipInterpolation) {
	skipInterpolation = typeof skipInterpolation === 'string' ? [skipInterpolation] : skipInterpolation;

	return function(files, metalsmith, done) {
		const keys = Object.keys(files);
		const metadata = metalsmith.metadata();

		async.each(keys, (file, next) => {

			// skipping files with skipInterpolation option
			if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
				return next()
			}

			const str = files[file].contents.toString();

			if (!/{{([^{}]+)}}/g.test(str)) {
				return next();
			}

			render(str, metadata, function (err, res) {
				if (err) return done(err);
				files[file].contents = new Buffer(res);
				next();
			});
		}, done);

	}
}
