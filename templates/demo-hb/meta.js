"use strict";

const exec = require("child_process").execSync;

module.exports = function (values) {
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
			},
			{
				type: "confirm",
				name: "lint",
				message: "Use ESLint to lint your code?",
				default: true
			}
		],

		filters: {
			".eslintrc.js": "lint"
		},

		metalsmith: {
			async before(metalsmith, helpers) {
				console.log("Before");
				await new Promise(resolve => setTimeout(resolve, 1000));
			},

			async after(metalsmith, helpers) {
				console.log("After");
				await new Promise(resolve => setTimeout(resolve, 1000));
			},

			async complete(metalsmith, helpers) {
				console.log("Complete", values);
				await new Promise(resolve => setTimeout(resolve, 1000));
				if (values.lint && values.wasNpmInstall) {
					console.log(
						"Linting:",
						await helpers.exec([`cd ${values.projectPath}`, "npm run lint:fix"])
					);
				}
			}
		},

		// promptForProjectOverwrite: false,

		completeMessage: `

  √  Created project '{{projectName}}'!

		cd {{projectName}}

		npm run dev

`
	};
};
