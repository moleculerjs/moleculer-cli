import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";

const binPath = "./bin/moleculer.js";

const rm = require("rimraf");
const fs = require("fs");

const TEMPLATE_ROOT = "./test/e2e/init/templates/";
const TMP_PATH = "./tmp";

describe("E2E: init command", () => {
	describe("Init 'no-meta' template", () => {
		const templateName = "no-meta";
		const templatePath = TEMPLATE_ROOT + "/" + templateName;

		beforeEach(() => rm.sync(TMP_PATH));

		it("should generate template", async () => {
			const { stdout, stderr, exitCode } =
				await execa`node ${binPath} init ${templatePath} e2e-demo ./tmp --no-install`;

			console.log(stdout);
			expect(stdout).toContain("Done!");
			expect(exitCode).toBe(0);
			expect(stderr).toBe("");

			expect(fs.readFileSync(TMP_PATH + "/e2e-demo.project", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/index.js", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/README.md", "utf8")).toMatchSnapshot();
		}, 10_000);
	});

	describe("Init 'handlebars' template", () => {
		const templateName = "handlebars";
		const templatePath = TEMPLATE_ROOT + "/" + templateName;

		beforeEach(() => rm.sync(TMP_PATH));

		it("should generate template with lint file", async () => {
			const { stdout, stderr, exitCode } = await execa("node", [
				binPath,
				"init",
				templatePath,
				"e2e-demo",
				"./tmp",
				"--no-install",
				"--@fullName=John Doe",
				"--@projectDescription='Test project'",
				"--@lint=true"
			]);

			console.log(stdout);
			expect(stdout).toContain("Before hook");
			expect(stdout).toContain("After hook");
			expect(stdout).toContain("Complete hook");
			expect(stdout).toContain("Created project 'e2e-demo'!");
			expect(exitCode).toBe(0);
			expect(stderr).toBe("");

			expect(fs.readFileSync(TMP_PATH + "/e2e-demo.project", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/index.js", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/README.md", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/SKIP.md", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/.eslintrc.js", "utf8")).toMatchSnapshot();
		}, 10_000);

		it("should generate template without lint file", async () => {
			const { stdout, stderr, exitCode } = await execa("node", [
				binPath,
				"init",
				templatePath,
				"e2e-demo",
				"./tmp",
				"--no-install",
				"--@fullName=John Doe",
				"--@projectDescription='Test project'",
				"--@lint=false"
			]);

			console.log(stdout);
			expect(stdout).toContain("Before hook");
			expect(stdout).toContain("After hook");
			expect(stdout).toContain("Complete hook");
			expect(stdout).toContain("Created project 'e2e-demo'!");
			expect(exitCode).toBe(0);
			expect(stderr).toBe("");

			expect(fs.readFileSync(TMP_PATH + "/e2e-demo.project", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/index.js", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/README.md", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/SKIP.md", "utf8")).toMatchSnapshot();
			expect(fs.existsSync(TMP_PATH + "/.eslintrc.js")).toBe(false);
		}, 10_000);
	});

	describe("Init 'nunjucks' template", () => {
		const templateName = "nunjucks";
		const templatePath = TEMPLATE_ROOT + "/" + templateName;

		beforeEach(() => rm.sync(TMP_PATH));

		it("should generate template with lint file", async () => {
			const { stdout, stderr, exitCode } = await execa("node", [
				binPath,
				"init",
				templatePath,
				"e2e-demo",
				"./tmp",
				"--no-install",
				"--@fullName=John Doe",
				"--@projectDescription='Test project'",
				"--@lint=true"
			]);

			console.log(stdout);
			expect(stdout).toContain("Done!");
			expect(exitCode).toBe(0);
			expect(stderr).toBe("");

			expect(fs.readFileSync(TMP_PATH + "/e2e-demo.project", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/package.json", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/README.md", "utf8")).toMatchSnapshot();
		}, 10_000);

		it("should generate template without lint file", async () => {
			const { stdout, stderr, exitCode } = await execa("node", [
				binPath,
				"init",
				templatePath,
				"e2e-demo",
				"./tmp",
				"--no-install",
				"--@fullName=John Doe",
				"--@projectDescription='Test project'",
				"--@lint=false"
			]);

			console.log(stdout);
			expect(stdout).toContain("Done!");
			expect(exitCode).toBe(0);
			expect(stderr).toBe("");

			expect(fs.readFileSync(TMP_PATH + "/e2e-demo.project", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/package.json", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/README.md", "utf8")).toMatchSnapshot();
		}, 10_000);
	});

	describe("Init 'custom-renderer' template", () => {
		const templateName = "custom-renderer";
		const templatePath = TEMPLATE_ROOT + "/" + templateName;

		beforeEach(() => rm.sync(TMP_PATH));

		it("should register as alias", async () => {
			const { stdout, stderr, exitCode } =
				await execa`node ${binPath} alias-template --force asd ${templatePath}`;

			console.log(stdout);
			expect(stdout).toContain("Template alias 'asd' with value");
			expect(exitCode).toBe(0);
			expect(stderr).toBe("");
		});

		it("should generate template with custom renderer", async () => {
			const { stdout, stderr, exitCode } = await execa("node", [
				binPath,
				"init",
				"asd",
				"e2e-demo",
				"./tmp",
				"--no-install",
				"--@fullName=Jane Doe",
				"--@projectDescription='Test project'",
				"--@lint=true"
			]);

			console.log(stdout);
			expect(stdout).toContain("Done!");
			expect(stdout).toContain("Rendering file with Mustache...");
			expect(stdout).toContain("id: 306521");
			expect(exitCode).toBe(0);
			expect(stderr).toBe("");

			expect(fs.readFileSync(TMP_PATH + "/index.js", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/package.json", "utf8")).toMatchSnapshot();
			expect(fs.readFileSync(TMP_PATH + "/README.md", "utf8")).toMatchSnapshot();
		}, 10_000);
	});
});
