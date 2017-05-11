"use strict";

exports.variables = {
	brand: "Project brand name (without 'moleculer-' prefix): ",
	project: function(values, cb) {
		cb("moleculer-" + values.brand);
	},
	username: 'Project username: ',
	name: 'Enter your name: ',
	description: 'Project description: '
};
