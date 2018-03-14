"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_service_1 = require("../typescript-service");
const typescript_service_helpers_1 = require("./typescript-service-helpers");
describe('TypeScriptService', () => {
    for (const rootUri of ['file:///', 'file:///c:/foo/bar/', 'file:///foo/bar/']) {
        describe(`rootUri ${rootUri}`, () => {
            typescript_service_helpers_1.describeTypeScriptService((client, options) => new typescript_service_1.TypeScriptService(client, options), undefined, rootUri);
        });
    }
});
//# sourceMappingURL=typescript-service.test.js.map