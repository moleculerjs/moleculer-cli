import { vi, describe, it, expect } from "vitest";
import { execa } from "execa";
import Stream from "node:stream";

const binPath = "./bin/moleculer.js";

describe("E2E: start command", () => {
	const ns = "test-start";

	it("should start a local broker", async () => {
		const rs = new Stream.Readable({ read() {} });
		let stdout = "";
		new Promise(async () => {
			for await (const line of execa({
				input: rs
			})`node ${binPath} start --ns ${ns} --id client --commands ./test/cmds/*.js`) {
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
		await vi.waitFor(() => stdout.includes("client (*)") || Promise.reject(new Error()), {
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

		// rs.push("call greeter.welcome --name Icebob\n");
		// await vi.waitFor(() => stdout.includes("Hello Icebob!") || Promise.reject(new Error()), {
		// 	timeout: 5000
		// });
		// stdout = "";

		rs.push("q\n");
		rs.push(null);
		await vi.waitFor(() => stdout.includes("Good bye.") || Promise.reject(new Error()), {
			timeout: 5000
		});

		expect(true).toBe(true);
	});
});
