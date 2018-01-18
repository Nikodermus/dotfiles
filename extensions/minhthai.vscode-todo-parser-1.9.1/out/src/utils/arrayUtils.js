"use strict";
/**
 * Return equal parts of an array
 * @template T
 * @param array     An array to be sliced.
 * @param chunkSize Size of each part.
 */
function sliceArray(array, chunkSize) {
    var slices = [];
    if (chunkSize == 0)
        return slices;
    for (var i = 0; i < array.length; i += chunkSize) {
        slices.push(array.slice(i, i + chunkSize));
    }
    return slices;
}
exports.sliceArray = sliceArray;
//# sourceMappingURL=arrayUtils.js.map