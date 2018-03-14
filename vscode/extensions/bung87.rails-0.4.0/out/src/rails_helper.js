'use strict';
const vscode = require("vscode");
const path_1 = require("path");
var inflection = require('inflection');
var FileType;
(function (FileType) {
    FileType[FileType["Controller"] = 1] = "Controller";
    FileType[FileType["Model"] = 2] = "Model";
    FileType[FileType["Layout"] = 3] = "Layout";
    FileType[FileType["View"] = 4] = "View";
    FileType[FileType["Helper"] = 5] = "Helper";
    FileType[FileType["Javascript"] = 6] = "Javascript";
    FileType[FileType["StyleSheet"] = 7] = "StyleSheet";
    FileType[FileType["Rspec"] = 8] = "Rspec";
    FileType[FileType["Test"] = 9] = "Test";
})(FileType || (FileType = {}));
const REL_CONTROLLERS = path_1.join("app", "controllers");
const REL_MODELS = path_1.join("app", "models");
const REL_VIEWS = path_1.join("app", "views");
const REL_LAYOUTS = path_1.join("app", "layouts");
const REL_HELPERS = path_1.join("app", "helpers");
const REL_JAVASCRIPTS = path_1.join("app", "assets", "javascripts");
const REL_STYLESHEETS = path_1.join("app", "assets", "stylesheets");
const REL_SPEC = "spec";
const REL_TEST = "test";
class RailsHelper {
    constructor(relativeFileName, line) {
        this.patterns = [
            path_1.join(REL_CONTROLLERS, "PTN", "*"),
            path_1.join(REL_CONTROLLERS, "PTN*"),
            path_1.join(REL_MODELS, "SINGULARIZE", "*"),
            path_1.join(REL_MODELS, "SINGULARIZE*"),
            path_1.join(REL_MODELS, "BASENAME_SINGULARIZE", "*"),
            path_1.join(REL_MODELS, "BASENAME_SINGULARIZE*"),
            path_1.join(REL_VIEWS, "PTN", "*"),
            path_1.join(REL_VIEWS, "PTN*"),
            path_1.join(REL_LAYOUTS, "PTN", "*"),
            path_1.join(REL_LAYOUTS, "PTN*"),
            path_1.join(REL_HELPERS, "PTN", "*"),
            path_1.join(REL_HELPERS, "PTN*"),
            path_1.join(REL_JAVASCRIPTS, "PTN", "*"),
            path_1.join(REL_JAVASCRIPTS, "PTN*"),
            path_1.join(REL_STYLESHEETS, "PTN", "*"),
            path_1.join(REL_STYLESHEETS, "PTN*")
        ];
        this.items = [];
        this.relativeFileName = relativeFileName;
        this.fileName = path_1.basename(relativeFileName);
        this.filePath = path_1.dirname(relativeFileName);
        this.line = line;
        this.dectFileType();
    }
    searchPaths() {
        var res = [];
        this.patterns.forEach(e => {
            var p = e.replace("PTN", this.filePatten.toString());
            p = p.replace("BASENAME_SINGULARIZE", inflection.singularize(path_1.basename(this.filePatten.toString())));
            p = p.replace("SINGULARIZE", inflection.singularize(this.filePatten.toString()));
            res.push(p);
        });
        return res;
    }
    dectFileType() {
        this.filePatten = null;
        this.targetFile = null;
        if (this.filePath.indexOf(REL_CONTROLLERS + path_1.sep) >= 0) {
            this.fileType = FileType.Controller;
            let prefix = this.filePath.substring(REL_CONTROLLERS.length + 1);
            this.filePatten = path_1.join(prefix, this.fileName.replace(/_controller\.rb$/, ""));
        }
        else if (this.filePath.indexOf(REL_MODELS + path_1.sep) >= 0) {
            this.fileType = FileType.Model;
            let prefix = this.filePath.substring(REL_MODELS.length + 1);
            this.filePatten = path_1.join(prefix, this.fileName.replace(/\.rb$/, ""));
            //DONE pluralize
            this.filePatten = inflection.pluralize(this.filePatten.toString());
        }
        else if (this.filePath.indexOf(REL_LAYOUTS + path_1.sep) >= 0) {
            this.fileType = FileType.Layout;
            let prefix = this.filePath.substring(REL_LAYOUTS.length + 1);
            this.filePatten = path_1.join(prefix, this.fileName.replace(/\..*?\..*?$/, ""));
        }
        else if (this.filePath.indexOf(REL_VIEWS + path_1.sep) >= 0) {
            this.fileType = FileType.View;
            let prefix = this.filePath.substring(REL_VIEWS.length + 1);
            this.filePatten = prefix;
        }
        else if (this.filePath.indexOf(REL_HELPERS + path_1.sep) >= 0) {
            this.fileType = FileType.Helper;
            let prefix = this.filePath.substring(REL_HELPERS.length + 1);
            this.filePatten = path_1.join(prefix, this.fileName.replace(/_helper\.rb$/, ""));
        }
        else if (this.filePath.indexOf(REL_JAVASCRIPTS + path_1.sep) >= 0) {
            this.fileType = FileType.Javascript;
            let prefix = this.filePath.substring(REL_JAVASCRIPTS.length + 1);
            this.filePatten = path_1.join(prefix, this.fileName.replace(/\.js$/, "").replace(/\..*?\..*?$/, ""));
        }
        else if (this.filePath.indexOf(REL_STYLESHEETS + path_1.sep) >= 0) {
            this.fileType = FileType.StyleSheet;
            let prefix = this.filePath.substring(REL_STYLESHEETS.length + 1);
            this.filePatten = path_1.join(prefix, this.fileName.replace(/\.css$/, "").replace(/\..*?\..*?$/, ""));
        }
        else if (this.filePath.indexOf(REL_SPEC + path_1.sep) >= 0) {
            this.fileType = FileType.Rspec;
            let prefix = this.filePath.substring(REL_SPEC.length + 1);
            this.targetFile = path_1.join("app", prefix, this.fileName.replace("_spec.rb", ".rb"));
        }
        else if (this.filePath.indexOf(REL_TEST + path_1.sep) >= 0) {
            this.fileType = FileType.Test;
            let prefix = this.filePath.substring(REL_TEST.length + 1);
            this.filePatten = path_1.join("app", prefix, this.fileName.replace("_test.rb", ".rb"));
        }
    }
    generateList(arr) {
        var cur = arr.pop();
        var _self = this;
        vscode.workspace.findFiles(cur.toString(), null).then((res) => {
            res.forEach(i => {
                var fn = vscode.workspace.asRelativePath(i);
                if (_self.relativeFileName !== fn)
                    _self.items.push(fn);
            });
            if (arr.length > 0) {
                _self.generateList(arr);
            }
            else {
                this.showQuickPick(_self.items);
            }
        });
    }
    showQuickPick(items) {
        const p = vscode.window.showQuickPick(items, { placeHolder: "Select File", matchOnDetail: true });
        p.then(value => {
            if (!value)
                return;
            const fn = vscode.Uri.parse('file://' + path_1.join(vscode.workspace.rootPath, value));
            vscode.workspace.openTextDocument(fn).then(doc => {
                return vscode.window.showTextDocument(doc);
            });
        });
    }
    showFileList() {
        if (this.filePatten != null) {
            var paths = this.searchPaths().slice();
            this.generateList(paths);
        }
        else if (this.targetFile != null) {
            this.generateList([this.targetFile]);
        }
    }
}
exports.RailsHelper = RailsHelper;
//# sourceMappingURL=rails_helper.js.map