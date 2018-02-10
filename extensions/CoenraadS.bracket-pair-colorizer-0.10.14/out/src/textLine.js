"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const lineState_1 = require("./lineState");
const match_1 = require("./match");
class TextLine {
    constructor(content, settings, index, lineState) {
        this.colorRanges = new Map();
        this.resumeLineCheckPosition = 0;
        this.scopeEndPosition = -1;
        this.settings = settings;
        this.content = content;
        this.index = index;
        if (lineState !== undefined) {
            this.lineState = lineState;
        }
        else {
            this.lineState = new lineState_1.default(settings);
        }
    }
    // Return a copy of the line while mantaining bracket state. colorRanges is not mantained.
    copyMultilineContext() {
        // Update state for whole line before returning
        this.updateScopes(this.content.length);
        return this.lineState.copyMultilineContext();
    }
    getScope(position) {
        return this.lineState.getScope(position);
    }
    addBracket(bracket, position) {
        if (this.settings.contextualParsing) {
            if (position <= this.scopeEndPosition) {
                return;
            }
            this.updateScopes(position, bracket);
            // Check again now scope is updated
            if (position <= this.scopeEndPosition) {
                return;
            }
        }
        const bracketOpenPosition = new vscode_1.Position(this.index, position);
        const bracketClosePosition = new vscode_1.Position(this.index, position + bracket.length);
        const range = new vscode_1.Range(bracketOpenPosition, bracketClosePosition);
        for (const bracketPair of this.settings.bracketPairs) {
            if (bracketPair.openCharacter === bracket) {
                const color = this.lineState.getOpenBracketColor(bracketPair, range);
                const colorRanges = this.colorRanges.get(color);
                if (colorRanges !== undefined) {
                    colorRanges.push(range);
                }
                else {
                    this.colorRanges.set(color, [range]);
                }
                return;
            }
            else if (bracketPair.closeCharacter === bracket) {
                const color = this.lineState.getCloseBracketColor(bracketPair, range);
                const colorRanges = this.colorRanges.get(color);
                if (colorRanges !== undefined) {
                    colorRanges.push(range);
                }
                else {
                    this.colorRanges.set(color, [range]);
                }
                return;
            }
        }
    }
    updateScopes(bracketPosition, bracket = "") {
        // We don't want to color brackets inside a scope, so if a scope opener is encoutered, we mark where it ends
        // If it doesn't end in this line, its marked as infinity
        for (let i = this.resumeLineCheckPosition; i <= bracketPosition; i++) {
            let checkPos = i;
            if (!this.lineState.activeScope) {
                this.lineState.activeScope = this.getOpeningScope(i);
                if (this.lineState.activeScope) {
                    checkPos = i + this.lineState.activeScope.opener.match.length;
                }
            }
            const scope = this.lineState.activeScope;
            if (scope) {
                if (scope.closer) {
                    this.scopeEndPosition = this.getClosingScopePosition(checkPos, scope.closer);
                    if (this.scopeEndPosition !== Infinity) {
                        // If closer & Infinity keep scope alive so it gets analyzed next line
                        this.lineState.activeScope = null;
                    }
                }
                else {
                    this.scopeEndPosition = Infinity;
                }
                i = this.scopeEndPosition;
            }
        }
        this.resumeLineCheckPosition = Math.max(bracketPosition + bracket.length - 1, this.scopeEndPosition) + 1;
    }
    getClosingScopePosition(index, character) {
        for (let i = index; i < this.content.length; i++) {
            if (match_1.default.contains(this.content, i, character)) {
                return i + character.match.length - 1;
            }
        }
        return Infinity;
    }
    getOpeningScope(position) {
        for (const scope of this.settings.scopes) {
            if (match_1.default.contains(this.content, position, scope.opener)) {
                return scope;
            }
        }
        return null;
    }
}
exports.default = TextLine;
//# sourceMappingURL=textLine.js.map