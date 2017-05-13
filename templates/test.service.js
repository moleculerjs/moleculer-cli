"use strict";

module.exports = {
	name: "test",
	actions: {
		hello: {
			responseType: "text/plain",
			handler(ctx) {
				return "Hello Moleculer";
			}
		},

		greeter: {
			params: {
				name: "string"
			},
			handler(ctx) {
				return `Hello ${ctx.params.name}`;
			}
		}
	}
};
