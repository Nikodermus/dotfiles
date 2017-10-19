"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fileHistory = require("./commands/fileHistory");
const lineHistory = require("./commands/lineHistory");
const logViewer = require("./logViewer/logViewer");
const commitViewer = require("./commitViewer/main");
const commitComparer = require("./commitCompare/main");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        fileHistory.activate(context);
        lineHistory.activate(context);
        commitViewer.activate(context, logViewer.getGitRepoPath);
        logViewer.activate(context, commitViewer.showLogEntries);
        commitComparer.activate(context, logViewer.getGitRepoPath);
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map