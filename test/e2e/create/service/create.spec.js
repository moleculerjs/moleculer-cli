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
	it("create js service", (done) => {
		const _path = `../../../../${answers.serviceFolder}/${answers.serviceName}.service.js`;
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(
			__dirname,
			`./mocks/${answers.serviceName}.service.js`
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
			.parse(`create service ${answers.serviceName}`)
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

	it("create ts service", (done) => {
		const _path = `../../../../${answers.serviceFolder}/${answers.serviceName}.service.ts`;
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(
			__dirname,
			`./mocks/${answers.serviceName}.service.ts`
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
			.parse(`create service ${answers_ts.serviceName}`)
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
});
