"use strict";

module.exports = function (values) {
	return {
		questions: [
			{
				type: "input",
				name: "username",
				message: "Github username:",
				default: "Icebob"
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

		dependencies: {
			axios: "latest"
		},

		// renderer: "nunjucks",

		metalsmith: {
			async before(metalsmith, helpers) {
				const axios = require("axios");
				const res = await axios.get("https://api.github.com/users/" + values.username);
				console.log("Res:", res.data);
			},

			render(files, metalsmith, done) {
				const _ = require("lodash");
				_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

				for (const [name, file] of Object.entries(files)) {
					console.log("Rendering file...", name);
					const str = file.contents.toString();
					const compiled = _.template(str);
					files[name].contents = Buffer.from(compiled(values));
				}
				done();
			}
		}
	};
};
