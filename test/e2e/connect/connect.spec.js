import { ServiceBroker } from "moleculer";
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
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

	let stdout = "";

	async function waitFor(condition) {
		if (typeof condition === "string") {
			condition = [condition];
		}
		for (const cond of condition) {
			await vi.waitFor(() => stdout.includes(cond) || Promise.reject(new Error()), {
				timeout: 5000
			});
		}
		stdout = "";
	}

	it("should connect to the broker", async () => {
		const rs = new Stream.Readable({ read() {} });
		new Promise(async () => {
			for await (const line of execa({
				input: rs
			})`node ${binPath} connect --ns ${ns} --id cli-client  --commands ./test/cmds/*.js ${transporter}`) {
				console.log(line);
				stdout += line + "\n";
			}
		});

		await waitFor("ServiceBroker with 1 service(s) started successfully");

		rs.push("nodes\n");
		await waitFor(["cli-client (*)", "cli-server"]);

		rs.push("call greeter.welcome --name Icebob\n");
		await waitFor("Hello Icebob!");

		// Test the custom commands
		rs.push("hello\n");
		await waitFor("Hello!");

		// Test the custom commands
		rs.push("hi\n");
		await waitFor("Hi!");

		// Test the custom commands
		rs.push("bye\n");
		await waitFor("Bye!");

		rs.push("q\n");
		rs.push(null);
		await waitFor("Good bye.");

		expect(true).toBe(true);
	});
});
