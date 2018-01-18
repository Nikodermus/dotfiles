"use strict";
var vscode_1 = require('vscode');
var UserSettings_1 = require('./UserSettings');
var all_1 = require('../const/all');
var assert = require('assert');
var State;
(function (State) {
    State[State["Idle"] = 0] = "Idle";
    State[State["Begin"] = 1] = "Begin";
    State[State["Busy"] = 2] = "Busy";
})(State || (State = {}));
var OutputWriter = (function () {
    function OutputWriter() {
    }
    OutputWriter.createOutputChannel = function () {
        return vscode_1.window.createOutputChannel(all_1.CHANNEL_NAME);
    };
    /**
     * Begin the writing process. Must be called before calling
     * writeTodo(...)
     */
    OutputWriter.begin = function () {
        assert(OutputWriter.state === State.Idle, "Previous work is not finished.");
        OutputWriter.lineIndex = 1;
        OutputWriter.showPanel();
        OutputWriter.state = State.Begin;
    };
    /**
     * Finalize the writing process. Must be called after writeTodo(...)
     * @param todoCount Number of TODOs. Will be used to display the
     * conclusion.
     */
    OutputWriter.finish = function (todoCount) {
        assert(OutputWriter.state === State.Busy, "There is no work to finish.");
        var showInProblems = UserSettings_1.UserSettings.getInstance().ShowInProblems.getValue();
        var channel = OutputWriter.outputChannel;
        if (!showInProblems) {
            if (todoCount == 0)
                channel.appendLine('No TODOs found.');
            else {
                channel.appendLine('==================================');
                var unit = (todoCount > 1) ? 'TODOs' : 'TODO';
                channel.appendLine("Found " + todoCount + " " + unit + ".\n");
            }
        }
        OutputWriter.state = State.Idle;
        // TODO: We should show the Problems panel here, if the 'showInProblems' setting is set to true,
        // but VS Code Extension API currently doesn't allow us to do that. However, this feature is
        // coming in one of the upcoming updates. 
        // See issue for details: https://github.com/Microsoft/vscode/issues/11399.
    };
    /**
     * Display parsed todos in a pannel. finish() must be called
     * when writing is done.
     * @param todos List of todos to be written to the panel.
     */
    OutputWriter.writeTodo = function (todos) {
        assert(OutputWriter.state === State.Begin || OutputWriter.state === State.Busy, "begin() is not called.");
        OutputWriter.state = State.Busy;
        if (!todos || todos.length == 0)
            return;
        var channel = OutputWriter.outputChannel;
        var showInProblems = UserSettings_1.UserSettings.getInstance().ShowInProblems.getValue();
        var diagnostics = showInProblems ? vscode_1.languages.createDiagnosticCollection("TODOs") : null;
        for (var _i = 0, todos_1 = todos; _i < todos_1.length; _i++) {
            var todo = todos_1[_i];
            if (showInProblems) {
                try {
                    var fileUri = todo.getFile().getFile().uri;
                    var prevDiagnostics = diagnostics.get(fileUri) || [];
                    // The array returned by `diagnostics.get` is read-only, so we make a shallow copy
                    var diags = [].concat(prevDiagnostics);
                    diags.push(new vscode_1.Diagnostic(new vscode_1.Range(todo.getLineNumber() - 1, 0, todo.getLineNumber() - 1, Number.MAX_VALUE), todo.getContent(), todo.getSeverity()));
                    diagnostics.set(fileUri, diags);
                }
                catch (err) {
                    channel.appendLine('Error writing todos: ' + err);
                    OutputWriter.lineIndex++;
                }
            }
            else {
                channel.appendLine(OutputWriter.lineIndex + ".");
                channel.appendLine(todo.getDisplayString());
                channel.appendLine('');
                OutputWriter.lineIndex++;
            }
        }
    };
    OutputWriter.showPanel = function () {
        var showInProblems = UserSettings_1.UserSettings.getInstance().ShowInProblems.getValue();
        var channel = OutputWriter.outputChannel;
        if (!showInProblems && OutputWriter.state === State.Idle) {
            channel.clear();
            channel.show(true);
        }
    };
    OutputWriter.outputChannel = OutputWriter.createOutputChannel();
    OutputWriter.state = State.Idle;
    return OutputWriter;
}());
exports.OutputWriter = OutputWriter;
//# sourceMappingURL=OutputWriter.js.map