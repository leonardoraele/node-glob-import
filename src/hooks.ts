import type { ResolveHook, LoadHook } from 'node:module';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

export const resolve: ResolveHook = async function(specifier, context, next) {
	if (context.importAttributes.type !== 'glob') {
		return next(specifier, context);
	}

	if (!context.parentURL) {
		throw new Error('Failed to resolve glob import. Cause: Glob import cannot be the Node.js entry point');
	}

	const url = new URL(context.parentURL);
	url.searchParams.set('specifier', specifier);
	url.searchParams.set('import', context.importAttributes.import ?? 'default');

	return {
		url: url.toString(),
		shortCircuit: true,
	};
};

export const load: LoadHook = async function(url, context, next) {
	if (context.importAttributes.type !== 'glob') {
		return next(url, context);
	}

	const [globString, queryOpts] = new URL(url).searchParams.get('specifier')!.split('?');
	const globOpts = new URLSearchParams(queryOpts);
	const ignore = globOpts.get('ignore') ?? [];
	const dot = globOpts.has('dot');
	const follow = globOpts.has('follow');
	const maxDepth = Number(globOpts.get('maxDepth')) || Number.POSITIVE_INFINITY;
	const cwd = path.dirname(fileURLToPath(url));

	const filepaths = await glob(globString!, { cwd, ignore, dot, follow, maxDepth, nodir: true })
		.then(filepaths => {
			return filepaths.map(filepath => filepath.replaceAll(path.sep, '/'));
		});

	const { obj, src } = await (async () => {
		switch (context.importAttributes.import) {
			case 'absolute':
				const absolutePaths = filepaths.map(filepath => path.resolve(cwd, filepath));
				return { obj: absolutePaths };
			case 'filepath':
				return { obj: filepaths };
			case 'parsed':
				return { obj: filepaths.map(filepath => path.parse(filepath)) };
			case 'default':
			default:
				const fields = filepaths.map(filepath => {
					return `"${filepath}": () => import("./${filepath}")`;
				});
				return { src: `{${fields.join(',')}}` } ;
		}
		return undefined as never;
	})();

	return {
		format: 'module',
		source: `export default ${src ?? JSON.stringify(obj)};`,
		shortCircuit: true,
	};
};
