'use strict';
const { getFilename } = require('./filename.js');
const path = require('path');
const BinWrapper = require('bin-wrapper');
const packageJson = require('../package.json');
const url = `https://raw.githubusercontent.com/PruvoNet/optipng-bin/v${packageJson.version}/vendor/`;

module.exports = new BinWrapper()
	.src(`${url}macos/arm64/optipng.macho`, 'darwin', 'arm64')
	.src(`${url}macos/x64/optipng.macho`, 'darwin', 'x64')
	.src(`${url}linux/x64/optipng.elf`, 'linux', 'arm64')
	.src(`${url}linux/x64/optipng.elf`, 'linux', 'x64')
	.src(`${url}win/x64/optipng.exe`, 'win32', 'x64')
	.dest(path.resolve(__dirname, '../vendor'))
	.use(getFilename());