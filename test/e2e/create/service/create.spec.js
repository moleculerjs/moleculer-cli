import { describe, it, beforeAll, expect } from "vitest";
const rm = require("rimraf").sync;
const path = require("path");
const fs = require("fs");
const create = require("../../../../src/create");

const tmp = path.resolve(__dirname, "../../../../tmp");

describe("test create", () => {
	beforeAll(() => {
		if (!fs.existsSync(tmp)) {
			fs.mkdirSync(tmp, { mode: 0o777 });
		} else {
			rm(tmp);
			fs.mkdirSync(tmp, { mode: 0o777 });
		}
	});

	it("create js service", async () => {
		const _path = "../../../../tmp/ola.service.js";
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(__dirname, "./mocks/ola.service.js");

		await create.handler({
			_: ["create", "service", "ola"],
			answers: path.resolve(__dirname, "create_answers.json")
		});
		if (!fs.existsSync(pathAbsoluteFile)) {
			throw new Error("file not exist");
		}

		expect(fs.existsSync(pathAbsoluteFile)).toBeTruthy();
		expect(fs.readFileSync(pathAbsoluteFile)).toEqual(fs.readFileSync(mockFileAbsolute));
		// fs.unlinkSync(pathAbsoluteFile);
	});

	it("create ts service", async () => {
		const _path = "../../../../tmp/ola.service.ts";
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(__dirname, "./mocks/ola.service.ts");

		await create.handler({
			_: ["create", "service", "ola"],
			answers: path.resolve(__dirname, "create_answers_ts.json")
		});
		if (!fs.existsSync(pathAbsoluteFile)) {
			throw new Error("file not exist");
		}

		expect(fs.existsSync(pathAbsoluteFile)).toBeTruthy();
		expect(fs.readFileSync(pathAbsoluteFile)).toEqual(fs.readFileSync(mockFileAbsolute));
		// fs.unlinkSync(pathAbsoluteFile);
	});
});
