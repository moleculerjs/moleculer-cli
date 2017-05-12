/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

"use strict";

const fs = require("fs");
const rm = require("rimraf").sync;
const path = require("path");
const mkdirp = require("mkdirp");
const home = require("user-home");

module.exports = {
	getTempDir(dir, clear) {
		const tmp = path.join(home, ".moleculer-templates", dir.replace(/[^a-zA-Z0-9]/g, "-"));
		if (fs.exists(tmp) && clear) {
			rm(tmp);
		}
		mkdirp(tmp);
		return tmp;
	}
};