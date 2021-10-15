/*
 * moleculer-cli
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

"use strict";

const fs = require("fs");
const rm = require("rimraf").sync;
const path = require("path");
const mkdirp = require("mkdirp").sync;
const kleur = require("kleur");
const os = require("os");

module.exports = {
	getTempDir(dir, clear) {
		const tmp = path.join(os.homedir(), ".moleculer-templates", dir.replace(/[^a-zA-Z0-9]/g, "-"));
		if (fs.existsSync(tmp) && clear) {
			rm(tmp);
		}
		mkdirp(tmp);
		return tmp;
	},

	fail(msg) {
		console.error(kleur.red().bold(msg));
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
			console.error(kleur.red("Error when evaluating filter condition: " + exp));
		}
	}
};
