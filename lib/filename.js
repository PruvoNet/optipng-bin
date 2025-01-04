import process from 'node:process';

const FILENAME_LIST = {
	darwin: 'optipng.macho',
	linux: 'optipng.elf',
	win32: 'optipng.exe',
};

export const getFilename = () => {
	const filename = FILENAME_LIST[process.platform];
	if (!filename) {
		throw new Error('Unsupported platform');
	}

	return filename;
};
