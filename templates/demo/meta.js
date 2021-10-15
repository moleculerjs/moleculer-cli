"use strict";

const exec = require("child_process").execSync;

module.exports = function(values) {
	return {
		questions: [
			{
				type: "input",
				name: "username",
				message: "Github username:",
				default() {
					return exec("git config --get user.name").toString().trim();
				}
			},		
			{
				type: "input",
				name: "fullName",
				message: "Your name:",
				default: "MoleculerJS"
			},		
			{
				type: "input",
				name: "projectDescription",
				message: "Project description:"
			},
			{
				type: "input",
				name: "serviceName",
				message: "Service name:",
				default() {
					return values.projectName.replace("moleculer-", "");
				}
			}
		],

		filters: {
			".eslintrc.js": "eslint"
		},

		metalsmith: {
			before(metalsmith) {
				console.log("Before");
			},

			after(metalsmith) {
				console.log("After");
			},

			complete(metalsmith) {
				console.log("Complete");
			}
		},

		completeMessage: `

  √  Created project '{{projectName}}'!

		cd {{projectName}}

		npm run dev

`
	};
};
