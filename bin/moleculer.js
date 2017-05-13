#!/usr/bin/env node

/*
 * moleculer-cli
 * Copyright (c) 2017 Ice Services (https://github.com/ice-services/moleculer-cli)
 * MIT Licensed
 */

console.log();
process.on("exit", function () {
	console.log();
});

require("yargs")
	.usage("Usage: $0 <command> [options]")
	.version(function () {
		return require("../package.json").version;
	})
	.command(require("./../src/init"))
	.command(require("./../src/create"))
	.help()
	.argv;