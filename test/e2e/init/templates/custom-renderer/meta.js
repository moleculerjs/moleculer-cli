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

		dependencies: {
			axios: "latest",
			mustache: "latest"
		},

		metalsmith: {
			async before(metalsmith, helpers) {
				const axios = require("axios");
				const res = await axios.get("https://api.github.com/users/icebob");
				console.log("Res:", res.data);
			},

			render(files, metalsmith, done) {
				const Mustache = require("mustache");

				for (const [name, file] of Object.entries(files)) {
					console.log("Rendering file with Mustache...", name);
					const str = file.contents.toString();
					files[name].contents = Buffer.from(Mustache.render(str, values));
				}
				done();
			}
		}
	};
};
