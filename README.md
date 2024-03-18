# FunRetro.io export

[![License][license-badge]][license-url]

> CLI tool to easily export [FunRetro.io](https://funretro.io/) retrospective boards using Playwright

## Installing / Getting started

It's required to have [npm](https://www.npmjs.com/get-npm) installed locally to follow the instructions.

```shell
git clone https://github.com/julykaz/funretro-export.git
cd funretro-export
npm install
npm start -- "http://funretro.io/board..." "../exported-file.txt"
```

## Issues

If you encounter the following error
```
Error: browserType.launch: Browser is not supported on current platform
Note: use DEBUG=pw:api environment variable and rerun to capture Playwright logs.
```
then execute this command:
```
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true npm i -D playwright
```

## TODO

- Export card comments
- More export options (PDF, CSV)

## Licensing

MIT License

[license-badge]: https://img.shields.io/github/license/robertoachar/docker-express-mongodb.svg
[license-url]: https://opensource.org/licenses/MIT
