module.exports = {
	command: "hi",
	description: "Say hi",
	action(broker, args, helpers) {
		console.log("Hi!");
		return Promise.resolve();
	},
};
