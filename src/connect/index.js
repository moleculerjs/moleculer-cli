/*
 * moleculer-cli
 * Copyright (c) 2018 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const { ServiceBroker } = require("moleculer");
const os = require("os");

/**
 * Yargs command
 */
module.exports = {
	command: "connect [connectionString]",
	describe: "Connect to a remote Moleculer broker",
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
			},
			"serializer": {
				default: null,
				describe: "Serializer",
				type: "string"
			}
		});
	},	
	handler(opts) {
		const broker = new ServiceBroker({
			namespace: opts.ns,
			transporter: opts.connectionString ? opts.connectionString : "TCP",
			nodeID: opts.id || `cli-${os.hostname().toLowerCase()}-${process.pid}`,
			serializer: opts.serializer,
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