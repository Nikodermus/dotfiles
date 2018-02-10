"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const bracketPair_1 = require("./bracketPair");
const colorMode_1 = require("./colorMode");
const scopeCharacter_1 = require("./scopeCharacter");
const scopePattern_1 = require("./scopePattern");
class Settings {
    constructor(settings) {
        this.bracketPairs = [];
        this.scopes = [];
        this.isDisposed = false;
        const backslash = "\\";
        const hash = new scopeCharacter_1.default("#");
        const hashComment = new scopePattern_1.default(hash);
        const doubleQuote = new scopeCharacter_1.default("\"", { escapeCharacter: backslash });
        const doubleQuoteBlock = new scopePattern_1.default(doubleQuote, doubleQuote);
        const singleQuote = new scopeCharacter_1.default("'", { escapeCharacter: backslash });
        const singleQuoteBlock = new scopePattern_1.default(singleQuote, singleQuote);
        const oneWidthchar = new scopeCharacter_1.default("'", {
            escapeCharacter: backslash,
            mustMatchAtOffset: [{ offset: 2, character: singleQuote }],
        });
        const charBlock = new scopePattern_1.default(oneWidthchar, singleQuote);
        const backtick = new scopeCharacter_1.default("`");
        const backtickQuoteBlock = new scopePattern_1.default(backtick, backtick);
        const doubleForwardslash = new scopeCharacter_1.default("//");
        const doubleForwardslashComment = new scopePattern_1.default(doubleForwardslash);
        const slashCommentOpen = new scopeCharacter_1.default("/*");
        const slashCommentClose = new scopeCharacter_1.default("*/");
        const slashCommentBlock = new scopePattern_1.default(slashCommentOpen, slashCommentClose);
        const roundBracketCommentOpen = new scopeCharacter_1.default("(*");
        const roundBracketCommentClose = new scopeCharacter_1.default("*)");
        const roundBracketCommentBlock = new scopePattern_1.default(roundBracketCommentOpen, roundBracketCommentClose);
        const tripleDoubleQuote = new scopeCharacter_1.default("\"\"\"");
        const tripleDoubleQuoteBlock = new scopePattern_1.default(tripleDoubleQuote, tripleDoubleQuote);
        // const verbatimQuote = new ScopeCharacter("@\"");
        // const verbatimEndQuote = new ScopeCharacter("\"",
        //     { mustNotMatchAtOffset: [{ offset: -1, character: notEscapedDoubleQuote }] });
        // const verbatimQuoteBlock = new ScopePattern(verbatimQuote, verbatimEndQuote);
        // VSCode does not follow html comment spec
        // The following invalid examples still are highlighted as comments
        // So we will also follow this pattern and not parse these cases
        // <!--> invalid -->
        // <!---> invalid -->
        // <!-- inva--lid -->
        const hypen = new scopeCharacter_1.default("-");
        const doubleHyphen = new scopeCharacter_1.default("--");
        const doubleHyphenComment = new scopePattern_1.default(doubleHyphen);
        const htmlCommentOpen = new scopeCharacter_1.default("<!--");
        const htmlCommentClose = new scopeCharacter_1.default("-->", { mustMatchAtOffset: [{ offset: -1, character: hypen }] });
        const htmlCommentBlock = new scopePattern_1.default(htmlCommentOpen, htmlCommentClose);
        const rubyCommentOpen = new scopeCharacter_1.default("=begin");
        const rubyCommentClose = new scopeCharacter_1.default("=end");
        const rubyCommentBlock = new scopePattern_1.default(rubyCommentOpen, rubyCommentClose);
        const powerShellCommentOpen = new scopeCharacter_1.default("<#");
        const powerShellCommentClose = new scopeCharacter_1.default("#>");
        const powerShellCommentBlock = new scopePattern_1.default(powerShellCommentOpen, powerShellCommentClose);
        const powerShellPound = new scopeCharacter_1.default("#", { escapeCharacter: "`" });
        const powerShellSingleLineComment = new scopePattern_1.default(powerShellPound);
        const powerShellDoubleQuote = new scopeCharacter_1.default("\"", { escapeCharacter: "`" });
        const powerShellDoubleQuoteBlock = new scopePattern_1.default(powerShellDoubleQuote, powerShellDoubleQuote);
        const powerShellSingleQuote = new scopeCharacter_1.default("'", { escapeCharacter: "`" });
        const powerShellSingleQuoteEnd = new scopeCharacter_1.default("'");
        const powerShellSingleQuoteBlock = new scopePattern_1.default(powerShellSingleQuote, powerShellSingleQuoteEnd);
        const semicolen = new scopeCharacter_1.default(";");
        const clojureComment = new scopePattern_1.default(semicolen);
        const luaStringScopeOpen = new scopeCharacter_1.default("[[");
        const luaStringScopeClose = new scopeCharacter_1.default("]]");
        const luaStringScopeBlock = new scopePattern_1.default(luaStringScopeOpen, luaStringScopeClose);
        const luaScopeCommentOpen = new scopeCharacter_1.default("--[[");
        const luaScopeCommentClose = new scopeCharacter_1.default("]]");
        const luaScopeCommentBlock = new scopePattern_1.default(luaScopeCommentOpen, luaScopeCommentClose);
        switch (settings.languageID) {
            case "lua":
                {
                    this.scopes.push(luaStringScopeBlock);
                    this.scopes.push(doubleHyphenComment);
                    this.scopes.push(luaScopeCommentBlock);
                    this.scopes.push(doubleQuoteBlock);
                    this.scopes.push(singleQuoteBlock);
                    break;
                }
            case "powershell":
                {
                    this.scopes.push(powerShellCommentBlock);
                    this.scopes.push(powerShellSingleLineComment);
                    this.scopes.push(powerShellDoubleQuoteBlock);
                    this.scopes.push(powerShellSingleQuoteBlock);
                    break;
                }
            case "python": {
                this.scopes.push(hashComment);
                this.scopes.push(doubleQuoteBlock);
                this.scopes.push(singleQuoteBlock);
                break;
            }
            case "typescript":
            case "typescriptreact":
            case "javascript":
            case "javascriptreact":
            case "go":
                {
                    this.scopes.push(doubleForwardslashComment);
                    this.scopes.push(slashCommentBlock);
                    this.scopes.push(backtickQuoteBlock);
                    this.scopes.push(doubleQuoteBlock);
                    this.scopes.push(singleQuoteBlock);
                    break;
                }
            case "c":
            case "cpp":
            case "csharp":
            case "java":
            case "less":
            case "scss":
            case "dart":
                {
                    this.scopes.push(doubleForwardslashComment);
                    this.scopes.push(slashCommentBlock);
                    this.scopes.push(doubleQuoteBlock);
                    this.scopes.push(singleQuoteBlock);
                    break;
                }
            case "rust":
                {
                    this.scopes.push(doubleForwardslashComment);
                    this.scopes.push(slashCommentBlock);
                    this.scopes.push(doubleQuoteBlock);
                    this.scopes.push(charBlock);
                    break;
                }
            case "swift":
            case "json": {
                this.scopes.push(doubleForwardslashComment);
                this.scopes.push(slashCommentBlock);
                this.scopes.push(doubleQuoteBlock);
                break;
            }
            case "php": {
                this.scopes.push(doubleForwardslashComment);
                this.scopes.push(hashComment);
                this.scopes.push(slashCommentBlock);
                this.scopes.push(doubleQuoteBlock);
                this.scopes.push(singleQuoteBlock);
                break;
            }
            case "ruby":
            case "crystal": {
                this.scopes.push(hashComment);
                this.scopes.push(rubyCommentBlock);
                this.scopes.push(doubleQuoteBlock);
                this.scopes.push(singleQuoteBlock);
                break;
            }
            case "r": {
                this.scopes.push(hashComment);
                this.scopes.push(doubleQuoteBlock);
                this.scopes.push(singleQuoteBlock);
                break;
            }
            case "html": {
                this.scopes.push(htmlCommentBlock);
                this.scopes.push(doubleQuoteBlock);
                this.scopes.push(singleQuoteBlock);
                break;
            }
            case "css": {
                this.scopes.push(slashCommentBlock);
                this.scopes.push(doubleQuoteBlock);
                this.scopes.push(singleQuoteBlock);
                break;
            }
            case "fsharp": {
                this.scopes.push(tripleDoubleQuoteBlock);
                this.scopes.push(doubleQuoteBlock);
                this.scopes.push(singleQuoteBlock);
                this.scopes.push(roundBracketCommentBlock);
                this.scopes.push(doubleForwardslashComment);
                // this.scopes.push(verbatimQuoteBlock);
                break;
            }
            case "clojure": {
                this.scopes.push(clojureComment);
                this.scopes.push(doubleQuoteBlock);
                break;
            }
            case "sql": {
                this.scopes.push(doubleHyphenComment);
                this.scopes.push(slashCommentBlock);
                this.scopes.push(singleQuoteBlock);
                break;
            }
            // tslint:disable-next-line:no-empty
            default: { }
        }
        // Longest openers get checked first
        this.scopes.sort((a, b) => b.opener.match.length - a.opener.match.length);
        const configuration = vscode.workspace.getConfiguration(undefined, settings.documentUri);
        this.forceUniqueOpeningColor = settings.forceUniqueOpeningColor !== undefined ?
            settings.forceUniqueOpeningColor :
            configuration.get("bracketPairColorizer.forceUniqueOpeningColor");
        if (typeof this.forceUniqueOpeningColor !== "boolean") {
            throw new Error("forceUniqueOpeningColor is not a boolean");
        }
        this.forceIterationColorCycle = settings.forceIterationColorCycle !== undefined ?
            settings.forceIterationColorCycle :
            configuration.get("bracketPairColorizer.forceIterationColorCycle");
        if (typeof this.forceIterationColorCycle !== "boolean") {
            throw new Error("forceIterationColorCycle is not a boolean");
        }
        if (this.scopes.length !== 0) {
            this.contextualParsing = settings.contextualParsing !== undefined ?
                settings.contextualParsing : configuration.get("bracketPairColorizer.contextualParsing");
        }
        else {
            this.contextualParsing = false;
        }
        if (typeof this.contextualParsing !== "boolean") {
            throw new Error("contextualParsing is not a boolean");
        }
        this.colorMode = settings.colorMode !== undefined ?
            settings.colorMode :
            colorMode_1.default[configuration.get("bracketPairColorizer.colorMode")];
        if (typeof this.colorMode !== "number") {
            throw new Error("colorMode enum could not be parsed");
        }
        this.timeOutLength = settings.timeOutLength !== undefined ?
            settings.timeOutLength :
            configuration.get("bracketPairColorizer.timeOut");
        if (typeof this.timeOutLength !== "number") {
            throw new Error("timeOutLength was is a number");
        }
        if (this.colorMode === colorMode_1.default.Consecutive) {
            const consecutiveSettings = (settings.consecutiveSettings !== undefined ?
                settings.consecutiveSettings :
                configuration.get("bracketPairColorizer.consecutivePairColors"));
            if (!Array.isArray(consecutiveSettings)) {
                throw new Error("consecutivePairColors is not an array");
            }
            if (consecutiveSettings.length < 3) {
                throw new Error("consecutivePairColors expected at least 3 parameters, actual: "
                    + consecutiveSettings.length);
            }
            const orphanColor = consecutiveSettings[consecutiveSettings.length - 1];
            if (typeof orphanColor !== "string") {
                throw new Error("consecutivePairColors[" + (consecutiveSettings.length - 1) + "] is not a string");
            }
            const colors = consecutiveSettings[consecutiveSettings.length - 2];
            if (!Array.isArray(colors)) {
                throw new Error("consecutivePairColors[" + (consecutiveSettings.length - 2) + "] is not a string[]");
            }
            consecutiveSettings.slice(0, consecutiveSettings.length - 2).forEach((value, index) => {
                if (typeof value !== "string") {
                    throw new Error("consecutivePairColors[ " + index + "] is not a string");
                }
                const brackets = value;
                if (brackets.length < 2) {
                    throw new Error("consecutivePairColors[" + index + "] needs at least 2 characters");
                }
                this.bracketPairs.push(new bracketPair_1.default(brackets[0], brackets[1], colors, orphanColor));
            });
        }
        else {
            const independentSettings = settings.independentSettings !== undefined ?
                settings.independentSettings :
                configuration.get("bracketPairColorizer.independentPairColors");
            if (!Array.isArray(independentSettings)) {
                throw new Error("independentPairColors is not an array");
            }
            independentSettings.forEach((innerArray, index) => {
                if (!Array.isArray(innerArray)) {
                    throw new Error("independentPairColors[" + index + "] is not an array");
                }
                const brackets = innerArray[0];
                if (typeof brackets !== "string") {
                    throw new Error("independentSettings[" + index + "][0] is not a string");
                }
                if (brackets.length < 2) {
                    throw new Error("independentSettings[" + index + "][0] needs at least 2 characters");
                }
                const colors = innerArray[1];
                if (!Array.isArray(colors)) {
                    throw new Error("independentSettings[" + index + "][1] is not string[]");
                }
                const orphanColor = innerArray[2];
                if (typeof orphanColor !== "string") {
                    throw new Error("independentSettings[" + index + "][2] is not a string");
                }
                this.bracketPairs.push(new bracketPair_1.default(brackets[0], brackets[1], colors, orphanColor));
            });
        }
        this.regexPattern = this.createRegex(this.bracketPairs);
        this.bracketDecorations = this.createBracketDecorations(this.bracketPairs);
        this.scopeDecorations = this.createScopeDecorations(this.bracketPairs);
    }
    dispose() {
        this.scopeDecorations.forEach((decoration, key) => {
            decoration.dispose();
        });
        this.scopeDecorations.clear();
        this.bracketDecorations.forEach((decoration, key) => {
            decoration.dispose();
        });
        this.bracketDecorations.clear();
        this.isDisposed = true;
    }
    // Create a regex to match open and close brackets
    // TODO Test what happens if user specifies other characters then []{}()
    createRegex(bracketPairs) {
        let regex = "[";
        for (const bracketPair of bracketPairs) {
            regex += `\\${bracketPair.openCharacter}\\${bracketPair.closeCharacter}`;
        }
        regex += "]";
        return regex;
    }
    createBracketDecorations(bracketPairs) {
        const decorations = new Map();
        for (const bracketPair of bracketPairs) {
            for (const color of bracketPair.colors) {
                const decoration = vscode.window.createTextEditorDecorationType({
                    color, rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
                });
                decorations.set(color, decoration);
            }
            const errorDecoration = vscode.window.createTextEditorDecorationType({
                color: bracketPair.orphanColor,
                rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
            });
            decorations.set(bracketPair.orphanColor, errorDecoration);
        }
        return decorations;
    }
    createScopeDecorations(bracketPairs) {
        const decorations = new Map();
        for (const bracketPair of bracketPairs) {
            for (const color of bracketPair.colors) {
                const decoration = vscode.window.createTextEditorDecorationType({
                    backgroundColor: color,
                    border: "1px solid " + color + "; opacity: 0.5",
                    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
                });
                decorations.set(color, decoration);
            }
        }
        return decorations;
    }
}
exports.default = Settings;
//# sourceMappingURL=settings.js.map