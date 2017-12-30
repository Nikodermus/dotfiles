"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const sinon = require("sinon");
const fs_1 = require("../fs");
const memfs_1 = require("../memfs");
const packages_1 = require("../packages");
const fs_helpers_1 = require("./fs-helpers");
describe('packages.ts', () => {
    describe('extractDefinitelyTypedPackageName()', () => {
        it('should return the @types package name for a file in DefinitelyTyped', () => {
            const packageName = packages_1.extractDefinitelyTypedPackageName('file:///types/node/index.d.ts');
            assert.equal(packageName, '@types/node');
        });
        it('should return undefined otherwise', () => {
            const packageName = packages_1.extractDefinitelyTypedPackageName('file:///package.json');
            assert.strictEqual(packageName, undefined);
        });
    });
    describe('extractNodeModulesPackageName()', () => {
        it('should return the package name for a file in node_modules', () => {
            const packageName = packages_1.extractNodeModulesPackageName('file:///foo/node_modules/bar/baz/test.ts');
            assert.equal(packageName, 'bar');
        });
        it('should return the package name for a file in a scoped package in node_modules', () => {
            const packageName = packages_1.extractNodeModulesPackageName('file:///foo/node_modules/@types/bar/baz/test.ts');
            assert.equal(packageName, '@types/bar');
        });
        it('should return the package name for a file in nested node_modules', () => {
            const packageName = packages_1.extractNodeModulesPackageName('file:///foo/node_modules/bar/node_modules/baz/test.ts');
            assert.equal(packageName, 'baz');
        });
        it('should return undefined otherwise', () => {
            const packageName = packages_1.extractNodeModulesPackageName('file:///foo/bar');
            assert.strictEqual(packageName, undefined);
        });
    });
    describe('PackageManager', () => {
        it('should register new packages as they are added to InMemoryFileSystem', () => {
            const memfs = new memfs_1.InMemoryFileSystem('/');
            const localfs = new fs_helpers_1.MapFileSystem(new Map());
            const updater = new fs_1.FileSystemUpdater(localfs, memfs);
            const packageManager = new packages_1.PackageManager(updater, memfs);
            const listener = sinon.spy();
            packageManager.on('parsed', listener);
            memfs.add('file:///foo/package.json', '{}');
            sinon.assert.calledOnce(listener);
            sinon.assert.alwaysCalledWith(listener, 'file:///foo/package.json', {});
            const packages = Array.from(packageManager.packageJsonUris());
            assert.deepEqual(packages, ['file:///foo/package.json']);
        });
    });
});
//# sourceMappingURL=packages.test.js.map