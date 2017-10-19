/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
const vscode = require("vscode");
const referencesDocument_1 = require("./referencesDocument");
class Provider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
        this._documents = new Map();
        this._editorDecoration = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });
        // Listen to the `closeTextDocument`-event which means we must
        // clear the corresponding model object - `ReferencesDocument`
        this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => this._documents.delete(doc.uri.toString()));
    }
    dispose() {
        this._subscriptions.dispose();
        this._documents.clear();
        this._editorDecoration.dispose();
        this._onDidChange.dispose();
    }
    // Expose an event to signal changes of _virtual_ documents
    // to the editor
    get onDidChange() {
        return this._onDidChange.event;
    }
    // Provider method that takes an uri of the `references`-scheme and
    // resolves its content by (1) running the reference search command
    // and (2) formatting the results
    provideTextDocumentContent(uri) {
        // already loaded?
        let document = this._documents.get(uri.toString());
        if (document) {
            return document.value;
        }
        // Decode target-uri and target-position from the provided uri and execute the
        // `reference provider` command (http://code.visualstudio.com/docs/extensionAPI/vscode-api-commands).
        // From the result create a references document which is in charge of loading,
        // printing, and formatting references
        const [target, pos] = decodeLocation(uri);
        return vscode.commands.executeCommand('vscode.executeReferenceProvider', target, pos).then(locations => {
            // sort by locations and shuffle to begin from target resource
            let idx = 0;
            locations.sort(Provider._compareLocations).find((loc, i) => loc.uri.toString() === target.toString() && (idx = i) && true);
            locations.push(...locations.splice(0, idx));
            // create document and return its early state
            let document = new referencesDocument_1.default(uri, locations, this._onDidChange);
            this._documents.set(uri.toString(), document);
            return document.value;
        });
    }
    static _compareLocations(a, b) {
        if (a.uri.toString() < b.uri.toString()) {
            return -1;
        }
        else if (a.uri.toString() > b.uri.toString()) {
            return 1;
        }
        else {
            return a.range.start.compareTo(b.range.start);
        }
    }
    provideDocumentLinks(document, token) {
        // While building the virtual document we have already created the links.
        // Those are composed from the range inside the document and a target uri
        // to which they point
        const doc = this._documents.get(document.uri.toString());
        if (doc) {
            return doc.links;
        }
    }
}
Provider.scheme = 'references';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Provider;
let seq = 0;
function encodeLocation(uri, pos) {
    const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
    return vscode.Uri.parse(`${Provider.scheme}:References.locations?${query}#${seq++}`);
}
exports.encodeLocation = encodeLocation;
function decodeLocation(uri) {
    let [target, line, character] = JSON.parse(uri.query);
    return [vscode.Uri.parse(target), new vscode.Position(line, character)];
}
exports.decodeLocation = decodeLocation;
//# sourceMappingURL=provider.js.map