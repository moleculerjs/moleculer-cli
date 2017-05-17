/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const Moleculer = require("moleculer");
const { fail } = require("../utils");

/**
 * Yargs command
 */
module.exports = {
	command: "connect <connectionString>",
	describe: "Connect to a remote Moleculer broker",
	handler(opts) {
		const Transporter = getTransporterClassByConnectionString(opts.connectionString);

		const broker = new Moleculer.ServiceBroker({
			transporter: Transporter ? new Transporter(opts.connectionString) : null,
			nodeID: "repl-" + process.pid,
			logger: console,
			logLevel: "info",
			validation: true,
			statistics: true
		});

		broker.start().then(() => broker.repl());
	}
};

function getTransporterClassByConnectionString(cs) {
	if (cs == "local")
		return null;
	else if (cs.startsWith("nats://"))
		return Moleculer.Transporters.NATS;
	else if (cs.startsWith("mqtt://"))
		return Moleculer.Transporters.MQTT;
	else if (cs.startsWith("redis://"))
		return Moleculer.Transporters.Redis;

	fail("Invalid connection string: " + cs);
}