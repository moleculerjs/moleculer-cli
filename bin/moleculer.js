#!/usr/bin/env node

/* moleculer-cli
 * Copyright (c) 2025 MoleculerJS (https://github.com/moleculerjs/moleculer-cli)
 * MIT Licensed
 */

const pkg = require("../package.json");
const yargs = require("yargs");

async function init() {
	const updateNotifier = (await import("update-notifier")).default;

	updateNotifier({ pkg }).notify();

	//console.log();
	process.on("exit", function () {
		//console.log();
	});

	yargs
		.usage("Usage: $0 <command> [options]")
		.version()
		.command(require("./../src/init"))
		.command(require("./../src/start"))
		.command(require("./../src/create"))
		.command(require("./../src/connect"))
		.command(require("./../src/call"))
		.command(require("./../src/emit"))
		.command(require("./../src/alias-template"))
		.help().argv;
}

init();
