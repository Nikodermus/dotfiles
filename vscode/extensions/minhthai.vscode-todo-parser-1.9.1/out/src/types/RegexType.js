"use strict";
var RegexType = (function () {
    function RegexType() {
        var steps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            steps[_i - 0] = arguments[_i];
        }
        this.steps = [];
        for (var _a = 0, steps_1 = steps; _a < steps_1.length; _a++) {
            var str = steps_1[_a];
            this.steps.push(this.createRegExp(str));
        }
    }
    RegexType.prototype.getSteps = function () {
        return this.steps;
    };
    RegexType.prototype.createRegExp = function (str) {
        return new RegExp(str, 'g'); // with global flag
    };
    return RegexType;
}());
exports.RegexType = RegexType;
//# sourceMappingURL=RegexType.js.map