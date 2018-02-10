"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("./avatar/github");
const gravatar_1 = require("./avatar/gravatar");
const types_1 = require("./avatar/types");
const index_1 = require("./exec/index");
const locator_1 = require("./locator");
function registerTypes(serviceManager) {
    serviceManager.add(locator_1.IGitExecutableLocator, locator_1.GitExecutableLocator);
    serviceManager.add(index_1.IGitCommandExecutor, index_1.GitCommandExecutor);
    serviceManager.add(types_1.IAvatarProvider, github_1.GithubAvatarProvider);
    serviceManager.add(types_1.IAvatarProvider, gravatar_1.GravatarAvatarProvider);
}
exports.registerTypes = registerTypes;
//# sourceMappingURL=serviceRegistry.js.map