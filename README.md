[![Moleculer logo](http://moleculer.services/images/banner.png)](https://github.com/moleculerjs/moleculer)

# Command line tool for Moleculer framework [![NPM version](https://img.shields.io/npm/v/moleculer-cli.svg)](https://www.npmjs.com/package/moleculer-cli)

## Features
- Initialize new projects from templates (Handlebars & Nunjucks support)
- Create Moleculer services interactively
- Connect to a running Moleculer system with REPL
- Call service actions and emit events from the command line
- Start a local broker with REPL

## Requirements

- Node.js >= 22

## Install

``` bash
npm install -g moleculer-cli
```

## Usage

### Initialize a new project

``` bash
# Init from an official template
moleculer init project my-first-project

# Init a module
moleculer init module my-module

# Init from a GitHub repo
moleculer init username/repo my-project

# Init from a local template
moleculer init ./my-template my-project

# Provide answers from a JSON file (non-interactive)
moleculer init project my-project --answers answers.json

# Provide answers inline
moleculer init project my-project --@name=my-project --@description="My project"

# Skip npm install
moleculer init project my-project --no-install
```

[**Official templates**](https://github.com/topics/moleculer-template)

### Create a service

``` bash
# Create a service interactively
moleculer create service

# Create a named service
moleculer create service users

# Create a TypeScript service
moleculer create service users --typescript
```

### Start a local broker

Start a new ServiceBroker locally and switch to REPL mode.

```bash
moleculer start

# With custom config
moleculer start -c moleculer.config.js

# With hot-reload
moleculer start --hot
```

### Connect to a remote broker

Start a new ServiceBroker, connect to a transporter and switch to REPL mode.

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

### Call a service action

```bash
# Call an action via NATS
moleculer call greeter.hello -t nats://localhost:4222

# Call with parameters (JSON after --)
moleculer call math.add -t nats://localhost:4222 -- --a=5 --b=3
```

### Emit an event

```bash
# Emit an event
moleculer emit user.created -t nats://localhost:4222 -- --id=123

# Broadcast an event
moleculer emit user.created -t nats://localhost:4222 --broadcast -- --id=123
```

### Alias a template

Save a template URL under a short name for use with `moleculer init`.

```bash
# Create an alias
moleculer alias-template my-template https://github.com/user/repo

# Use the alias
moleculer init my-template my-project
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
Copyright (c) 2026 MoleculerJS

[![@moleculerjs](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)
