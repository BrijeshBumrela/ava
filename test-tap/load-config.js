'use strict';
const path = require('path');
const tap = require('tap');
const {loadConfigSync} = require('../lib/load-config');

const {test} = tap;

tap.afterEach(done => {
	process.chdir(path.resolve(__dirname, '..'));
	done();
});

const changeDir = fixtureDir => {
	process.chdir(path.resolve(__dirname, 'fixture', 'load-config', fixtureDir));
};

test('finds config in package.json', t => {
	changeDir('package-only');
	const conf = loadConfigSync();
	t.is(conf.failFast, true);
	t.end();
});

test('loads config from a particular directory', t => {
	changeDir('throws');
	const conf = loadConfigSync({resolveFrom: path.resolve(__dirname, 'fixture', 'load-config', 'package-only')});
	t.is(conf.failFast, true);
	t.end();
});

test('throws an error if both configs are present', t => {
	changeDir('package-yes-file-yes');
	t.throws(loadConfigSync, /Conflicting configuration in ava.config.js and package.json/);
	t.end();
});

test('explicit configFile option overrides package.json config', t => {
	changeDir('package-yes-explicit-yes');
	const {files} = loadConfigSync({configFile: 'explicit.js'});
	t.is(files, 'package-yes-explicit-yes-test-value');
	t.end();
});

test('throws if configFile option is not in the same directory as the package.json file', t => {
	changeDir('package-yes-explicit-yes');
	t.throws(() => loadConfigSync({configFile: 'nested/explicit.js'}), /Config files must be located next to the package.json file/);
	t.end();
});

test('throws if configFile option has an unsupported extension', t => {
	changeDir('explicit-bad-extension');
	t.throws(() => loadConfigSync({configFile: 'explicit.txt'}), /Config files must have .js, .cjs or .mjs extensions/);
	t.end();
});

test('merges in defaults passed with initial call', t => {
	changeDir('package-only');
	const defaults = {
		files: ['123', '!456']
	};
	const {files, failFast} = loadConfigSync({defaults});
	t.is(failFast, true, 'preserves original props');
	t.is(files, defaults.files, 'merges in extra props');
	t.end();
});

test('loads config from file with `export default` syntax', t => {
	changeDir('package-no-file-yes');
	const conf = loadConfigSync();
	t.is(conf.files, 'config-file-esm-test-value');
	t.end();
});

test('loads config from factory function', t => {
	changeDir('package-no-file-yes-factory');
	const conf = loadConfigSync();
	t.ok(conf.files.startsWith(__dirname));
	t.end();
});

test('does not support require() inside config.js files', t => {
	changeDir('require');
	t.throws(loadConfigSync, /Error loading ava\.config\.js: require is not defined/);
	t.end();
});

test('throws an error if a config factory returns a promise', t => {
	changeDir('factory-no-promise-return');
	t.throws(loadConfigSync, /Factory method exported by ava.config.js must not return a promise/);
	t.end();
});

test('throws an error if a config exports a promise', t => {
	changeDir('no-promise-config');
	t.throws(loadConfigSync, /ava.config.js must not export a promise/);
	t.end();
});

test('throws an error if a config factory does not return a plain object', t => {
	changeDir('factory-no-plain-return');
	t.throws(loadConfigSync, /Factory method exported by ava.config.js must return a plain object/);
	t.end();
});

test('throws an error if a config does not export a plain object', t => {
	changeDir('no-plain-config');
	t.throws(loadConfigSync, /ava.config.js must export a plain object or factory function/);
	t.end();
});

test('receives a `projectDir` property', t => {
	changeDir('package-only');
	const conf = loadConfigSync();
	t.ok(conf.projectDir.startsWith(__dirname));
	t.end();
});

test('rethrows wrapped module errors', t => {
	t.plan(1);
	changeDir('throws');
	try {
		loadConfigSync();
	} catch (error) {
		t.is(error.parent.message, 'foo');
	}
});

test('throws an error if a .js config file has no default export', t => {
	changeDir('no-default-export');
	t.throws(loadConfigSync, /ava.config.js must have a default export, using ES module syntax/);
	t.end();
});

test('throws an error if a config file contains `ava` property', t => {
	changeDir('contains-ava-property');
	t.throws(loadConfigSync, /Encountered ’ava’ property in ava.config.js; avoid wrapping the configuration/);
	t.end();
});

test('throws an error if a config file contains a non-object `nonSemVerExperiments` property', t => {
	changeDir('non-object-experiments');
	t.throws(loadConfigSync, /nonSemVerExperiments from ava.config.js must be an object/);
	t.end();
});

test('throws an error if a config file enables an unsupported experiment', t => {
	changeDir('unsupported-experiments');
	t.throws(loadConfigSync, /nonSemVerExperiments.unsupported from ava.config.js is not a supported experiment/);
	t.end();
});

test('loads .cjs config', t => {
	changeDir('cjs');
	const conf = loadConfigSync();
	t.ok(conf.files.startsWith(__dirname));
	t.end();
});

test('throws an error if both .js and .cjs configs are present', t => {
	changeDir('file-yes-cjs-yes');
	t.throws(loadConfigSync, /Conflicting configuration in ava.config.js and ava.config.cjs/);
	t.end();
});

test('refuses to load .mjs config', t => {
	changeDir('mjs');
	t.throws(loadConfigSync, /AVA cannot yet load ava.config.mjs files/);
	t.end();
});

test('throws an error if .js, .cjs and .mjs configs are present', t => {
	changeDir('file-yes-cjs-yes');
	t.throws(loadConfigSync, /Conflicting configuration in ava.config.js and ava.config.cjs & ava.config.mjs/);
	t.end();
}, {todo: true});
