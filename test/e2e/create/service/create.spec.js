const YargsPromise = require("yargs-promise");
const yargs = require("yargs");
const inquirerModule = (async () => (await import("inquirer")).default)();
const rm = require("rimraf").sync;
const path = require("path");
const fs = require("fs");
const create = require("../../../../src/create");
const answers = require("./create_answers.json");
const answers_ts = require("./create_answers_ts.json");
const tmp = path.resolve(__dirname, "../../../../tmp");
let inquirer;

describe("test create", () => {
	beforeAll(() => {
		if (!fs.existsSync(tmp)) {
			fs.mkdirSync(tmp, { mode: 0o777 });
		}
	});
	beforeEach(async () => {
		jest.mock("inquirer");
		inquirer = await inquirerModule;
		inquirer.prompt = jest.fn().mockResolvedValue(answers);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		rm(tmp);
	});

	it("create js service", () => {
		const _path = `../../../../${answers.serviceFolder}/${answers.serviceName}.service.js`;
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(
			__dirname,
			`./mocks/${answers.serviceName}.service.js`
		);

		yargs.usage("Usage: $0 <command> [options]").version().command(create).help().argv;
		const parser = new YargsPromise(yargs);
		return parser
			.parse(`create service ${answers.serviceName}`)
			.then(() => {
				if (!fs.existsSync(pathAbsoluteFile)) {
					throw new Error("file not exist");
				}

				expect(fs.existsSync(pathAbsoluteFile)).toBeTruthy();
				expect(fs.readFileSync(pathAbsoluteFile)).toEqual(
					fs.readFileSync(mockFileAbsolute)
				);
				fs.unlinkSync(pathAbsoluteFile);
			})
			.catch(({ error }) => {
				throw new Error(error);
			});
	});

	it("create ts service", () => {
		const _path = `../../../../${answers.serviceFolder}/${answers.serviceName}.service.ts`;
		const pathAbsoluteFile = path.resolve(__dirname, _path);
		const mockFileAbsolute = path.resolve(
			__dirname,
			`./mocks/${answers.serviceName}.service.ts`
		);

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
					throw new Error("file not exist");
				}

				expect(fs.existsSync(pathAbsoluteFile)).toBeTruthy();
				expect(fs.readFileSync(pathAbsoluteFile)).toEqual(
					fs.readFileSync(mockFileAbsolute)
				);
				fs.unlinkSync(pathAbsoluteFile);
			})
			.catch(({ error, argv }) => {
				throw new Error(error);
			});
	});
});
