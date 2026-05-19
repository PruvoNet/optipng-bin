import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

export const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
export const VENDOR_DIR = path.join(PACKAGE_ROOT, 'vendor');

export function binaryName() {
	return process.platform === 'win32' ? 'optipng.exe' : 'optipng';
}

export const BINARY_PATH = path.join(VENDOR_DIR, binaryName());
