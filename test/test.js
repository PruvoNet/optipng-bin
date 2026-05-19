import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {temporaryDirectory} from 'tempy';
import optipng from '../index.js';

test('binary exists and reports a version', t => {
	const result = spawnSync(optipng, ['--version'], {encoding: 'utf8'});
	t.is(result.status, 0);
	t.regex(result.stdout, /OptiPNG/i);
});

test('minifies a png', t => {
	const tmp = temporaryDirectory();
	const src = fileURLToPath(new URL('fixtures/test.png', import.meta.url));
	const dst = path.join(tmp, 'test.png');

	const result = spawnSync(optipng, ['-strip', 'all', '-clobber', '-out', dst, src]);
	t.is(result.status, 0);

	const srcSize = fs.statSync(src).size;
	const dstSize = fs.statSync(dst).size;
	t.true(dstSize < srcSize, `expected ${dstSize} < ${srcSize}`);
});
