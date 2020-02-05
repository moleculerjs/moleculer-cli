/*
 * moleculer-cli
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const connectHandler = require("../connect-handler");

/**
 * Yargs command
 */
module.exports = {
	command: "connect [connectionString]",
	describe: "Connect to a remote Moleculer broker",
	builder(yargs) {
		yargs.options({
			"config": {
				alias: "c",
				default: "",
				describe: "Load configuration from a file",
				type: "string"
			},
			"ns": {
				default: "",
				describe: "Namespace",
				type: "string"
			},
			"level": {
				default: "info",
				describe: "Logging level",
				type: "string"
			},
			"id": {
				default: null,
				describe: "NodeID",
				type: "string"
			},
			"hot": {
				alias: "h",
				default: false,
				describe: "Enable hot-reload",
				type: "boolean"
			},
			"serializer": {
				default: null,
				describe: "Serializer",
				type: "string"
			},
			"commands": {
				default: null,
				describe: "Custom REPL command file mask (e.g.: ./commands/*.js)",
				type: "string"
			}
		});
	},

	async handler(opts) {
		const broker = await connectHandler(opts);
		broker.repl();
	}
};
