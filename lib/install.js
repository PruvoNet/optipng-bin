'use strict';
const path = require('path');
const binBuild = require('bin-build');
const bin = require('./index.js');
const fs = require('node:fs');

(async () => {
	try {
		await bin.run(['--version']);
		console.log('optipng pre-build test passed successfully');
	} catch (error) {
		console.warn(error.message);
		console.warn('optipng pre-build test failed');
		console.info('compiling from source');

		try {
			const source = path.resolve(__dirname, '../vendor/source/optipng-0.7.8.tar.gz');
			// From https://sourceforge.net/projects/optipng/files/OptiPNG/
			await binBuild.file(source, [
				`./configure --with-system-zlib --prefix="${bin.dest()}/temp" --bindir="${bin.dest()}/temp"`,
				'make install',
			]);

			fs.renameSync(`${bin.dest()}/temp/optipng`, bin.path());
			console.log('optipng built successfully');
		} catch (error) {
			console.error(error.stack);

			// eslint-disable-next-line unicorn/no-process-exit
			process.exit(1);
		}
	}
})();
