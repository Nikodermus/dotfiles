"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contracts_1 = require("../contracts");
const logEntryNode_1 = require("../commitViewer/logEntryNode");
class CompareFileStatNode extends logEntryNode_1.FileStatNode {
    constructor(fileStat, leftLogEntry, rightLogEntry) {
        super(fileStat, leftLogEntry);
        this.fileStat = fileStat;
        this.rightLogEntry = rightLogEntry;
        switch (fileStat.mode) {
            case contracts_1.Modification.Modified: {
                this.contextValue = 'fileStatM';
                this.iconPath = logEntryNode_1.ModifiedIcon;
                this.command = {
                    title: 'Compare against previous version',
                    command: 'git.commit.FileEntry.CompareAgainstCommit',
                    arguments: [this]
                };
                break;
            }
            case contracts_1.Modification.Created: {
                this.contextValue = 'fileStatA';
                this.iconPath = logEntryNode_1.AddedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [new logEntryNode_1.FileStatNode(fileStat, rightLogEntry)]
                };
                break;
            }
            case contracts_1.Modification.Deleted: {
                this.contextValue = 'fileStatD';
                this.iconPath = logEntryNode_1.RemovedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [new logEntryNode_1.FileStatNode(fileStat, leftLogEntry)]
                };
                break;
            }
        }
    }
}
exports.CompareFileStatNode = CompareFileStatNode;
//# sourceMappingURL=logEntryNode.js.map