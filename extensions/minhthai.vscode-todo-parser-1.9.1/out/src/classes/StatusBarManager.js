"use strict";
var vscode_1 = require('vscode');
var all_1 = require('../const/all');
var StatusState = (function () {
    function StatusState(text, command, tooltip) {
        if (tooltip === void 0) { tooltip = ""; }
        this.text = text;
        this.command = command;
        this.tooltip = tooltip;
    }
    StatusState.prototype.getText = function () {
        return this.text;
    };
    StatusState.prototype.getCommand = function () {
        return this.command;
    };
    StatusState.prototype.getTooltip = function () {
        return this.tooltip;
    };
    StatusState.prototype.setText = function (text) {
        this.text = text;
        return this;
    };
    StatusState.prototype.setTooltip = function (tooltip) {
        this.tooltip = tooltip;
        return this;
    };
    StatusState.prototype.setCommand = function (command) {
        this.command = command;
        return this;
    };
    return StatusState;
}());
var StatusBarManager = (function () {
    function StatusBarManager() {
        if (!StatusBarManager.instance) {
            StatusBarManager.instance = this;
            this.init();
        }
        return StatusBarManager.instance;
    }
    StatusBarManager.getInstance = function () {
        return new StatusBarManager();
    };
    StatusBarManager.prototype.init = function () {
        // Create a TODO counter for current file
        this.statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this.defaultState = new StatusState("$(checklist) 0", all_1.PARSE_CURRENT_FILE_COMMAND, "0 TODO");
        this.setState(this.defaultState);
    };
    StatusBarManager.prototype.setState = function (state) {
        this.statusBarItem.text = state.getText();
        this.statusBarItem.tooltip = state.getTooltip();
        this.statusBarItem.command = state.getCommand();
        this.statusBarItem.show();
    };
    StatusBarManager.prototype.setDefault = function (text, tooltip) {
        if (text)
            this.defaultState.setText(text);
        if (tooltip)
            this.defaultState.setTooltip(tooltip);
        this.setState(this.defaultState);
    };
    /**
     * Show a state that represents the system is working
     * on something. setDefault() must be called when finish.
     * @param text          Text to display on the status bar.
     * @param [tooltip=""]  Tooltip shows when hover.
     */
    StatusBarManager.prototype.setWorking = function (text, tooltip) {
        if (tooltip === void 0) { tooltip = ""; }
        if (!this.workingState)
            this.workingState = new StatusState(text, all_1.CANCEL_PARSE_ALL_FILES_COMMAND, tooltip);
        else
            this.workingState.setText(text).setTooltip(tooltip).setCommand(all_1.CANCEL_PARSE_ALL_FILES_COMMAND);
        this.setState(this.workingState);
    };
    return StatusBarManager;
}());
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=StatusBarManager.js.map