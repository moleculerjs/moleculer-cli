/*
 * moleculer-cli
 * Copyright (c) 2018 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

"use strict";

const fs = require("fs");
const rm = require("rimraf").sync;
const path = require("path");
const mkdirp = require("mkdirp");
const chalk = require("chalk");
const home = require("user-home");

module.exports = {
	getTempDir(dir, clear) {
		const tmp = path.join(home, ".moleculer-templates", dir.replace(/[^a-zA-Z0-9]/g, "-"));
		if (fs.existsSync(tmp) && clear) {
			rm(tmp);
		}
		mkdirp(tmp);
		return tmp;
	},

	fail(msg) {
		console.error(chalk.red.bold(msg));
		if (msg instanceof Error)
			console.error(msg);

		process.exit(1);
	},

	evaluate(exp, data) {
		/* eslint-disable no-new-func */
		const fn = new Function("data", "with (data) { return " + exp + "}");
		try {
			return fn(data);
		} catch (e) {
			console.error(chalk.red("Error when evaluating filter condition: " + exp));
		}
	}	
};