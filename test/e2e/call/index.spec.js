import { ServiceBroker } from "moleculer";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execa } from "execa";
import path from "node:path";

const binPath = path.resolve(__dirname, "../../../bin/moleculer.js");

describe("E2E: call command", () => {
	const transporter = "NATS";
	const ns = "test-call";

	let broker;
	beforeAll(async () => {
		broker = new ServiceBroker({
			namespace: ns,
			nodeID: "CLI",
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

		console.log((await execa("ls")).stdout);
		console.log((await execa("ls '../../../bin'")).stdout);
	});

	afterAll(async () => {
		await broker.stop();
	});

	it("should call an action and return expected output with exitCode 0", async () => {
		const actionName = "greeter.welcome";
		const param = "--@name=John";
		const cmd = `node ${binPath} call --ns ${ns} -t ${transporter} ${actionName} ${param}`;
		const { stdout, stderr, exitCode } = await execa(cmd);
		expect(exitCode).toBe(0);
		expect(stdout).toBe('"Hello John!"');
		expect(stderr).toBe("");
	});

	it("should call an action with meta and return expected output with exitCode 0", async () => {
		const actionName = "greeter.welcome";
		const param = "--@name=John --#greeting=Hi";
		const cmd = `node ${binPath} call --ns ${ns} -t ${transporter} ${actionName} ${param}`;
		const { stdout, stderr, exitCode } = await execa(cmd);
		expect(exitCode).toBe(0);
		expect(stdout).toBe('"Hi John!"');
		expect(stderr).toBe("");
	});
});
