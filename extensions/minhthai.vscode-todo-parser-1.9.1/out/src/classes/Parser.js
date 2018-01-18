"use strict";
var all_1 = require('../types/all');
var UserSettings_1 = require('./UserSettings');
var all_2 = require('../utils/all');
var Parser = (function () {
    function Parser() {
    }
    Parser.parse = function (files) {
        var todos = [];
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            todos = todos.concat(this.parseSingleFile(file));
        }
        return todos;
    };
    Parser.parseSingleFile = function (file) {
        var todos = [];
        var regex = file.getLanguage().getRegex();
        var blocks = [[file.getFile().getText(), 0, ""]]; // an item = [text, line number, marker]
        if (!blocks[0])
            return todos;
        for (var _i = 0, _a = regex.getSteps(); _i < _a.length; _i++) {
            var reg = _a[_i];
            var matched = [];
            for (var _b = 0, blocks_1 = blocks; _b < blocks_1.length; _b++) {
                var item = blocks_1[_b];
                matched = matched.concat(this.matchText(item, reg));
            }
            blocks = matched;
        }
        for (var _c = 0, blocks_2 = blocks; _c < blocks_2.length; _c++) {
            var todo = blocks_2[_c];
            var item = new all_1.TodoType(file, todo[0], todo[1], todo[2]);
            todos.push(item);
        }
        return todos;
    };
    /**
     * Match text by a regex string
     * @return An array of tuples. Each tuple is [matched text, line number, marker]
     */
    Parser.matchText = function (block, regex) {
        var text = block[0], line = block[1];
        var matches = [];
        var lineIndex = Parser.computeIndexList(text.split("\n"));
        var match;
        try {
            while (match = regex.exec(text)) {
                var marker = "";
                var matched_text = (match[1]) ? match[1] : match[0];
                _a = this.refine(matched_text), matched_text = _a[0], marker = _a[1];
                if (!matched_text) {
                    continue;
                }
                var lineNumber = Parser.lineNumberFromIndex(lineIndex, match.index);
                matches.push([matched_text, lineNumber, marker]);
            }
        }
        catch (e) {
        }
        finally {
            return matches;
        }
        var _a;
    };
    Parser.computeIndexList = function (lines) {
        var index = [];
        var chars = 0, n = lines.length;
        for (var i = 0; i < n; ++i) {
            index[i] = chars;
            chars += lines[i].length + 1; // +1 for "\n" that is removed by spliting
        }
        return index;
    };
    Parser.lineNumberFromIndex = function (indices, key) {
        var low = 0, hi = indices.length - 1;
        while (low <= hi) {
            var mid = low + (((hi - low) / 2) | 0);
            if (key >= indices[mid])
                low = mid + 1;
            else
                hi = mid - 1;
        }
        return hi + 1;
    };
    /**
     * A comment may contain non-todo lines. Remove those lines.
     *
     * @returns {[string, string]} A tuple containing [todo text, marker].
     */
    Parser.refine = function (str) {
        str = this.cleanString(str);
        var markers = UserSettings_1.UserSettings.getInstance().Markers.getMarkers();
        var marker = "";
        var lines = str.split('\n');
        var todoLines = [];
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var ln = lines_1[_i];
            ln = ln.trim();
            if (marker && !ln) {
                break;
            }
            if (!marker) {
                _a = all_2.startsWithOne(ln, markers), marker = _a[1];
            }
            if (marker) {
                todoLines.push(ln);
            }
        }
        return [todoLines.join("\n"), marker];
        var _a;
    };
    /**
     * Regex is not powerful enough to strip all unwanted
     * characters from the multiline comment in the first place,
     * so we have to do some post processing.
     */
    Parser.cleanString = function (str) {
        var no_space = str.trim();
        var no_leading_slash = no_space.replace(/^\/+/, '');
        var no_leading_asterisk = no_leading_slash.replace(/^\*+/g, '');
        no_leading_asterisk = no_leading_asterisk.replace(/^\/+/, ''); // remove slash again!
        str = no_leading_asterisk.trim();
        return str;
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map