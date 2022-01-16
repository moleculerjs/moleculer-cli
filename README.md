[![Moleculer logo](http://moleculer.services/images/banner.png)](https://github.com/moleculerjs/moleculer)

# Command line tool for Moleculer framework [![NPM version](https://img.shields.io/npm/v/moleculer-cli.svg)](https://www.npmjs.com/package/moleculer-cli)

## Features
- initialize new projects from templates
- connect to a system
- start a local broker with REPL

## Install

``` bash
npm install -g moleculer-cli
```

## Usage

### Initialize new project

**Init a new project for a module**

``` bash
moleculer init module my-module
```

**Init a new Moleculer project**

``` bash
moleculer init project my-first-project
```

[**Official templates**](https://github.com/topics/moleculer-template)

### Start a broker

**Start a broker locally**
This command starts a new ServiceBroker locally and switches to REPL mode.
```bash
moleculer start
```

**Start a broker and connect to a transporter**
The following commands start a new ServiceBroker, connect to a transporter server and switch to REPL mode.

```bash
# With TCP transporter
moleculer connect 

# With NATS transporter (you need to install NATS lib globally with `npm i nats -g` command)
moleculer connect nats://localhost:4222

# With Redis transporter (you need to install Redis lib globally with `npm i ioredis -g` command)
moleculer connect redis://localhost

# With MQTT transporter (you need to install MQTT lib globally with `npm i mqtt -g` command)
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
Copyright (c) 2022 MoleculerJS

[![@moleculerjs](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)
