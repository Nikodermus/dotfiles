"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vscode_1 = require('vscode');
var all_1 = require('../const/all');
var all_2 = require('../types/all');
/**
 * Keep track of user settings for this extension.
 * This class is Singleton, use getInstance()
 */
var UserSettings = (function () {
    function UserSettings() {
        this.isLoaded = false;
        this.SETTING_ROOT_ENTRY = "TodoParser";
        // File extension exclusion
        this.Exclusions = new SetSettingEntry("exclude", []);
        // File extension inclusion
        this.Inclusions = new SetSettingEntry("include", []);
        this.FolderExclusions = new SetSettingEntry("folderExclude", []);
        this.Only = new SetSettingEntry("only", []);
        // TODO beginning signal
        this.Markers = new MarkersSettingEntry("markers", []);
        // Whether default markers (e.g. todo, TODO) are added automatically
        this.AutoAddDefaultMarkers = new ToggleSettingEntry("autoDefaultMarkers", true);
        // Show in problems panel?
        this.ShowInProblems = new ToggleSettingEntry("showInProblems", false);
        // Turn on/off dev mode
        this.DevMode = new ToggleSettingEntry("devMode", false);
        if (!UserSettings.instance) {
            UserSettings.instance = this;
            // init
            this.reload();
        }
        return UserSettings.instance;
    }
    UserSettings.getInstance = function () {
        return new UserSettings();
    };
    /**
     * Reload all settings (old ones are replaced)
     */
    UserSettings.prototype.reload = function () {
        var settings = vscode_1.workspace.getConfiguration(this.SETTING_ROOT_ENTRY);
        var toLoad = [this.Exclusions, this.Inclusions, this.Markers, this.FolderExclusions, this.Only, this.AutoAddDefaultMarkers, this.ShowInProblems, this.DevMode];
        if (settings) {
            for (var _i = 0, toLoad_1 = toLoad; _i < toLoad_1.length; _i++) {
                var st = toLoad_1[_i];
                st.setValue(settings.get(st.getKey()));
            }
        }
        this.mergeSettings();
        this.isLoaded = true;
    };
    /**
     * Returns true if the folder can be used (i.e. is not
     * excluded by user)
     * @param folder Folder name to check.
     */
    UserSettings.prototype.isFolderEligible = function (folder) {
        if (folder.length == 0)
            return true;
        return !this.FolderExclusions.contains(folder);
    };
    /**
     * Returns true if the file extension can be used (i.e. is not
     * excluded by user)
     * @param ext The file extension (without dot).
     */
    UserSettings.prototype.isFileEligible = function (ext) {
        if (all_1.UnsupportFiles.find(function (x) { return x === ext; }) !== undefined)
            return false;
        if (this.Inclusions.size() > 0)
            return this.Inclusions.contains(ext);
        return !this.Exclusions.contains(ext);
    };
    UserSettings.prototype.getExecutablePaths = function () {
        if (this.Only.size() > 0) {
            var rs = [];
            for (var _i = 0, _a = this.Only.getValue(); _i < _a.length; _i++) {
                var item = _a[_i];
                try {
                    var path = all_2.FileUri.fromString(vscode_1.workspace.rootPath + "/" + item).getPath();
                    rs.push(path);
                }
                catch (error) {
                }
            }
            return rs;
        }
        return undefined; // all paths can be used
    };
    /**
     * Merge values of settings that overlap.
     */
    UserSettings.prototype.mergeSettings = function () {
        /**
         * If both file inclusion and exclusion are specified
         * in user settings, inclusion is prefered.
         */
        if (this.Inclusions.size() > 0) {
            this.Exclusions.setValue([]);
        }
        if (this.AutoAddDefaultMarkers.getValue()) {
            this.Markers.setValue(this.Markers.getValue().concat(['TODO']));
        }
    };
    return UserSettings;
}());
exports.UserSettings = UserSettings;
var SettingEntry = (function () {
    function SettingEntry(key, defaultValue) {
        this.key = key;
        this.value = defaultValue;
        this.defaultValue = defaultValue;
    }
    SettingEntry.prototype.getKey = function () {
        return this.key;
    };
    SettingEntry.prototype.getValue = function () {
        return this.value;
    };
    SettingEntry.prototype.setValue = function (value) {
        this.value = this.defaultValue;
        if (value != null && value != null) {
            this.value = value;
            return true;
        }
        return false;
    };
    return SettingEntry;
}());
var SetSettingEntry = (function (_super) {
    __extends(SetSettingEntry, _super);
    function SetSettingEntry() {
        _super.apply(this, arguments);
    }
    /**
     * Try to mimic the Set data-structure because TS has no such thing
     */
    SetSettingEntry.prototype.contains = function (obj) {
        return this.getValue().find(function (x) { return x === obj; }) !== undefined;
    };
    SetSettingEntry.prototype.size = function () {
        return this.getValue().length;
    };
    SetSettingEntry.prototype.ensureUnique = function () {
        var value = this.getValue();
        if (value) {
            this.value = value.filter(function (val, i) {
                return value.indexOf(val) == i;
            });
        }
    };
    SetSettingEntry.prototype.setValue = function (value) {
        _super.prototype.setValue.call(this, value);
        this.ensureUnique();
        return true;
    };
    return SetSettingEntry;
}(SettingEntry));
exports.SetSettingEntry = SetSettingEntry;
var MarkersSettingEntry = (function (_super) {
    __extends(MarkersSettingEntry, _super);
    function MarkersSettingEntry() {
        _super.apply(this, arguments);
        this.DEFAULT_SEVERITY = vscode_1.DiagnosticSeverity.Hint;
        this.priorities = {};
    }
    MarkersSettingEntry.prototype.setValue = function (value) {
        this.priorities = {};
        // If value is undefined or null, make our lives easier and set it to an empty array
        if (!value) {
            value = [];
        }
        // Go through each settings item to build a dictionary of (marker, priority) pairs.
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var item = value_1[_i];
            if (item instanceof Array) {
                this.priorities[item[0]] = this.parsePriority(item[1]);
            }
            else if (!this.priorities[item]) {
                this.priorities[item] = this.DEFAULT_SEVERITY;
            }
        }
        if (_super.prototype.setValue.call(this, value)) {
            this.value = this.defaultValue.concat(this.value);
            // TODO: `ensureUnique` should maybe be overriden. 
            // "['TODO', 'Warning']" and "TODO" entries are considered distinct members, 
            // but they both refer to the same marker.
            this.ensureUnique();
            return true;
        }
        return false;
    };
    MarkersSettingEntry.prototype.getMarkers = function () {
        return Object.keys(this.priorities);
    };
    MarkersSettingEntry.prototype.getPriorityOf = function (marker) {
        return this.priorities[marker];
    };
    MarkersSettingEntry.prototype.parsePriority = function (priority) {
        if (typeof (priority) === "number") {
            // Clamp the priority to DiagnosticSeverity range (0-3)
            return Math.min(Math.max(priority, vscode_1.DiagnosticSeverity.Error), vscode_1.DiagnosticSeverity.Hint);
        }
        else {
            var value = vscode_1.DiagnosticSeverity[priority];
            return value ? value : this.DEFAULT_SEVERITY;
        }
    };
    return MarkersSettingEntry;
}(SetSettingEntry));
exports.MarkersSettingEntry = MarkersSettingEntry;
var ToggleSettingEntry = (function (_super) {
    __extends(ToggleSettingEntry, _super);
    function ToggleSettingEntry() {
        _super.apply(this, arguments);
    }
    return ToggleSettingEntry;
}(SettingEntry));
exports.ToggleSettingEntry = ToggleSettingEntry;
//# sourceMappingURL=UserSettings.js.map