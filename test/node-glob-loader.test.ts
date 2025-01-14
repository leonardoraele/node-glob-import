import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

test('Import multiple files using glob import', async () => {
	// @ts-ignore
	const { default: modules } = await import('./**/*.ts', { with: { type: 'glob' } });

	assert('res/test-data.ts' in modules);
	assert(typeof modules['res/test-data.ts'] === 'function');

	const importPromise = modules['res/test-data.ts']();

	assert(importPromise instanceof Promise);

	const imported: unknown = await importPromise;

	assert(typeof imported === 'object' && imported !== null && 'default' in imported);
	assert(typeof imported.default === 'object' && imported.default !== null && 'hello' in imported.default);
	assert(imported.default.hello === 'world');
});

test('Import file list using glob import (relative)', async () => {
	// @ts-ignore
	const { default: tsFiles } = await import('./**/*.ts', { with: { type: 'glob', import: 'filepath' } });

	const thisFileName = path.parse(fileURLToPath(import.meta.url)).base;

	assert(Array.isArray(tsFiles));
	assert(tsFiles.includes(thisFileName));
	assert(tsFiles.includes('res/test-data.ts'));
});

test('Import file list using glob import (absolute)', async () => {
	// @ts-ignore
	const { default: tsFiles } = await import('./**/*.ts', { with: { type: 'glob', import: 'absolute' } });

	const thisDirpath = path.dirname(fileURLToPath(import.meta.url));
	const thisFilepath = path.resolve(fileURLToPath(import.meta.url));

	assert(Array.isArray(tsFiles));
	assert(tsFiles.includes(thisFilepath));
	assert(tsFiles.includes(path.resolve(thisDirpath, 'res/test-data.ts')));
});

test('Import file list using glob import (parsed)', async () => {
	// @ts-ignore
	const { default: tsFiles } = await import('./**/*.ts', { with: { type: 'glob', import: 'parsed' } });

	assert(Array.isArray(tsFiles));
	assert(typeof tsFiles[0] === 'object');
	assert(typeof tsFiles[0]['root'] === 'string');
	assert(typeof tsFiles[0]['dir'] === 'string');
	assert(typeof tsFiles[0]['base'] === 'string');
	assert(typeof tsFiles[0]['ext'] === 'string');
	assert(typeof tsFiles[0]['name'] === 'string');
});
