"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./exec/index");
const locator_1 = require("./locator");
function registerTypes(serviceManager) {
    serviceManager.add(locator_1.IGitExecutableLocator, locator_1.GitExecutableLocator);
    serviceManager.add(index_1.IGitCommandExecutor, index_1.GitCommandExecutor);
}
exports.registerTypes = registerTypes;
//# sourceMappingURL=serviceRegistry.js.map