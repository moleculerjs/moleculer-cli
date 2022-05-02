/*
 * moleculer-cli
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 *
 * Based on [vue-cli](https://github.com/vuejs/vue-cli) project
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const _ = require("lodash");
const kleur = require("kleur");
const async = require("async");
const mkdirp = require("mkdirp");
const exeq = require("exeq");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const multimatch = require("multimatch");
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
	builder(yargs) {
		yargs.options({
			"answers": {
				alias: "a",
				default: null,
				describe: "Load anwers from a JSON file",
				type: "string"
			},
			"install": {
				alias: "i",
				default: null,
				describe: "Execute `npm install`",
				type: "boolean"
			},
		});
	},
	handler
};

/**
 * Default values
 */
let values = {
	year: new Date().getFullYear(),
	cliVersion: pkg.version,
	aliasedTemplates: {},
	templateDir: "template"
};

/**
 * Register handlebars helpers
 */
Handlebars.registerHelper("if_eq", (a, b, opts) => a === b ? opts.fn(this) : opts.inverse(this));
Handlebars.registerHelper("unless_eq", (a, b, opts) => a === b ? opts.inverse(this) : opts.fn(this));
Handlebars.registerHelper("if_or", (v1, v2, options) => (v1 || v2) ? options.fn(this) : options.inverse(this));
Handlebars.registerHelper("if_and", (v1, v2, options) => (v1 && v2) ? options.fn(this) : options.inverse(this));
Handlebars.registerHelper("raw-helper", (options) => options.fn());

/**
 * Handler for yargs command
 *
 * @param {any} opts
 * @returns
 */
function handler(opts) {
	Object.assign(values, opts);

	//console.log("Values:", values);

	let templateMeta;
	let metalsmith;
	let loadedAnswers;

	return Promise.resolve()

		// Load answers
		.then(() => {
			if (opts.answers) {
				loadedAnswers = require(path.resolve(opts.answers));
				console.log("Loaded answers:", loadedAnswers);
			}
		})
		// Resolve project name & folder
		.then(() => {
			values.inPlace = false;
			if (!values.projectName || values.projectName === ".") {
				values.inPlace = true;
				values.projectName = path.relative("../", process.cwd());
			}
			values.projectPath = path.resolve(values.projectName);
		})
		// check for template mapping
		.then(() => {
			return new Promise((resolve, reject) => {
				const configPath = path.join(os.homedir(), ".moleculer-templates.json");
				fs.exists(configPath, configExists => {
					if (configExists) {
						fs.readFile(configPath, (err, config) => {
							if (err) {
								return reject(`Error reading config file from ${configPath}`);
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
		// Resolve template URL from name
		.then(() => {
			let { templateName, templateRepo, aliasedTemplates } = values;
			if (aliasedTemplates[templateName]) {
				templateName = aliasedTemplates[templateName];
			}

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
					console.log("Downloading template...");
					download(values.templateRepo, values.tmp, {}, err => {
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
				if (loadedAnswers) {
					Object.assign(values, loadedAnswers);
				} else if (templateMeta.questions) {
					return inquirer.prompt(templateMeta.questions).then(answers => Object.assign(values, answers));
				}
			} else {
				templateMeta = {};
				if (loadedAnswers) {
					Object.assign(values, loadedAnswers);
				}
			}
		})

		// Check target directory
		.then(() => {
			if (fs.existsSync(values.projectPath)) {
				if (templateMeta.promptForProjectOverwrite === false) return;
				return inquirer.prompt([{
					type: "confirm",
					name: "continue",
					message: kleur.yellow().bold(`The '${values.projectName} directory is exists! Continue?`),
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
					Object.keys(templateMeta.helpers).map(key => Handlebars.registerHelper(key, templateMeta.helpers[key]));

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
					.source(values.templateDir)
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
			return Promise.resolve()
				.then(() => {
					if (opts.install != null) {
						return opts;
					}

					return inquirer.prompt([{
						type: "confirm",
						name: "install",
						message: "Would you like to run 'npm install'?",
						default: true
					}]);
				}).then(({ install }) => {
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

						console.log(kleur.green().bold("\n" + res.split(/\r?\n/g).map(line => "   " + line).join("\n")));


						resolve();
					});
				else {
					console.log(kleur.green().bold("\nDone!"));
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
	skipInterpolation = typeof skipInterpolation === "string" ? [skipInterpolation] : skipInterpolation;
	const handlebarsMatcher = /{{([^{}]+)}}/;

	return function (files, metalsmith, done) {
		const keys = Object.keys(files);
		const metadata = metalsmith.metadata();

		async.each(keys, (file, next) => {

			// skipping files with skipInterpolation option
			if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
				return next();
			}

			async.series([

				// interpolate the file contents
				function (callback) {
					const str = files[file].contents.toString();
					if (!handlebarsMatcher.test(str)) {
						return callback();
					}

					render(str, metadata, function (err, res) {
						if (err) return callback(err);
						files[file].contents = Buffer.from(res);
						callback();
					});
				},

				// interpolate the file name
				function (callback) {
					if (!handlebarsMatcher.test(file)) {
						return callback();
					}

					render(file, metadata, function (err, res) {
						if (err) return callback(err);
						// safety check to prevent file deletion in case filename doesn't change
						if (file === res) return callback();
						// safety check to prevent overwriting another file
						if (files[res]) return callback(`Cannot rename file ${file} to ${res}. A file with that name already exists.`);

						// add entry for interpolated file name
						files[res] = files[file];
						// delete entry for template file name
						delete files[file];
						callback();
					});
				}

			], function (err) {
				if (err) return done(err);
				next();
			});
		}, done);
	};
}
