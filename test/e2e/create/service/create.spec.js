import { describe, it, expect, beforeAll } from "vitest";
import { execa } from "execa";

const binPath = "./bin/moleculer.js";

const rm = require("rimraf");
const path = require("path");
const fs = require("fs");

const tmp = "./tmp";

describe("E2E: create command", () => {
	beforeAll(() => {
		if (!fs.existsSync(tmp)) {
			fs.mkdirSync(tmp, { mode: 0o777 });
		} else {
			rm.sync(tmp);
			fs.mkdirSync(tmp, { mode: 0o777 });
		}
	});

	it("should create js service", async () => {
		const { stderr, exitCode } =
			await execa`node ${binPath} create service --answers ${path.resolve(__dirname, "create_answers.json")}`;

		expect(exitCode).toBe(0);
		expect(stderr).toBe("");

		const svcFile = path.join(tmp, "test.service.js");

		expect(fs.existsSync(svcFile)).toBeTruthy();
		expect(fs.readFileSync(svcFile, "utf8")).toMatchSnapshot();
		// fs.unlinkSync(svcFile);
	});

	it("should create ts service", async () => {
		const { stderr, exitCode } =
			await execa`node ${binPath} create service --typescript --answers ${path.resolve(__dirname, "create_answers.json")}`;

		expect(exitCode).toBe(0);
		expect(stderr).toBe("");

		const svcFile = path.join(tmp, "test.service.ts");

		expect(fs.existsSync(svcFile)).toBeTruthy();
		expect(fs.readFileSync(svcFile, "utf8")).toMatchSnapshot();
		// fs.unlinkSync(svcFile);
	});
});
