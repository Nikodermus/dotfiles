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
class RailsHelper {
    constructor(file_path, file_name, relativeFileName) {
        /*
            private paths = [
                "app/controllers",
                "app/models",
                "app/views",
                "app/views/layouts",
                "app/helpers",
                "app/assets/javascripts",
                "app/assets/stylesheets",
            ];
        */
        this.patterns = [
            "app/controllers/PTN*",
            "app/models/SINGULARIZE*",
            "app/views/PTN/**",
            "app/views/layouts/PTN*",
            "app/helpers/PTN*",
            "app/assets/javascripts/PTN*",
            "app/assets/javascripts/PTN/**",
            "app/assets/stylesheets/PTN*",
            "app/assets/stylesheets/PTN/**",
        ];
        this.items = [];
        this.relativeFileName = relativeFileName;
        this.fileName = file_name;
        this.filePath = path_1.join(file_path, "/");
        this.dectFileType();
    }
    searchPaths() {
        var res = [];
        this.patterns.forEach(e => {
            var p = e.replace("PTN", this.filePatten.toString());
            p = p.replace("SINGULARIZE", inflection.singularize(this.filePatten.toString()));
            res.push(p);
        });
        return res;
    }
    dectFileType() {
        this.filePatten = null;
        if (this.filePath.indexOf("app/controllers/") >= 0) {
            this.fileType = FileType.Controller;
            this.filePatten = this.fileName.replace(/_controller\.rb$/, "");
        }
        else if (this.filePath.indexOf("app/models/") >= 0) {
            this.fileType = FileType.Model;
            this.filePatten = this.fileName.replace(/\.rb$/, "");
            //DONE pluralize
            this.filePatten = inflection.pluralize(this.filePatten.toString());
        }
        else if (this.filePath.indexOf("app/views/layouts/") >= 0) {
            this.fileType = FileType.Layout;
            this.filePatten = this.fileName.replace(/\..*?\..*?$/, "");
        }
        else if (this.filePath.indexOf("app/views/") >= 0) {
            this.fileType = FileType.View;
            this.filePatten = this.filePath.replace("app/views/", '').replace(/\/$/, '');
        }
        else if (this.filePath.indexOf("app/helpers/") >= 0) {
            this.fileType = FileType.Helper;
            this.filePatten = this.fileName.replace(/_helper\.rb$/, "");
        }
        else if (this.filePath.indexOf("app/assets/javascripts/") >= 0) {
            this.fileType = FileType.Javascript;
            this.filePatten = this.fileName.replace(/\.js$/, "").replace(/\..*?\..*?$/, "");
        }
        else if (this.filePath.indexOf("app/assets/stylesheets/") >= 0) {
            this.fileType = FileType.StyleSheet;
            this.filePatten = this.fileName.replace(/\.css$/, "").replace(/\..*?\..*?$/, "");
        }
        else if (this.filePath.indexOf("/spec/") >= 0) {
            this.fileType = FileType.Rspec;
            //TODO
            this.filePatten = null;
        }
        else if (this.filePath.indexOf("/test/") >= 0) {
            this.fileType = FileType.Test;
            //TODO
            this.filePatten = null;
        }
    }
    generateList(arr) {
        var cur = arr.pop();
        var _self = this;
        vscode.workspace.findFiles(cur.toString(), null).then((res) => {
            res.forEach(i => {
                var fn = vscode.workspace.asRelativePath(i);
                //var pic = { label: fn, detail: "c: ${fn}" };
                console.log(fn, _self.relativeFileName);
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
    }
}
exports.RailsHelper = RailsHelper;
//# sourceMappingURL=rails_helper.js.map