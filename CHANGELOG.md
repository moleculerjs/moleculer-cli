<a name="0.8.2"></a>
# 0.8.2 (2025-05-30)

## What's Changed
* Fixing "init" command hanging up issue

--------------------------------------------------
<a name="0.8.1"></a>
# 0.8.1 (2022-12-17)

## What's Changed
* Support export default syntax in typescript for loaded files by @bbmarkus in https://github.com/moleculerjs/moleculer-cli/pull/55
* Remove a redundant `request` package #54 by @Leestex in https://github.com/moleculerjs/moleculer-cli/pull/57
* feat: update struct for add others types on create method by @devalexandre in https://github.com/moleculerjs/moleculer-cli/pull/60
* add raw-helper handlebars helper to init by @Karnith in https://github.com/moleculerjs/moleculer-cli/pull/64
* update moleculer-repl ^0.7.0 -> ^0.7.2 by @disce-omnes in https://github.com/moleculerjs/moleculer-cli/pull/66

--------------------------------------------------
<a name="0.8.0"></a>
# 0.8.0 (2022-01-08)

## Breaking changes
Updated `moleculer-repl` to 0.7.0. [Changelog](https://github.com/moleculerjs/moleculer-repl/releases/tag/v0.7.0)

## Changes
- update deps & audit fix
- added typescript service file generator. [#36](https://github.com/moleculerjs/moleculer-cli/pull/36)
- added test cases. [#42](https://github.com/moleculerjs/moleculer-cli/pull/42)
- config filename configurable via `MOLECULER_CONFIG` environment variable.
- fixed transporter issue in `connect` command. [#53](https://github.com/moleculerjs/moleculer-cli/pull/53)

--------------------------------------------------
<a name="0.7.1"></a>
# 0.7.1 (2020-04-09)

## Changes
- update deps & audit fix

--------------------------------------------------
<a name="0.7.0"></a>
# 0.7.0 (2020-02-12)

## Moleculer updated to latest 0.14
With this version, you can connect to only v0.14 Moleculer nodes.

## New `call` command
There is a `call` command to connect a Moleculer project & call an action with parameters. The result (stringified JSON) will be printed to the console what you can process with another tool.

The calling parameters should be started with `@` prefix. The meta parameters should be started with `#` prefix.

**Example Create Service**
```bash
moleculer create service
```

**Example with params**
```bash
moleculer call math.add --transporter NATS --@a 5 --@b 3
```

**Example with params & meta**
```bash
moleculer call math.add --transporter NATS --@a 5 --@b 3 --#meta-key MyMetaValue
```

**Example with post processing the result with [jq](https://stedolan.github.io/jq/)**
```bash
moleculer call "\$node.health" | jq '.mem.free'
```

>The transporter can be defined via `TRANSPORTER` environment variable, as well.

**Example with transporter env var**
```bash
TRANSPORTER=nats://localhost:42222 moleculer call math.add --@a 5 --@b 3
```

## New `emit` command
There is a `emit` command to connect a Moleculer project & emit an event with payload.
The calling parameters should be started with `@` prefix. The meta parameters should be started with `#` prefix.

**Example with params**
```bash
moleculer emit user.created --transporter NATS --@id 3 --@name John
```

**Example with params & meta**
```bash
moleculer emit math.add --transporter NATS --@id 3 --@name John --#meta-key MyMetaValue
```

**Example with broadcast & groups**
```bash
moleculer emit math.add --transporter NATS --broadcast --@id 3 --@name John --group accounts
```

**Example with multi groups**
```bash
moleculer emit math.add --transporter NATS --broadcast --@id 3 --@name John --group accounts --group mail
```

>The transporter can be defined via `TRANSPORTER` environment variable, as well.

**Example with transporter env var**
```bash
TRANSPORTER=nats://localhost:42222 moleculer call math.add --@a 5 --@b 3
```


## Changes
- update dependencies
- remove `--cb`, `--metrics` options
- `init` command: add `--answers <answer-json-filename>` to load answer from file instead of stdin.
- `init` command: add `--install` & `--no-install` option to enable/disable `npm install` after the files generated.
- `level` parameter for the `start`, `connect`, `call`, `emit` command to set the logging level.
--------------------------------------------------
<a name="0.6.6"></a>
# 0.6.6 (2019-03-28)

## Changes
- update dependencies
- add `promptForProjectOverwrite ` to template meta properties to skip confirmation when the target directory exists.

--------------------------------------------------
<a name="0.6.5"></a>
# 0.6.5 (2019-03-06)

## Changes
- update dependencies
- support multiple template directories by [@ccampanale](https://github.com/ccampanale) [#22](https://github.com/moleculerjs/moleculer-cli/pull/22)

--------------------------------------------------
<a name="0.6.4"></a>
# 0.6.4 (2019-02-20)

## Changes
- update dependencies

--------------------------------------------------
<a name="0.6.3"></a>
# 0.6.3 (2018-11-21)

## Changes
- update dependencies (moleculer v0.13.4, moleculer-repl v0.5.3)

--------------------------------------------------
<a name="0.6.2"></a>
# 0.6.2 (2018-10-30)

## Changes
- add templating in filenames by [@ngraef](https://github.com/ngraef)

--------------------------------------------------
<a name="0.6.1"></a>
# 0.6.1 (2018-07-25)

## Changes
- add `alias-template <template-name> <template-url>` command by [@faeron](https://github.com/faeron)

--------------------------------------------------
<a name="0.6.0"></a>
# 0.6.0 (2018-07-08)

## Changes
- update dependencies
- update Moleculer to v0.13.x

--------------------------------------------------
<a name="0.5.7"></a>
# 0.5.7 (2018-06-22)

## Changes
- add `--config` CLI option to load config file with broker options
    ```
    $ moleculer connect --config ./moleculer.config.js
    ```

--------------------------------------------------
<a name="0.5.6"></a>
# 0.5.6 (2018-04-30)

## Changes
- fix `minimatch` dependency

--------------------------------------------------
<a name="0.5.5"></a>
# 0.5.5 (2018-04-27)

## Changes
- fix existing target directory issue
- add `commands` CLI option to load custom REPL commands
    ```
    $ moleculer connect --commands ./cmd/*.js
    ```

--------------------------------------------------
<a name="0.5.4"></a>
# 0.5.4 (2018-03-05)

## Changes
- fix handleBar helpers

--------------------------------------------------
<a name="0.5.3"></a>
# 0.5.3 (2018-03-04)

## Changes
- update dependencies
- add `if_or` & `if_and` helpers
- support `skipInterpolation` in meta.json
- support `helpers` in meta.json

--------------------------------------------------
<a name="0.5.0"></a>
# 0.5.0 (2018-03-03)

## Changes
- support Moleculer v0.12.x
- update dependencies
