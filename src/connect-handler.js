"use strict";

const Moleculer 	= require("moleculer");
const os 			= require("os");
const fs 			= require("fs");
const path 			= require("path");
const glob 			= require("glob");

module.exports = function handler(opts) {
	let replCommands;
	if (opts.commands) {
		replCommands = [];

		if (opts.commands.endsWith("/")) {
			opts.commands += "**/*.js"
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
		})
	}

	const config = (opts.config ? loadConfigFile(opts.config) : null) || { logger: true };

	if (config.logger === undefined)
		config.logger = true;

	if (opts.ns)
		config.namespace = opts.ns;

	if (opts.connectionString)
		config.transporter = opts.connectionString;
	else if (config.nodeID === undefined && opts._[0] == "connect")
		config.transporter = "TCP";

	if (opts.id)
		config.nodeID = opts.id;
	else if (config.nodeID === undefined)
		config.nodeID = `cli-${os.hostname().toLowerCase()}-${process.pid}`;

	if (opts.serializer)
		config.serializer = opts.serializer;

	if (opts.metrics)
		config.metrics = opts.metrics;

	if (opts.hot)
		config.hotReload = opts.hot;

	if (opts.cb)
		config.circuitBreaker = { enabled: opts.cb };

	if (opts.replCommands)
		config.replCommands = opts.replCommands;

	const broker = new Moleculer.ServiceBroker(config);

	broker.start().then(() => broker.repl());
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
			case ".js": {
				console.log(`Load broker configuration from '${filePath}'...`);
				return require(filePath);
			}
			default: throw new Error(`Not supported file extension: ${ext}`);
		}
	}
}
