const YargsPromise = require("yargs-promise");
const yargs = require("yargs");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const create = require("../../../src/create");
const answers = require("./create_answers.json");
const answers_ts = require("./create_answers_ts.json");
const file_mock = fs.realpathSync(path.join(__dirname));
describe("test create",()=>{

	afterEach(() => {
		jest.clearAllMocks();
	});
	it("create js service",  (done) => {

		const file = fs.realpathSync(path.join(__dirname,"..","..",".."));
		const _path = `${file}/${answers.serviceFolder}/${answers.serviceName}.service.js`;
		const _mock_file = `${file_mock}/${answers.serviceName}.service.js`;

		jest.mock("inquirer");
		inquirer.prompt = jest.fn().mockResolvedValue(answers);
		yargs
			.usage("Usage: $0 <command> [options]")
			.version()
			.command(create)
			.help()
			.argv;
		const parser = new YargsPromise(yargs);
		return  parser.parse(`create ${answers.serviceName}`)
			.then(({data, argv}) => {
				if(!fs.existsSync(_path))
					done.fail("file not exist");
				expect(fs.existsSync(_path)).toBeTruthy();
				expect(fs.readFileSync(_path)).toEqual(fs.readFileSync(_mock_file));
				fs.unlinkSync(_path);
				done();
			})
			.catch(({error, argv}) => {
				done.fail(error);
			});

	});


	it("create ts service",  (done) => {

		const file = fs.realpathSync(path.join(__dirname,"..","..",".."));
		const _path = `${file}/${answers_ts.serviceFolder}/${answers_ts.serviceName}.service.ts`;
		const _mock_file = `${file_mock}/${answers.serviceName}.service.ts`;

		jest.mock("inquirer");

		inquirer.prompt = jest.fn().mockResolvedValue(answers_ts);
		yargs
			.usage("Usage: $0 <command> [options]")
			.version()
			.command(create).default("--typescript",true)
			.help()
			.argv;

		const parser = new YargsPromise(yargs);
		return  parser.parse(`create service ${answers_ts.serviceName} --typescript `)
			.then(({data, argv}) => {
				if(!fs.existsSync(_path))
					done.fail("file not exist");
				expect(fs.existsSync(_path)).toBeTruthy();
				expect(fs.readFileSync(_path)).toEqual(fs.readFileSync(_mock_file));
				fs.unlinkSync(_path);
				done();
			})
			.catch(({error, argv}) => {
				done.fail(error);
			});

	});

});
