import { ServiceBroker } from "moleculer";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execa } from "execa";
import Stream from "node:stream";

const binPath = "./bin/moleculer.js";

describe("E2E: connect command", () => {
	const transporter = "NATS";
	const ns = "test-connect";

	let broker;
	beforeAll(async () => {
		broker = new ServiceBroker({
			namespace: ns,
			nodeID: "cli-server",
			logger: false,
			transporter: transporter
		});

		broker.createService({
			name: "greeter",
			actions: {
				welcome(ctx) {
					if (ctx.meta.greeting) {
						return `${ctx.meta.greeting} ${ctx.params.name || "Guest"}!`;
					}
					return `Hello ${ctx.params.name || "Guest"}!`;
				}
			}
		});

		await broker.start();
	});

	afterAll(async () => {
		await broker.stop();
	});

	it("should connect to the broker", async () => {
		const res = await new Promise(async resolve => {
			const rs = new Stream.Readable({ read() {}});
			let hasServerNode = false;
			let hasClientNode = false;
			for await (const line of execa({ input: rs })`node ${binPath} connect --ns ${ns} --id cli-client ${transporter}`) {
				console.log(line);
				if (line.includes("ServiceBroker with 1 service(s) started successfully")) {
					rs.push("nodes\n");
				}
				if (line.includes("cli-client (*)")) {
					hasClientNode = true;
				}
				if (line.includes("cli-server")) {
					hasServerNode = true;
				}
				if (hasServerNode && hasClientNode) {
					//resolve("STARTED");
					rs.push("call greeter.welcome --name Icebob\n");
					hasServerNode = false;
					hasClientNode = false;
				}

				if (line.includes("Hello Icebob!")) {
					resolve("STARTED");
				}
			}
		});

		expect(res).toBe("STARTED");
	});
});
