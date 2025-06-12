import { ServiceBroker } from "moleculer";
import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { execa } from "execa";
import path from "node:path";

const binPath = path.resolve(__dirname, "../../../bin/moleculer.js");

describe("E2E: call command", () => {
	const transporter = "NATS";
	const ns = "test-emit";

	let broker;
	const eventHandler = vi.fn();
	beforeAll(async () => {
		broker = new ServiceBroker({
			namespace: ns,
			nodeID: "CLI",
			logger: false,
			transporter: transporter
		});

		broker.createService({
			name: "greeter",
			events: {
				"test.event": eventHandler
			}
		});

		await broker.start();
	});

	afterAll(async () => {
		await broker.stop();
	});

	beforeEach(() => {
		eventHandler.mockClear();
	});

	it("should emit an event", async () => {
		const cmd = `node ${binPath} emit --ns ${ns} -t ${transporter} test.event --@name=John`;
		const { stdout, stderr, exitCode } = await execa(cmd);
		expect(exitCode).toBe(0);
		expect(stdout).toBe("OK");
		expect(stderr).toBe("");

		expect(eventHandler).toHaveBeenCalledTimes(1);
		expect(eventHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				eventName: "test.event",
				eventType: "emit",
				eventGroups: ["greeter"],
				params: { name: "John" },
				meta: {},
				headers: {}
			})
		);
	});

	it("should broadcast an event", async () => {
		const cmd = `node ${binPath} emit --ns ${ns} -t ${transporter} --broadcast test.event --@name=Jane`;
		const { stdout, stderr, exitCode } = await execa(cmd);
		expect(exitCode).toBe(0);
		expect(stdout).toBe("OK");
		expect(stderr).toBe("");

		expect(eventHandler).toHaveBeenCalledTimes(1);
		expect(eventHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				eventName: "test.event",
				eventType: "broadcast",
				params: { name: "Jane" },
				meta: {},
				headers: {}
			})
		);
	});

	it("should broadcast an event with group but not called the greeter handler", async () => {
		const cmd = `node ${binPath} emit --ns ${ns} -t ${transporter} --broadcast --group asd test.event --@name=Jane`;
		const { stdout, stderr, exitCode } = await execa(cmd);
		expect(exitCode).toBe(0);
		expect(stdout).toBe("OK");
		expect(stderr).toBe("");

		expect(eventHandler).toHaveBeenCalledTimes(0);
	});

	it("should broadcast an event with group and called the greeter handler", async () => {
		const cmd = `node ${binPath} emit --ns ${ns} -t ${transporter} --broadcast --group greeter test.event --@name=Jane`;
		const { stdout, stderr, exitCode } = await execa(cmd);
		expect(exitCode).toBe(0);
		expect(stdout).toBe("OK");
		expect(stderr).toBe("");

		expect(eventHandler).toHaveBeenCalledTimes(1);
		expect(eventHandler).toHaveBeenCalledWith(
			expect.objectContaining({
				eventName: "test.event",
				eventType: "broadcast",
				eventGroups: ["greeter"],
				params: { name: "Jane" },
				meta: {},
				headers: {}
			})
		);
	});
});
