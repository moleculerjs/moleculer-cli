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
	command: ["start", "*"],
	describe: "Start a Moleculer broker locally",
	builder(yargs) {
		yargs.options({
			"ns": {
				default: "",
				describe: "Namespace",
				type: "string"
			},
			"id": {
				default: null,
				describe: "NodeID",
				type: "string"
			},
			"metrics": {
				alias: "m",
				default: false,
				describe: "Enable metrics",
				type: "boolean"
			},
			"hot": {
				alias: "h",
				default: false,
				describe: "Enable hot-reload",
				type: "boolean"
			},
			"cb": {
				default: false,
				describe: "Enable circuit breaker",
				type: "boolean"
			}
		});
	},
	handler(opts) {
		const broker = new Moleculer.ServiceBroker({
			namespace: opts.ns,
			nodeID: opts.id || null,
			logger: console,
			logLevel: "info",
			validation: true,
			statistics: true,
			metrics: opts.metrics,
			hotReload: opts.hot,
			circuitBreaker: {
				enabled: opts.cb
			}
		});

		broker.start().then(() => broker.repl());
	}
};
