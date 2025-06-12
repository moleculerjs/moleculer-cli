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

	it("should connect to the broker", async () => {
		const rs = new Stream.Readable({ read() {} });
		let stdout = "";
		new Promise(async () => {
			for await (const line of execa({
				input: rs
			})`node ${binPath} connect --ns ${ns} --id cli-client  --commands ./test/cmds/*.js ${transporter}`) {
				console.log(line);
				stdout += line + "\n";
			}
		});

		await vi.waitFor(
			() =>
				stdout.includes("ServiceBroker with 1 service(s) started successfully") ||
				Promise.reject(new Error()),
			{ timeout: 5000 }
		);
		stdout = "";

		rs.push("nodes\n");
		await vi.waitFor(() => stdout.includes("cli-client (*)") || Promise.reject(new Error()), {
			timeout: 5000
		});
		await vi.waitFor(() => stdout.includes("cli-server") || Promise.reject(new Error()), {
			timeout: 5000
		});
		stdout = "";

		rs.push("call greeter.welcome --name Icebob\n");
		await vi.waitFor(() => stdout.includes("Hello Icebob!") || Promise.reject(new Error()), {
			timeout: 5000
		});
		stdout = "";

		// Test the custom commands
		rs.push("hello\n");
		await vi.waitFor(() => stdout.includes("Hello!") || Promise.reject(new Error()), {
			timeout: 5000
		});
		stdout = "";

		// Test the custom commands
		rs.push("hi\n");
		await vi.waitFor(() => stdout.includes("Hi!") || Promise.reject(new Error()), {
			timeout: 5000
		});
		stdout = "";

		// Test the custom commands
		rs.push("bye\n");
		await vi.waitFor(() => stdout.includes("Bye!") || Promise.reject(new Error()), {
			timeout: 5000
		});
		stdout = "";

		rs.push("q\n");
		rs.push(null);
		await vi.waitFor(() => stdout.includes("Good bye.") || Promise.reject(new Error()), {
			timeout: 5000
		});

		expect(true).toBe(true);
	});
});
