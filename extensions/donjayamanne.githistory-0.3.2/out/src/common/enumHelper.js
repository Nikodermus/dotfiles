"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-stateless-class no-unnecessary-class
class EnumHelpers {
    // tslint:disable-next-line:function-name
    static *Values(enumType) {
        // tslint:disable-next-line:no-for-in
        for (const item in enumType) {
            if (typeof enumType[item] === 'number') {
                // tslint:disable-next-line:prefer-type-cast no-any
                yield enumType[item];
            }
        }
    }
}
exports.EnumHelpers = EnumHelpers;
//# sourceMappingURL=enumHelper.js.map