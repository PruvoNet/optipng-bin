import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import { getFilename } from './filename.js';
import BinWrapper from '@xhmikosr/bin-wrapper';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const url = `https://raw.githubusercontent.com/PruvoNet/optipng-bin/v${pkg.version}/vendor/`;

const binWrapper = new BinWrapper()
	.src(`${url}macos/arm64/optipng.macho`, 'darwin', 'arm64')
	.src(`${url}macos/x64/optipng.macho`, 'darwin', 'x64')
	.src(`${url}linux/x64/optipng.elf`, 'linux', 'arm64')
	.src(`${url}linux/x64/optipng.elf`, 'linux', 'x64')
	.src(`${url}win/x64/optipng.exe`, 'win32', 'x64')
	.dest(fileURLToPath(new URL('../vendor', import.meta.url)))
	.use(getFilename());

export default binWrapper;
