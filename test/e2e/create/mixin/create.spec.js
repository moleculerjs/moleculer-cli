const YargsPromise = require("yargs-promise");
const yargs = require("yargs");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const create = require("../../../../src/create");
const answers = require("./create_answers.json");
const answers_ts = require("./create_answers_ts.json");

describe("test create", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});
	it("create js mixin", (done) => {
		const _path = `../../../../${answers.mixinFolder}/${answers.mixinName}.mixin.js`;
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(
			__dirname,
			`./mocks/${answers.mixinName}.mixin.js`
		);

		jest.mock("inquirer");
		inquirer.prompt = jest.fn().mockResolvedValue(answers);
		yargs
			.usage("Usage: $0 <command> [options]")
			.version()
			.command(create)
			.help().argv;
		const parser = new YargsPromise(yargs);
		return parser
			.parse(`create mixin ${answers.mixinName}`)
			.then(({ data, argv }) => {
				if (!fs.existsSync(pathAbsoluteFile)) {
					done.fail("file not exist");
				}

				expect(fs.existsSync(pathAbsoluteFile)).toBeTruthy();
				expect(fs.readFileSync(pathAbsoluteFile)).toEqual(
					fs.readFileSync(mockFileAbsolute)
				);

				fs.unlinkSync(pathAbsoluteFile);
				done();
			})
			.catch(({ error, argv }) => {
				done.fail(error);
			});
	});

	it("create ts mixin", (done) => {
		const _path = `../../../../${answers.mixinFolder}/${answers.mixinName}.mixin.ts`;
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(
			__dirname,
			`./mocks/${answers.mixinName}.mixin.ts`
		);

		jest.mock("inquirer");
		inquirer.prompt = jest.fn().mockResolvedValue(answers);
		yargs
			.usage("Usage: $0 <command> [options]")
			.version()
			.command(create)
			.default("--typescript", true)
			.help().argv;
		const parser = new YargsPromise(yargs);
		return parser
			.parse(`create mixin ${answers_ts.mixinName}`)
			.then(({ data, argv }) => {
				if (!fs.existsSync(pathAbsoluteFile)) {
					fs.unlinkSync(pathAbsoluteFile);
					done.fail("file not exist");
				}

				expect(fs.existsSync(pathAbsoluteFile)).toBeTruthy();
				expect(fs.readFileSync(pathAbsoluteFile)).toEqual(
					fs.readFileSync(mockFileAbsolute)
				);
				fs.unlinkSync(pathAbsoluteFile);
				done();
			})
			.catch(({ error, argv }) => {
				fs.unlinkSync(pathAbsoluteFile);

				done.fail(error);
			});
	});
});
