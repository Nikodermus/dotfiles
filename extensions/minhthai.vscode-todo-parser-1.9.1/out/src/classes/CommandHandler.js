"use strict";
var CommandHandler = (function () {
    function CommandHandler() {
    }
    CommandHandler.handle = function (command) {
        return command.execute();
    };
    CommandHandler.handleWithParam = function (command, param) {
        return command.execute(param);
    };
    return CommandHandler;
}());
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map