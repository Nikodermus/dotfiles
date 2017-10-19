"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const contracts_1 = require("../contracts");
const path = require("path");
exports.GitCommitIcon = {
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'darkTheme', 'git-commit.png'),
    light: path.join(__dirname, '..', '..', '..', 'resources', 'octicons', 'svg', 'git-commit.svg')
};
exports.FolderIcon = {
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'darkTheme', 'folder.svg'),
    light: path.join(__dirname, '..', '..', '..', 'resources', 'lightTheme', 'folder.svg')
};
exports.AddedIcon = {
    light: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'light', 'status-added.svg'),
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'dark', 'status-added.svg')
};
exports.RemovedIcon = {
    light: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'light', 'status-deleted.svg'),
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'dark', 'status-deleted.svg')
};
exports.ModifiedIcon = {
    light: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'light', 'status-modified.svg'),
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'icons', 'dark', 'status-modified.svg')
};
exports.FileIcon = {
    dark: path.join(__dirname, '..', '..', '..', 'resources', 'darkTheme', 'document.svg'),
    light: path.join(__dirname, '..', '..', '..', 'resources', 'lightTheme', 'document.svg')
};
class CommitEntryNode extends vscode_1.TreeItem {
    constructor(label, collapsibleState) {
        super(label, collapsibleState);
    }
}
exports.CommitEntryNode = CommitEntryNode;
class LogEntryNode extends CommitEntryNode {
    constructor(logEntry) {
        super(`${logEntry.author.name} on ${logEntry.author.localisedDate}`, vscode_1.TreeItemCollapsibleState.Collapsed);
        this.logEntry = logEntry;
        this.contextValue = 'logEntry';
        this.iconPath = exports.GitCommitIcon;
    }
}
exports.LogEntryNode = LogEntryNode;
class TextNode extends CommitEntryNode {
    constructor(label) {
        super(label, vscode_1.TreeItemCollapsibleState.None);
        this.label = label;
    }
}
exports.TextNode = TextNode;
class DirectoryNode extends CommitEntryNode {
    constructor(fullPath, logEntry) {
        super(path.basename(fullPath), vscode_1.TreeItemCollapsibleState.Collapsed);
        this.fullPath = fullPath;
        this.logEntry = logEntry;
        this.fileStats = [];
        this.contextValue = 'directory';
        const upperDirPath = fullPath.toUpperCase();
        this.fileStats = logEntry.fileStats.filter(fileStat => path.dirname(fileStat.path).toUpperCase() == upperDirPath);
        this.iconPath = exports.FolderIcon;
    }
}
exports.DirectoryNode = DirectoryNode;
class FileStatNode extends CommitEntryNode {
    constructor(fileStat, logEntry) {
        super(FileStatNode.getTitle(fileStat), vscode_1.TreeItemCollapsibleState.None);
        this.fileStat = fileStat;
        this.logEntry = logEntry;
        switch (fileStat.mode) {
            case contracts_1.Modification.Created: {
                this.contextValue = 'fileStatA';
                this.iconPath = exports.AddedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [this]
                };
                break;
            }
            case contracts_1.Modification.Modified: {
                this.contextValue = 'fileStatM';
                this.iconPath = exports.ModifiedIcon;
                this.command = {
                    title: 'Compare against previous version',
                    command: 'git.commit.FileEntry.CompareAgainstPrevious',
                    arguments: [this]
                };
                break;
            }
            case contracts_1.Modification.Deleted: {
                this.contextValue = 'fileStatD';
                this.iconPath = exports.RemovedIcon;
                break;
            }
            default: {
                this.contextValue = 'fileStat';
                this.iconPath = exports.FileIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [this]
                };
            }
        }
    }
    static getTitle(fileStat) {
        const fileName = path.basename(fileStat.path);
        return fileName === fileStat.path ? fileName : `${fileName} (${path.dirname(fileStat.path)})`;
    }
}
exports.FileStatNode = FileStatNode;
//# sourceMappingURL=logEntryNode.js.map