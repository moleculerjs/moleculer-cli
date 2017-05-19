/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

const chalk = require("chalk");
const fs = require("fs");
const os = require("os");
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
	console.log(chalk.magenta("Incoming event!"), payload);
};

/**
 * Connect to transporter & start REPL mode
 * @param {Object} opts
 * @returns 
 */
function startRepl(opts) {

	const Transporter = getTransporterClassByConnectionString(opts.connectionString);

	const broker = new Moleculer.ServiceBroker({
		transporter: Transporter ? new Transporter(opts.connectionString) : null,
		nodeID: `cli-${os.hostname()}-${process.pid}`,
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
				broker.call(args.actionName, JSON.parse(args.params || "{}"))
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
				console.log(chalk.green("Event sent."));
			});

		// Register load service file
		vorpal
			.command("load <servicePath>", "Load a service from file")
			.action((args, done) => {
				let filePath = path.resolve(args.servicePath);
				if (fs.existsSync(filePath)) {
					console.log(chalk.yellow(`Load '${filePath}'...`));
					let service = broker.loadService(filePath);
					if (service)
						console.log(chalk.green("Loaded successfully!"));
				} else {
					console.warn(chalk.red("The service file is not exists!", filePath));
				}
				done();
			});	

		// Register load service folder
		vorpal
			.command("loadFolder <serviceFolder> [fileMask]", "Load all service from folder")
			.action((args, done) => {
				let filePath = path.resolve(args.serviceFolder);
				if (fs.existsSync(filePath)) {
					console.log(chalk.yellow(`Load services from '${filePath}'...`));
					const count = broker.loadServices(filePath, args.fileMask);
					console.log(chalk.green(`Loaded ${count} services!`));
				} else {
					console.warn(chalk.red("The folder is not exists!", filePath));
				}
				done();
			});	

		// Subscribe to event
		vorpal
			.command("subscribe <eventName>", "Subscribe to an event")
			.action((args, done) => {
				broker.on(args.eventName, eventHandler);
				console.log(chalk.green("Subscribed successfully!"));
				done();
			});		

		// Unsubscribe to event
		vorpal
			.command("unsubscribe <eventName>", "Unsubscribe from an event")
			.action((args, done) => {
				broker.off(args.eventName, eventHandler);
				console.log(chalk.green("Unsubscribed successfully!"));
				done();
			});		

		// Start REPL
		vorpal
			.delimiter("mol $")
			.show();
	});
}

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