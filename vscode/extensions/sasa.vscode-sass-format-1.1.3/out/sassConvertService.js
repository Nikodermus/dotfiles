/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sasa Jovanovic. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const vscode_1 = require("vscode");
const sassConvertCommandDefault = "sass-convert";
exports.sassConvertMissingCommandMessage = "Please install the sass command line tools from http://sass-lang.com/install if you want to use Sass Formatter extension.";
exports.sassConvertInvalidSassPathMessage = "The sassPath setting is not valid.";
exports.sassConvertErrorMessage = "There was an error formatting your file. See Output panel for more details.";
/**
 * Sass Convert Service
 * @constructor
 * @param {OutputChannel} _outputChannel - output channel
 */
class SassConvertService {
    constructor(_outputChannel) {
        this._outputChannel = _outputChannel;
        this.sassConvertCommand = "";
        this.setSassConvertCommand();
        this._checkSassConvert();
    }
    /** Check Sass Convert */
    _checkSassConvert() {
        try {
            let sassConvertVersion = child_process_1.execSync(`${this.sassConvertCommand} --version`)
                .toString("utf8")
                .trim();
            this._outputChannel.appendLine(sassConvertVersion);
            console.info(`${this.sassConvertCommand} version:`, sassConvertVersion);
        }
        catch (error) {
            if (this.sassConvertCommand !== sassConvertCommandDefault) {
                vscode_1.window.showWarningMessage(exports.sassConvertInvalidSassPathMessage);
            }
            else {
                vscode_1.window.showWarningMessage(exports.sassConvertMissingCommandMessage);
            }
            this._outputChannel.append(this.formatError(error));
            this._outputChannel.show();
            console.warn(`${this.sassConvertCommand} warn:`, error.toString("utf8").trim());
        }
    }
    /** Set Sass Convert Command */
    setSassConvertCommand() {
        let configurationSassPath = vscode_1.workspace
            .getConfiguration("sassFormat")
            .get("sassPath");
        if (configurationSassPath) {
            if (configurationSassPath.endsWith("/")) {
                configurationSassPath = configurationSassPath.slice(0, -1);
            }
            this.sassConvertCommand =
                configurationSassPath + "/" + sassConvertCommandDefault;
        }
        else {
            this.sassConvertCommand = sassConvertCommandDefault;
        }
    }
    /**
     * Format Error
     * @param {any} error
     */
    formatError(error) {
        let formattedError = error.toString("utf8").trim();
        formattedError = formattedError
            .split("\n")
            .slice(1)
            .join("\n");
        formattedError = formattedError.replace("Use --trace for backtrace.", "");
        formattedError = formattedError.replace("Use --trace for backtrace", "");
        formattedError = formattedError.trim();
        formattedError += "\n";
        return formattedError;
    }
}
exports.SassConvertService = SassConvertService;
//# sourceMappingURL=sassConvertService.js.map