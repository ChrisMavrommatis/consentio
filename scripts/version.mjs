// The version has one source - package.json - and this is what proves a release is not
// about to contradict it. A tag whose number disagrees with the bundle it points at is a
// permanent lie, and the CDN serves that tag forever.
//
// The bump itself is the maintainer's, not this script's. It only checks.

import { readFileSync } from 'node:fs';

const [command, argument] = process.argv.slice(2);

if (command !== 'check' || !argument) {
	process.stderr.write('usage: version.mjs check <version>\n');
	process.exit(1);
}

const wanted = argument.replace(/^v/, '');
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

if (version !== wanted) {
	process.stderr.write(`package.json says ${version}, this release says ${wanted}. Bump package.json first.\n`);
	process.exit(1);
}

process.stdout.write(`package.json and this release both say ${version}.\n`);
