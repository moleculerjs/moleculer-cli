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
				message: "Project description:"
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

		skipInterpolation: ["SKIP.md"],

		metalsmith: {
			async before(metalsmith, helpers) {
				console.log("Before hook");
			},

			async after(metalsmith, helpers) {
				console.log("After hook");
			},

			async complete(metalsmith, helpers) {
				console.log("Complete hook");
			}
		},

		completeMessage: `
  √  Created project '{{projectName}}'!
`
	};
};
