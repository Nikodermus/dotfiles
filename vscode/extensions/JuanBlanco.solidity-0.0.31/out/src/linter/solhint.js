"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const linter = require("solhint/lib/index");
const vscode_languageserver_1 = require("vscode-languageserver");
const fs = require("fs");
class SolhintService {
    constructor(rootPath, rules) {
        this.config = new ValidationConfig(rootPath, rules);
    }
    setIdeRules(rules) {
        this.config.setIdeRules(rules);
    }
    validate(filePath, documentText) {
        return linter
            .processStr(documentText, this.config.build())
            .messages
            .map(e => this.toDiagnostic(e));
    }
    toDiagnostic(error) {
        return {
            message: `${error.message} [${error.ruleId}]`,
            range: this.rangeOf(error),
            severity: this.severity(error),
        };
    }
    severity(error) {
        return (error.severity === 3) ? vscode_languageserver_1.DiagnosticSeverity.Warning : vscode_languageserver_1.DiagnosticSeverity.Error;
    }
    rangeOf(error) {
        const line = error.line - 1;
        const character = error.column - 1;
        return {
            start: { line, character },
            // tslint:disable-next-line:object-literal-sort-keys
            end: { line, character: character + 1 },
        };
    }
}
exports.default = SolhintService;
class ValidationConfig {
    constructor(rootPath, ideRules) {
        this.setIdeRules(ideRules);
        this.loadFileConfig(rootPath);
    }
    setIdeRules(rules) {
        this.ideRules = rules || {};
    }
    build() {
        return {
            rules: Object.assign(ValidationConfig.DEFAULT_RULES, this.ideRules, this.fileConfig.rules),
        };
    }
    loadFileConfig(rootPath) {
        const filePath = `${rootPath}/.solhint.json`;
        const readConfig = this.readFileConfig.bind(this, filePath);
        readConfig();
        fs.watchFile(filePath, { persistent: false }, readConfig);
    }
    readFileConfig(filePath) {
        this.fileConfig = ValidationConfig.EMPTY_CONFIG;
        fs.readFile(filePath, 'utf-8', this.onConfigLoaded.bind(this));
    }
    onConfigLoaded(err, data) {
        this.fileConfig = (!err) && JSON.parse(data);
    }
}
ValidationConfig.DEFAULT_RULES = { 'func-visibility': false };
ValidationConfig.EMPTY_CONFIG = { rules: {} };
//# sourceMappingURL=solhint.js.map