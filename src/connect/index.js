/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const { ServiceBroker } = require("moleculer");
const os = require("os");

/**
 * Yargs command
 */
module.exports = {
	command: "connect <connectionString>",
	describe: "Connect to a remote Moleculer broker",
	handler(opts) {
		const broker = new ServiceBroker({
			transporter: opts.connectionString ? opts.connectionString : null,
			nodeID: `cli-${os.hostname().toLowerCase()}-${process.pid}`,
			logger: console,
			logLevel: "info",
			validation: true,
			statistics: true
		});

		broker.start().then(() => broker.repl());
	}
};