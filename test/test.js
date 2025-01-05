'use strict';
const fs = require('fs');
const path = require('path');
const test = require('ava');
const execa = require('execa');
const tempy = require('tempy');
const binCheck = require('bin-check');
const binBuild = require('bin-build');
const compareSize = require('compare-size');
const optipng = require('..');

test('rebuild the optipng binaries', async t => {
	// Skip the test on Windows
	if (process.platform === 'win32') {
		t.pass();
		return;
	}

	const temporary = tempy.directory();
	const source = path.resolve(__dirname, '../vendor/source/optipng-0.7.8.tar.gz');

	await binBuild.file(source, [
		`./configure --with-system-zlib --prefix="${temporary}" --bindir="${temporary}"`,
		'make install',
	]);

	t.true(fs.existsSync(path.join(temporary, 'optipng')));
});

test('return path to binary and verify that it is working', async t => {
	t.true(await binCheck(optipng, ['--version']));
});

test('minify a PNG', async t => {
	const temporary = tempy.directory();
	const sourcePath = path.resolve(__dirname, 'fixtures/test.png');
	const destinationPath = path.join(temporary, 'test.png');
	const arguments_ = [
		'-strip',
		'all',
		'-clobber',
		'-out',
		destinationPath,
		sourcePath,
	];

	await execa(optipng, arguments_);
	const result = await compareSize(sourcePath, destinationPath);

	t.true(result[destinationPath] < result[sourcePath]);
});
