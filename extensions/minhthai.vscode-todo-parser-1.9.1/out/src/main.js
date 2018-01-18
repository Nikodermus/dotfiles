"use strict";
var all_1 = require('./classes/all');
var Main = (function () {
    function Main(context) {
        this.context = context;
        this.init();
    }
    Main.prototype.init = function () {
        all_1.CommandListener.listen(this.context, this.process);
    };
    Main.prototype.process = function (command) {
        var resultPrm = all_1.CommandHandler.handle(command);
        resultPrm.then(function (result) {
            if (all_1.UserSettings.getInstance().DevMode.getValue())
                all_1.Logger.log(result + ' todos.');
        }, function (reason) {
            if (all_1.UserSettings.getInstance().DevMode.getValue())
                all_1.Logger.error(reason);
        });
    };
    /**
     * Is called when the extension is deactivated
     */
    Main.prototype.deactivate = function () { };
    return Main;
}());
exports.Main = Main;
//# sourceMappingURL=main.js.map