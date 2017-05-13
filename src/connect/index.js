/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const fs = require("fs");
const path = require("path");
const vorpal = require("vorpal")();
const Moleculer = require("moleculer");
const { fail } = require("../utils");

/**
 * Yargs command
 */
module.exports = {
	command: "connect <connectionString>",
	describe: "Connect to a remote Moleculer broker",
	handler(opts) {
		startRepl(opts);
	}
};

const eventHandler = payload => {
	console.log("Incoming event!", payload);
};

/**
 * Connect to transporter & start REPL mode
 * @param {Object} opts
 * @returns 
 */
function startRepl(opts) {

	const Transporter = getTransporterClassByConnectionString(opts.connectionString);
	if (!Transporter) {
		fail("Invalid connection string: " + opts.connectionString);
	}

	const broker = new Moleculer.ServiceBroker({
		transporter: new Transporter(opts.connectionString),
		nodeID: "repl-" + process.pid,
		logger: console,
		logLevel: "info",
		validation: true
	});

	broker.start().then(() => {

		// Register broker.call
		vorpal
			.command("call <actionName> [params]", "Call an action")
			.action((args, done) => {
				console.log(`Call '${args.actionName}' with`, args.params);
				broker.call(args.actionName, JSON.parse(args.params || {}))
					.then(res => console.log(res))
					.catch(err => console.error(err.message, err.stack, err.data))
					.finally(done);
			});

		// Register broker.emit
		vorpal
			.command("emit <eventName> [payload]", "Emit an event")
			.action((args, done) => {
				console.log(`Emit '${args.eventName}' with`, args.payload);
				broker.emit(args.eventName, args.payload);
				console.log("Event sent.");
			});

		// Register load service file
		vorpal
			.command("load <servicePath>", "Load a service from file")
			.action((args, done) => {
				let filePath = path.resolve(args.servicePath);
				if (fs.existsSync(filePath)) {
					console.log(`Load '${filePath}'...`);
					let service = broker.loadService(filePath);
					if (service)
						console.log("Loaded successfully!");
				} else {
					console.warn("The service file is not exists!", filePath);
				}
				done();
			});	

		// Subscribe to event
		vorpal
			.command("subscribe <eventName>", "Subscribe to an event")
			.action((args, done) => {
				broker.on(args.eventName, eventHandler);
				console.log("Subscribed successfully!");
				done();
			});		

		// Unsubscribe to event
		vorpal
			.command("unsubscribe <eventName>", "Unsubscribe from an event")
			.action((args, done) => {
				broker.off(args.eventName, eventHandler);
				console.log("Unsubscribed successfully!");
				done();
			});		

		// Start REPL
		vorpal
			.delimiter("mol $")
			.show();
	});
}

function getTransporterClassByConnectionString(cs) {
	if (cs.startsWith("nats://"))
		return Moleculer.Transporters.NATS;
	else if (cs.startsWith("mqtt://"))
		return Moleculer.Transporters.MQTT;
	else if (cs.startsWith("redis://"))
		return Moleculer.Transporters.Redis;
}