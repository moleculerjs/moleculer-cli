/*
 * {{projectName}}
 * Copyright (c) {{year}} {{fullName}} (https://github.com/{{username}}/{{projectName}})
 * MIT Licensed
 */

"use strict";

module.exports = {
	name: "{{serviceName}}",

	/**
	 * Default settings
	 */
	settings: {},

	/**
	 * Actions
	 */
	actions: {
		test(ctx) {
			return "Hello " + (ctx.params.name || "Anonymous");
		}
	},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() {},

	/**
	 * Service started lifecycle event handler
	 */
	started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {}
};
