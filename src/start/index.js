/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const Moleculer = require("moleculer");

/**
 * Yargs command
 */
module.exports = {
	command: "start",
	describe: "Start a Moleculer broker locally",
	handler() {
		const broker = new Moleculer.ServiceBroker({
			logger: console,
			logLevel: "info",
			validation: true,
			statistics: true
		});

		broker.start().then(() => broker.repl());
	}
};
