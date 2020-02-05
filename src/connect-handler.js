"use strict";

const Moleculer 	= require("moleculer");
const os 			= require("os");
const fs 			= require("fs");
const path 			= require("path");
const glob 			= require("glob");

module.exports = async function handler(opts) {
	let replCommands;
	if (opts.commands) {
		replCommands = [];

		if (opts.commands.endsWith("/")) {
			opts.commands += "**/*.js";
		}

		const files = glob.sync(opts.commands);
		files.forEach(file => {
			console.log(`Load custom REPL commands from '${file}'...`);
			try {
				let cmd = require(path.resolve(file));
				if (!Array.isArray(cmd))
					cmd = [cmd];

				replCommands.push(...cmd);
			} catch(err) {
				console.error(err);
			}
		});
	}

	const config = (opts.config ? loadConfigFile(opts.config) : null) || {};

	if (config.logger === undefined)
		config.logger = true;

	if (opts.level) {
		if (opts.level == "silent")
			config.logger = false;
		else
			config.logLevel = opts.level;
	}

	if (opts.ns)
		config.namespace = opts.ns;

	if (opts.transporter)
		config.transporter = opts.transporter;
	else if (opts.connectionString)
		config.transporter = opts.connectionString;
	else if (process.env.TRANSPORTER)
		config.transporter = process.env.TRANSPORTER;
	else if (config.nodeID === undefined && opts._[0] == "connect")
		config.transporter = "TCP"; // TCP the default if no connection string

	if (opts.id)
		config.nodeID = opts.id;
	else if (config.nodeID === undefined)
		config.nodeID = `cli-${os.hostname().toLowerCase()}-${process.pid}`;

	if (opts.serializer)
		config.serializer = opts.serializer;

	if (opts.hot)
		config.hotReload = opts.hot;

	if (replCommands)
		config.replCommands = replCommands;

	const broker = new Moleculer.ServiceBroker(config);

	await broker.start();

	return broker;
};

/**
 * Load configuration file
 *
 */
function loadConfigFile(configFile) {
	const filePath = path.isAbsolute(configFile) ? configFile : path.resolve(process.cwd(), configFile);
	if (filePath) {
		if (!fs.existsSync(filePath))
			throw new Error(`Config file not found: ${filePath}`);

		const ext = path.extname(filePath);
		switch (ext) {
			case ".json":
			case ".ts":
			case ".js": {
				console.log(`Load broker configuration from '${filePath}'...`);
				return require(filePath);
			}
			default: throw new Error(`Not supported file extension: ${ext}`);
		}
	}
}
