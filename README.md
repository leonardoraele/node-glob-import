Import a list of files with a single `import` statement, using glob patterns.

### Usage

First, you must enable the loader, which you can do by adding the `--import=node-glob-import` flag to node.

```bash
node --import=node-glob-import myscript.js
```

Then, you can make glob imports by adding the `type: 'glob'` attribute to the import:

```js
// myscript.js
import somemodules from './somemodules/*.js' with { type: 'glob' };
import assert from 'node:assert';

// The imported value is an object where each key is a file found by the glob pattern...
assert(typeof somemodules === 'object');
assert('example.js' in somemodules);

// And the value for each key is a function that dynamically loads that file using `import()`.
const { default: example } = await somemodules['example']();
assert(example.foo === 'bar');
```
```js
// somemodules/example.js
export default {
	foo: 'bar',
};
```
