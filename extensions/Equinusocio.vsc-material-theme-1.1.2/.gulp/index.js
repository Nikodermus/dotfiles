"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// export the tasks
__export(require("./tasks/changelog"));
__export(require("./tasks/bump"));
__export(require("./tasks/icons"));
__export(require("./tasks/icons-accents"));
__export(require("./tasks/icons-variants"));
__export(require("./tasks/themes"));
__export(require("./tasks/watcher"));
// export default script
exports.default = ['build:themes'];
//# sourceMappingURL=index.js.map