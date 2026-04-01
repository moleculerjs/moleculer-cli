"use strict";

module.exports = function (values) {
	return {
		questions: [
			{
				type: "input",
				name: "fullName",
				message: "Your name:",
				default: "MoleculerJS"
			},
			{
				type: "input",
				name: "projectDescription",
				message: "Project description:",
				default: "My project"
			},
			{
				type: "confirm",
				name: "lint",
				message: "Use ESLint to lint your code?",
				default: true
			}
		],

		renderer: "nunjucks"
	};
};
