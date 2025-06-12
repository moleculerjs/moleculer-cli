/*
 * moleculer-cli
 * Copyright (c) 2025 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 *
 * Based on [vue-cli](https://github.com/vuejs/vue-cli) project
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const _ = require("lodash");
const kleur = require("kleur");
const { mkdirp } = require("mkdirp");
const exeq = require("exeq");
const download = require("download-git-repo");
const Consolidate = require("@ladjs/consolidate");
const Metalsmith = require("metalsmith");
const Handlebars = require("handlebars");
const { minimatch } = require("minimatch");
const pkg = require("../../package.json");

const { getTempDir, fail, evaluate } = require("../utils");

/**
 * Yargs command
 */
module.exports = {
	command: "init <template-name> [project-name] [project-path]",
	describe: "Create a Moleculer project from template",
	builder(yargs) {
		yargs.options({
			answers: {
				alias: "a",
				default: null,
				describe: "Load anwers from a JSON file",
				type: "string"
			},
			install: {
				alias: "i",
				default: null,
				describe: "Execute `npm install`",
				type: "boolean"
			}
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
Handlebars.registerHelper("if_eq", (a, b, opts) => (a === b ? opts.fn(this) : opts.inverse(this)));
Handlebars.registerHelper("unless_eq", (a, b, opts) =>
	a === b ? opts.inverse(this) : opts.fn(this)
);
Handlebars.registerHelper("if_or", (v1, v2, options) =>
	v1 || v2 ? options.fn(this) : options.inverse(this)
);
Handlebars.registerHelper("if_and", (v1, v2, options) =>
	v1 && v2 ? options.fn(this) : options.inverse(this)
);
Handlebars.registerHelper("raw-helper", options => options.fn());

/**
 * Handler for yargs command
 *
 * @param {any} opts
 * @returns
 */
async function handler(opts) {
	Object.assign(values, opts);

	let templateMeta;
	let metalsmith;
	let loadedAnswers;
	let rendererLib = "handlebars";

	const inquirer = (await import("inquirer")).default;

	const helpers = {
		_,
		exec: exeq,
		inquirer,
		Handlebars,
		Consolidate,
		kleur
	};

	try {
		// Load answers
		if (opts.answers) {
			loadedAnswers = require(path.resolve(opts.answers));
			console.log("Loaded answers:", loadedAnswers);
		} else {
			// Load answers from CLI parameters
			const hasAnswers = !!Object.keys(opts).find(key => key.startsWith("@"));
			if (hasAnswers) {
				loadedAnswers = {};
				Object.entries(opts)
					.filter(([key]) => key.startsWith("@"))
					.forEach(([key, value]) => {
						const name = key.slice(1);
						if (!name) {
							throw new Error(`Invalid answer key: ${name}`);
						}

						if (value === "true") {
							value = true;
						} else if (value === "false") {
							value = false;
						} else if (!Number.isNaN(Number(value))) {
							value = Number(value);
						}

						loadedAnswers[name] = value;
					});
				console.log("Answers from CLI parameters:", loadedAnswers);
			}
		}

		// Resolve project name & folder
		values.inPlace = false;
		if (!values.projectName || values.projectName === ".") {
			values.inPlace = true;
			values.projectName = path.relative("../", process.cwd());
		}
		values.projectPath = values.projectPath ?? path.resolve(values.projectName);

		// check for template mapping
		const aliasesPath = path.join(os.homedir(), ".moleculer-templates.json");
		if (fs.existsSync(aliasesPath)) {
			try {
				const aliases = await fs.promises.readFile(aliasesPath);
				values.aliasedTemplates = JSON.parse(aliases);
			} catch {
				throw new Error(`Error reading config file from ${aliasesPath}`);
			}
		}

		// Resolve template URL from name
		let { templateName, templateRepo, aliasedTemplates } = values;
		if (aliasedTemplates[templateName]) {
			templateName = aliasedTemplates[templateName];
		}

		if (/^[./]|(^[a-zA-Z]:)/.test(templateName)) {
			values.tmp = path.isAbsolute(templateName)
				? templateName
				: path.normalize(path.join(process.cwd(), templateName));

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

		// Download template
		if (values.templateRepo) {
			await new Promise((resolve, reject) => {
				console.log("Downloading template...");
				download(values.templateRepo, values.tmp, {}, err => {
					if (err) {
						reject(`Failed to download repo from '${values.templateRepo}'!`);
					} else {
						resolve();
					}
				});
			});
		}

		// Prompt questions
		const { tmp } = values;
		if (fs.existsSync(path.join(tmp, "meta.js"))) {
			templateMeta = require(path.join(tmp, "meta.js"))(values);
			rendererLib = templateMeta.renderer || "handlebars";
			if (loadedAnswers) {
				Object.assign(values, loadedAnswers);
			} else if (templateMeta.questions) {
				const answers = await inquirer.prompt(templateMeta.questions);
				Object.assign(values, answers);
			}
		} else {
			templateMeta = {};
			if (loadedAnswers) {
				Object.assign(values, loadedAnswers);
			}
		}

		// Check target directory
		if (fs.existsSync(values.projectPath)) {
			if (templateMeta.promptForProjectOverwrite !== false) {
				const answers = await inquirer.prompt([
					{
						type: "confirm",
						name: "continue",
						message: kleur
							.yellow()
							.bold(`The '${values.projectName} directory is exists! Continue?`),
						default: false
					}
				]);
				if (!answers.continue) process.exit(0);
			}
		} else {
			console.log(`Create '${values.projectPath}' folder...`);
			await mkdirp(values.projectPath);
		}

		// Install dependencies
		if (templateMeta.dependencies) {
			const deps = Object.entries(templateMeta.dependencies).map(
				([name, version]) => `${name}@${version}`
			);
			console.log("Installing dependencies...", deps.join(" "));
			await exeq(["npm install --no-save --legacy-peer-deps " + deps.join(" ")]);
		}

		const render = Consolidate[rendererLib]?.render;
		if (!render) {
			throw new Error(
				`Renderer library '${rendererLib}' is not supported! Supported libraries: handlebars, nunjuck, ejs`
			);
		}
		helpers.render = render;

		// Build template
		metalsmith = Metalsmith(values.tmp);
		Object.assign(metalsmith.metadata(), values);

		// Register custom template helpers
		if (templateMeta.helpers) {
			Object.keys(templateMeta.helpers).map(key =>
				Handlebars.registerHelper(key, templateMeta.helpers[key])
			);
		}

		// metalsmith.before
		if (_.isFunction(templateMeta.metalsmith?.before)) {
			await templateMeta.metalsmith.before.call(templateMeta, metalsmith, helpers);
		}

		await new Promise((resolve, reject) => {
			metalsmith.use(filterFiles(templateMeta));
			if (_.isFunction(templateMeta.metalsmith?.render)) {
				metalsmith.use(templateMeta.metalsmith.render);
			} else {
				metalsmith.use(renderTemplate(render, templateMeta));
			}

			// Build
			metalsmith
				.clean(false)
				.source(values.templateDir)
				.destination(
					path.isAbsolute(values.projectPath)
						? values.projectPath
						: path.join(process.cwd(), values.projectPath)
				)
				.build(err => {
					if (err) return reject(err);

					resolve();
				});
		});

		// metalsmith.after
		if (_.isFunction(templateMeta.metalsmith?.after)) {
			await templateMeta.metalsmith.after.call(templateMeta, metalsmith, helpers);
		}

		// Run 'npm install'
		let install;
		if (opts.install != null) {
			install = opts.install;
		} else {
			const answer = await inquirer.prompt([
				{
					type: "confirm",
					name: "install",
					message: "Would you like to run 'npm install'?",
					default: true
				}
			]);
			install = answer.install;
		}
		if (install) {
			console.log("\nRunning 'npm install'...");
			await exeq(["cd " + values.projectPath, "npm install"]);
			values.wasNpmInstall = true;
		}

		// metalsmith.complete
		if (_.isFunction(templateMeta.metalsmith?.complete)) {
			await templateMeta.metalsmith.complete.call(templateMeta, metalsmith, helpers);
		}

		// Show completeMessage
		if (templateMeta.completeMessage) {
			const res = await render(templateMeta.completeMessage, metalsmith.metadata());
			console.log(
				kleur.green().bold(
					"\n" +
						res
							.split(/\r?\n/g)
							.map(line => "   " + line)
							.join("\n")
				)
			);
		} else {
			console.log(kleur.green().bold("\nDone!"));
		}
	} catch (err) {
		fail(err);
	}
}

/**
 * Filter files by conditions
 *
 * @param {Object?} filters
 * @returns
 */
function filterFiles({ filters }) {
	return function (files, metalsmith, done) {
		if (!filters) return done();

		const data = metalsmith.metadata();

		const fileNames = Object.keys(files);
		Object.keys(filters).forEach(glob => {
			fileNames.forEach(file => {
				if (minimatch(file, glob, { dot: true })) {
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
 * Render a template file
 */
function renderTemplate(render, { skipInterpolation }) {
	skipInterpolation =
		typeof skipInterpolation === "string" ? [skipInterpolation] : skipInterpolation;
	const handlebarsMatcher = /{{([^{}]+)}}/;

	return async function (files, metalsmith, done) {
		const multimatch = (await import("multimatch")).default;

		const keys = Object.keys(files);
		const metadata = metalsmith.metadata();

		try {
			for (const file of keys) {
				// skipping files with skipInterpolation option
				if (
					skipInterpolation &&
					multimatch([file], skipInterpolation, { dot: true }).length
				) {
					continue;
				}

				// interpolate the file contents
				const str = files[file].contents.toString();
				files[file].contents = Buffer.from(await render(str, metadata));

				// interpolate the file name
				if (handlebarsMatcher.test(file)) {
					const res = await render(file, metadata);
					// safety check to prevent file deletion in case filename doesn't change
					if (file !== res) {
						// safety check to prevent overwriting another file
						if (files[res]) {
							throw new Error(
								`Cannot rename file ${file} to ${res}. A file with that name already exists.`
							);
						}
						// add entry for interpolated file name
						files[res] = files[file];
						// delete entry for template file name
						delete files[file];
					}
				}
			}
			done();
		} catch (err) {
			done(err);
		}
	};
}
