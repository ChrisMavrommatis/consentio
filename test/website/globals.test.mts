import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * The site prints its three files on every page as the globals the tag reads at None.
 * The plugin is Ruby, so what can be held from here is that the layout calls it, that it
 * prints the three names the tag declares, and that it escapes the one sequence that ends
 * a script early. The built pages are the rest of the check.
 */

const root = new URL('../../', import.meta.url);
const plugin = readFileSync(new URL('website/_plugins/consentio.rb', root), 'utf8');
const layout = readFileSync(new URL('website/_layouts/base.html', root), 'utf8');
const permissions = readFileSync(new URL('gtm/consentio-tag/src/permissions.json', root), 'utf8');

test('the layout prints the globals in <head>, above the container snippet, on every page', () => {
	const globals = layout.indexOf('{% consentio_globals %}');
	const container = layout.indexOf('{% gtm_head');
	const head = layout.indexOf('</head>');
	assert.ok(globals !== -1, 'the layout does not print the globals');
	assert.ok(globals < container && container < head, 'the globals have to be there before the container reads them');
});

test('the plugin prints the three names the tag declares, from the three files', () => {
	for (const name of ['ConsentioSettings', 'ConsentioLanguage', 'ConsentioCookies']) {
		assert.match(plugin, new RegExp(`window\\.${name}=`), `the plugin does not print ${name}`);
		assert.ok(permissions.includes(`"${name}"`), `the tag does not declare ${name}`);
	}
	assert.match(plugin, /with_tag_attributes: true/, 'the settings global has to carry the version the tag reads');
	assert.ok(plugin.includes(".gsub('</', '<\\/')"), 'a </ inside the JSON would end the script');
});
