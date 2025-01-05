'use strict';
const process = require('node:process');

const FILENAME_LIST = {
	darwin: 'optipng.macho',
	linux: 'optipng.elf',
	win32: 'optipng.exe',
};

function getFilename() {
	const filename = FILENAME_LIST[process.platform];
	if (!filename) {
		throw new Error('Unsupported platform');
	}

	return filename;
};

module.exports = {
	getFilename,
};