module.exports = [
	{
		command: "hello",
		description: "Say hello",
		action(broker, args, helpers) {
			console.log("Hello!");
			return Promise.resolve();
		},
	},
	{
		command: "bye",
		description: "Say bye",
		action(broker, args, helpers) {
			console.log("Bye!");
			return Promise.resolve();
		},
	},
];
