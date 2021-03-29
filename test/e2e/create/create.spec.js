const YargsPromise = require("yargs-promise");
const yargs = require("yargs");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const create = require("../../../src/create");
const answers = require("./create_answers.json");
const answers_ts = require("./create_answers_ts.json");

describe("test create",()=>{

	it("should equal test",async  (done) => {

		const file = fs.realpathSync(path.join(__dirname,"..","..",".."));
		const _path = `${file}/${answers.serviceFolder}/${answers.serviceName}.service.js`;

		jest.mock("inquirer");
		inquirer.prompt = jest.fn().mockResolvedValue(answers);
		yargs
			.usage("Usage: $0 <command> [options]")
			.version()
			.command(create)
			.help()
			.argv;
		const parser = new YargsPromise(yargs);
		await parser.parse(`create ${answers.serviceName}`);
		expect(fs.existsSync(_path)).toBeTruthy();
		fs.unlinkSync(_path);
		jest.clearAllMocks();
		done();
	});


	it("create ts service",async  (done) => {

		const file = fs.realpathSync(path.join(__dirname,"..","..",".."));
		const _path = `${file}/${answers_ts.serviceFolder}/${answers_ts.serviceName}.service.ts`;

		jest.mock("inquirer");

		inquirer.prompt = jest.fn().mockResolvedValue(answers_ts);
		yargs
			.usage("Usage: $0 <command> [options]")
			.version()
			.command(create).default('--typescript',true)
			.help()
			.argv;

		const parser = new YargsPromise(yargs);
		await parser.parse(`create service ${answers_ts.serviceName} --typescript `);
		expect(fs.existsSync(_path)).toBeTruthy();
		fs.unlinkSync(_path);

		done();
	});

});
