"use strict";

module.exports = function(values) {
	return {
		questions: [
			{
				type: "input",
				name: "username",
				message: "Github username:",
				default: "ice-services"
			},		
			{
				type: "input",
				name: "fullName",
				message: "Your name:",
				default: "Ice Services"
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
		]
	};
};
