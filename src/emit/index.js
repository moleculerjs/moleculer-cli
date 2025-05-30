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
	command: "emit <eventName>",
	describe: "Connect & emit an event",
	builder(yargs) {
		yargs.options({
			"config": {
				alias: "c",
				default: "",
				describe: "Load configuration from a file",
				type: "string"
			},
			"transporter": {
				alias: "t",
				default: null,
				describe: "Transporter connection string (NATS, nats://127.0.0.1:4222, ...etc)",
				type: "string"
			},
			"ns": {
				default: "",
				describe: "Namespace",
				type: "string"
			},
			"level": {
				default: "silent",
				describe: "Logging level",
				type: "string"
			},
			"id": {
				default: null,
				describe: "NodeID",
				type: "string"
			},
			"serializer": {
				default: null,
				describe: "Serializer",
				type: "string"
			},
			"broadcast": {
				alias: "b",
				default: false,
				describe: "Send broadcast event",
				type: "boolean"
			},
			"group": {
				alias: "g",
				default: null,
				describe: "Event groups",
				type: "string"
			}
		});
	},

	async handler(opts) {
		try {
			//console.log(opts);
			const broker = await connectHandler(opts);

			const params = {};
			const meta = {};

			Object.keys(opts).map(key => {
				if (key.startsWith("@"))
					params[key.slice(1)] = opts[key];
				if (key.startsWith("#"))
					meta[key.slice(1)] = opts[key];
			});

			if (opts.level != "silent") {
				console.log("Params:", params);
				console.log("Meta:", meta);
				console.log("Groups:", opts.group);
			}

			if (opts.broadcast)
				await broker.broadcast(opts.eventName, params, { meta, groups: opts.group });
			else
				await broker.emit(opts.eventName, params, { meta, groups: opts.group });

			console.log("OK");

			await broker.stop();
			process.exit(0);
		} catch(err) {
			console.error("ERROR", err);
			process.exit(1);
		}
	}
};
