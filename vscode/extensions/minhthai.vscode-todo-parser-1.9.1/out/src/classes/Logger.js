"use strict";
var Logger = (function () {
    function Logger() {
    }
    Logger.log = function () {
        var obj = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            obj[_i - 0] = arguments[_i];
        }
        for (var _a = 0, obj_1 = obj; _a < obj_1.length; _a++) {
            var o = obj_1[_a];
            console.log(Logger.createString(o, Logger.prefix));
        }
    };
    Logger.warn = function () {
        var obj = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            obj[_i - 0] = arguments[_i];
        }
        for (var _a = 0, obj_2 = obj; _a < obj_2.length; _a++) {
            var o = obj_2[_a];
            console.log(Logger.createString(o, Logger.prefix, Logger.warnPrefix));
        }
    };
    Logger.error = function () {
        var obj = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            obj[_i - 0] = arguments[_i];
        }
        for (var _a = 0, obj_3 = obj; _a < obj_3.length; _a++) {
            var o = obj_3[_a];
            console.log(Logger.createString(o, Logger.prefix, Logger.errorPrefix));
        }
    };
    Logger.createString = function (obj) {
        var prefixes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            prefixes[_i - 1] = arguments[_i];
        }
        var prefix = "";
        for (var _a = 0, prefixes_1 = prefixes; _a < prefixes_1.length; _a++) {
            var p = prefixes_1[_a];
            prefix += p;
        }
        return prefix + " " + obj;
    };
    Logger.prefix = "[todo-parser]";
    Logger.warnPrefix = "[warning]";
    Logger.errorPrefix = "[error]";
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map