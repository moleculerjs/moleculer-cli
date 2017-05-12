/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const async = require("async");
const mkdirp = require("mkdirp");
const exeq = require("exeq");
const ora = require("ora");
const download = require("download-git-repo");

const utils = require("../utils");
const inquirer = require("inquirer");
const render = require("consolidate").handlebars.render;
const Metalsmith = require("metalsmith");

/**
 * 
 */
module.exports = {
	command: "init <template-name> [project-name]",
	describe: "Create a Moleculer project from template",
	handler: init
};

/**
 * Default values
 */
let values = {
	year: new Date().getFullYear()
};

/**
 * 
 * 
 * @param {any} msg 
 */
function fail(msg) {
	console.error(chalk.red.bold(msg));
	if (msg instanceof Error)
		console.error(msg);

	process.exit(1);
}

/**
 * 
 * 
 * @param {any} opts 
 * @returns 
 */
function init(opts) {
	Object.assign(values, opts);

	let templateMeta;
	let metalsmith;

	return Promise.resolve()
		.then(() => {
			// Resolve project name & folder
			values.inPlace = false;
			if (!values.projectName || values.projectName === ".") {
				values.inPlace = true;
				values.projectName = path.relative("../", process.cwd());
			}
			values.projectPath = path.resolve(values.projectName);

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
		.then(() => {
			// Resolve template URL from name
			let { templateName, templateRepo } = values;

			if (templateName.indexOf("/") === -1) {
				templateRepo = `ice-services/moleculer-template-${templateName}`;
			} else {
				templateRepo = templateName;
			}

			values.templateRepo = templateRepo;
			values.tmp = utils.getTempDir(templateName, true);

			console.log("Template repo:", templateRepo);
			//console.log("Temp:", values.tmp);
		})
		.then(() => {
			// Download template
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
		})
		.then(() => {
			// Prompt questions
			const { tmp } = values;
			if (fs.existsSync(path.join(tmp, "meta.js"))) {
				templateMeta = require(path.join(tmp, "meta.js"))(values);
				if (templateMeta.questions) {
					return inquirer.prompt(templateMeta.questions).then(answers => Object.assign(values, answers));
				}
			}
		})
		.then(() => {
			// Build template
			return new Promise((resolve, reject) => {
				metalsmith = Metalsmith(values.tmp);
				console.log(Object.assign(metalsmith.metadata(), values));
				metalsmith
					.use(renderTemplate)
					.clean(true)
					.source("template")
					.destination(values.projectPath)
					.build(err => {
						if (err)
							return reject(err);

						resolve();
					});

			});
		})
		.then(() => {
			// Run 'npm install'
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
		.then(() => {

		})
		.then(() => {
			// Show completeMessage
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
		.catch(err => fail(err));
}

/**
 * 
 * 
 * @param {any} files 
 * @param {any} metalsmith 
 * @param {any} done 
 */
function renderTemplate(files, metalsmith, done) {
	const keys = Object.keys(files);
	const metadata = metalsmith.metadata();

	async.each(keys, run, done);

	function run(file, done) {
		const str = files[file].contents.toString();

		if (!/{{([^{}]+)}}/g.test(str)) {
			return done();
		}

		render(str, metadata, function (err, res) {
			if (err) return done(err);
			files[file].contents = new Buffer(res);
			done();
		});
	}
}