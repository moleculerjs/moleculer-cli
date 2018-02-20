[![Moleculer logo](http://moleculer.services/images/banner.png)](https://github.com/ice-services/moleculer)

# Command line tool for Moleculer framework [![NPM version](https://img.shields.io/npm/v/moleculer-cli.svg)](https://www.npmjs.com/package/moleculer-cli)

## Features
- init new projects from templates
- connect to a system
- start a local broker with REPL

## Install

``` bash
npm install -g moleculer-cli
```

## Usage

**Init a new project for a module**

``` bash
moleculer init module my-module
```

**Init a new Moleculer project**

``` bash
moleculer init project-simple my-first-project
```

**Start a broker locally**
This command start a new ServiceBroker locally and switch to REPL mode.
```bash
moleculer start
```

**Start a broker and connect to a transporter**
These commands start a new ServiceBroker, connect to a transporter server and switch to REPL mode.
```bash
# With TCP transporter
moleculer connect 

# With NATS transporter
moleculer connect nats://localhost:4222

# With Redis transporter
moleculer connect redis://localhost

# With MQTT transporter
moleculer connect mqtt://localhost
```

## Documentation
Please read our [documentation on Moleculer site](http://moleculer.services/docs/moleculer-cli.html)


## Credits
The `moleculer-cli` project `init` command is based on [vue-cli](https://github.com/vuejs/vue-cli) project. 

## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
Moleculer-cli is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact
Copyright (c) 2017 Ice-Services

[![@ice-services](https://img.shields.io/badge/github-ice--services-green.svg)](https://github.com/ice-services) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)
