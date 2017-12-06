/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sasa Jovanovic. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const vscode_1 = require("vscode");
const sassConvertService_1 = require("./sassConvertService");
/**
 * Sass Formatter Edit Provider
 * @constructor
 * @param {OutputChannel} _outputChannel - output channel
 * @param {SassConvert} _sassConvert - Sass Convert Service
 */
class SassFormatterEditProvider {
    constructor(_outputChannel, _sassConvert) {
        this._outputChannel = _outputChannel;
        this._sassConvert = _sassConvert;
    }
    /** Provide formatting edits for a whole document */
    provideDocumentFormattingEdits(document) {
        return this._getTextEdit(document);
    }
    /** Provide formatting edits for a range in a document */
    provideDocumentRangeFormattingEdits(document, range) {
        return this._getTextEdit(document, range);
    }
    /**
     * Get Text Edit
     * @param {TextDocument} document
     * @param {Range} range - optional
     */
    _getTextEdit(document, range) {
        let result = [];
        let text;
        if (range === undefined) {
            text = document.getText();
            let rangeStart = document.lineAt(0).range.start;
            let rangeEnd = document.lineAt(document.lineCount - 1).range.end;
            range = new vscode_1.Range(rangeStart, rangeEnd);
        }
        else {
            text = document.getText(range);
        }
        let extName = path_1.extname(document.uri.fsPath);
        let newText = this._formatSass(text, extName);
        if (newText) {
            result.push(vscode_1.TextEdit.replace(range, newText));
        }
        return result;
    }
    /**
     * Format Sass
     * @param {string} text
     * @param {string} extName
     */
    _formatSass(text, extName) {
        const optionUseSingleQuotes = vscode_1.workspace.getConfiguration('sassFormat').get("useSingleQuotes");
        const optionInlineComments = vscode_1.workspace.getConfiguration('sassFormat').get("inlineComments");
        let result;
        let sassConvertOptions = this._getSassConvertOptions(extName);
        let sassConvertFormatCommand = `${this._sassConvert.sassConvertCommand} ${sassConvertOptions}`;
        try {
            if (optionInlineComments) {
                // Inline CSS comment regex
                const inlineCSSCommentRegex = /([;{}]+[ \t]*)(\/\/|\/\*)(.*)$/gm;
                // Mark inline CSS comments, so we can move them back after sass-convert
                text = text.replace(inlineCSSCommentRegex, "$1$2---vscode-sass-format-end-of-inline-comment---$3");
            }
            result = child_process_1.execSync(sassConvertFormatCommand, { encoding: 'utf8', input: text });
            if (optionInlineComments) {
                // Marked inline CSS comment regex
                const markedInlineCSSCommentRegex = /(\s+)(\/\/|\/\*)(---vscode-sass-format-end-of-inline-comment---)(.*)/gm;
                // Restore inline CSS comments
                result = result.replace(markedInlineCSSCommentRegex, " $2$4");
                // Cleanup unmatched comments
                // Example // appeared inside of block comment
                result = result.replace('//---vscode-sass-format-end-of-inline-comment---', '//');
                result = result.replace('/*---vscode-sass-format-end-of-inline-comment---', '/*');
            }
            if (optionUseSingleQuotes) {
                // Default CSS comment regex
                // https://developer.mozilla.org/en-US/docs/Web/CSS/Comments
                // const defaultCSSCommentRegex = /\/\*[^\/\*]+\*\//g; // Log for testing
                const defaultCSSCommentRegex = /\/\*(\*(?!\/)|[^*])*\*\//g;
                // Sass single line comment regex
                // http://sass-lang.com/documentation/file.SCSS_FOR_SASS_USERS.html#Comments
                const sassSingleLineCommentRegex = /\/\/.+/g;
                // const sassSingleLineCommentRegex = /^\/\/.+/gm; // always match from the beginning (Log for testing)
                const doubleQuotePlaceholder = 'VSCODE_SASS_FORMAT_DOUBLE_QUOTE_PLACEHOLDER';
                // Replace double quotes with placeholder in all default CSS/Sass comments
                result = result.replace(defaultCSSCommentRegex, (match) => {
                    return match.replace(/"/g, doubleQuotePlaceholder);
                });
                // Replace double quotes with placeholder in all Sass single line comments (Experimental Support)
                result = result.replace(sassSingleLineCommentRegex, (match) => {
                    return match.replace(/"/g, doubleQuotePlaceholder);
                });
                // Replace all double quotes with single quotes
                result = result.replace(/"/g, '\'');
                // Revert all double quotes from comments
                result = result.replace(new RegExp(doubleQuotePlaceholder, 'g'), '"');
            }
        }
        catch (error) {
            vscode_1.window.showErrorMessage(sassConvertService_1.sassConvertErrorMessage);
            this._outputChannel.append(this._sassConvert.formatError(error));
            this._outputChannel.show();
            console.error(`${this._sassConvert.sassConvertCommand}:`, error.toString('utf8').trim());
            result = null;
        }
        return result;
    }
    /**
     * Get Sass Convert Options
     * @param {string} text
     */
    _getSassConvertOptions(extName) {
        const optionDasherize = vscode_1.workspace.getConfiguration('sassFormat').get("dasherize");
        const optionIndent = vscode_1.workspace.getConfiguration('sassFormat').get("indent");
        // const optionOldStyle = workspace.getConfiguration('sassFormat').get<boolean>("oldStyle"); // deprecated
        const optionDefaultEncoding = vscode_1.workspace.getConfiguration('sassFormat').get("defaultEncoding");
        const optionUnixNewlines = vscode_1.workspace.getConfiguration('sassFormat').get("unixNewlines");
        let sassConvertOptions = '';
        // Common Options
        if (extName === '.scss') {
            sassConvertOptions += '--from scss --to scss';
        }
        if (extName === '.sass') {
            sassConvertOptions += '--from sass --to sass';
        }
        if (extName === '.css') {
            // sassConvertOptions += '--from css --to scss';
            sassConvertOptions += '--from scss --to scss';
        }
        // Style
        if (optionDasherize) {
            sassConvertOptions += ' --dasherize';
        }
        sassConvertOptions += ` --indent ${optionIndent}`;
        // deprecated
        // if (optionOldStyle) {
        // 	sassConvertOptions += ' --old';
        // }
        // Input and Output
        sassConvertOptions += ' --stdin';
        sassConvertOptions += ` --default-encoding ${optionDefaultEncoding}`;
        if (optionUnixNewlines) {
            // sassConvertOptions += ' --unix-newlines';
            vscode_1.window.showInformationMessage('sassFormat.unixNewlines setting is deprecated. Please use "End of Line" setting from VS Code.');
        }
        // Miscellaneous
        sassConvertOptions += ' --no-cache --quiet';
        return sassConvertOptions;
    }
}
exports.SassFormatterEditProvider = SassFormatterEditProvider;
//# sourceMappingURL=sassFormatterEditProvider.js.map