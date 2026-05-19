#!/usr/bin/env node
import {spawn} from 'node:child_process';
import process from 'node:process';
import optipng from './index.js';

const child = spawn(optipng, process.argv.slice(2), {stdio: 'inherit'});
child.on('exit', code => process.exit(code ?? 0));
child.on('error', error => {
	console.error(error);
	process.exit(1);
});
