/*
 * moleculer-cli
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const addMixin = require("./mixin");
const addService = require("./service");

/**
 * Yargs command
 */
module.exports = {
	command: ["create", "<fileType>", "<name>"],
	describe: `Create a Moleculer service or mixin`,
	builder(yargs) {
		yargs.options({
			typescript: {
				describe: "Create service or mixin for typescript",
				type: "boolean",
				default: false,
			},
		});
	},
	handler(opts) {
		const fileType = opts._[1];
		switch (fileType) {
			case "service":
				return addService(opts);
			case "mixin":
				return addMixin(opts);
		}
	},
};
