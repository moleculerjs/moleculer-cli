module.exports = {
	namespace: "cli",
	nodeID: "CLI",
	logger: true,
	//serializer: "ProtoBuf",
	transporter: "NATS",

	replCommands: [
		...require("./cmds/multi"),
		require("./cmds/single"),
	]
};
