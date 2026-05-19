import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {spawnSync, execSync} from 'node:child_process';
import binBuild from 'bin-build';
import {BINARY_PATH, VENDOR_DIR, PACKAGE_ROOT, binaryName} from './binary.js';

const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));

function detectLibc() {
	if (process.platform !== 'linux') {
		return null;
	}

	try {
		const out = execSync('getconf GNU_LIBC_VERSION 2>&1 || ldd --version 2>&1 || true', {encoding: 'utf8'});
		if (/musl/i.test(out)) {
			return 'musl';
		}
	} catch {
		// fallthrough to glibc
	}

	return 'glibc';
}

function tarballName() {
	const libc = detectLibc();
	const suffix = libc === 'musl' ? '-musl' : '';
	return `${pkg.name}-v${pkg.version}-${process.platform}-${process.arch}${suffix}.tar.gz`;
}

function tarballUrl() {
	const {host, remote_path: remotePath} = pkg.binary;
	const remote = remotePath.replace('{version}', pkg.version);
	return `${host.replace(/\/+$/, '')}/${remote.replace(/^\/+/, '')}/${tarballName()}`;
}

function binaryRuns() {
	if (!fs.existsSync(BINARY_PATH)) {
		return false;
	}

	const result = spawnSync(BINARY_PATH, ['--version'], {stdio: 'ignore'});
	return result.status === 0;
}

async function downloadPrebuilt() {
	const url = tarballUrl();
	console.log(`${pkg.name}: downloading prebuilt from ${url}`);
	const response = await fetch(url, {redirect: 'follow'});
	if (!response.ok || !response.body) {
		throw new Error(`HTTP ${response.status} ${response.statusText} from ${url}`);
	}

	fs.mkdirSync(VENDOR_DIR, {recursive: true});
	const tempPath = path.join(VENDOR_DIR, `_dl.${process.pid}.tgz`);
	try {
		await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(tempPath));
		// Pass tar a *relative* filename via cwd, not an absolute path.
		// Windows' bsdtar treats `C:\...` as a `host:path` remote spec
		// ("Cannot connect to C: resolve failed"); using a basename with
		// cwd avoids that ambiguity and works identically on POSIX.
		const tar = spawnSync('tar', ['-xzf', path.basename(tempPath)], {cwd: VENDOR_DIR, stdio: 'inherit'});
		if (tar.status !== 0) {
			throw new Error(`tar extraction exited with status ${tar.status}`);
		}
	} finally {
		try {
			fs.unlinkSync(tempPath);
		} catch {}
	}

	if (!fs.existsSync(BINARY_PATH)) {
		throw new Error(`tarball did not contain ${binaryName()}; expected at ${BINARY_PATH}`);
	}

	if (process.platform !== 'win32') {
		fs.chmodSync(BINARY_PATH, 0o755);
	}
}

async function buildFromSource() {
	console.log(`${pkg.name}: compiling from source`);
	const source = path.join(PACKAGE_ROOT, 'vendor', 'source', 'optipng-0.7.8.tar.gz');
	const tempDir = path.join(VENDOR_DIR, 'temp');
	const config = [
		`./configure --with-system-zlib`,
		`--prefix="${tempDir}" --bindir="${tempDir}"`,
	].join(' ');

	await binBuild.file(source, [
		config,
		'make install',
	]);

	fs.mkdirSync(VENDOR_DIR, {recursive: true});
	fs.renameSync(path.join(tempDir, binaryName()), BINARY_PATH);
}

async function main() {
	if (binaryRuns()) {
		console.log(`${pkg.name}: binary already installed at ${BINARY_PATH}`);
		return;
	}

	try {
		await downloadPrebuilt();
		if (binaryRuns()) {
			console.log(`${pkg.name}: prebuilt installed at ${BINARY_PATH}`);
			return;
		}

		throw new Error('downloaded binary does not run on this platform');
	} catch (error) {
		console.warn(`${pkg.name}: prebuild download failed: ${error.message}`);
		try {
			await buildFromSource();
			if (binaryRuns()) {
				console.log(`${pkg.name}: source build successful at ${BINARY_PATH}`);
				return;
			}

			throw new Error('source build produced a binary that does not run');
		} catch (error2) {
			console.error(`${pkg.name}: source build also failed: ${error2.stack || error2.message}`);
			process.exit(1);
		}
	}
}

main().catch(error => {
	console.error(`${pkg.name}: install failed: ${error.stack || error.message}`);
	process.exit(1);
});
