"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const tmp = require("tmp");
const request = require("request");
const path = require("path");
const url = require("url");
const fs = require("fs");
const probe = require("probe-image-size");
var base64Img = require('base64-img');
tmp.setGracefulCleanup();
function activate(context) {
    const acceptedExtensions = ['.svg', '.png', '.jpeg', '.jpg', '.bmp', '.gif'];
    const [major, minor, patch] = vscode.version.split('.').map(v => parseInt(v));
    let fallbackImage = undefined;
    let imageCache = new Map();
    const markdownRecognizer = {
        recognize: (editor, line) => {
            let imagePath;
            if (editor.document.languageId == "markdown") {
                let imageUrls = /\((.*)\)/igm;
                let match = imageUrls.exec(line);
                if (match && match.length > 1) {
                    imagePath = match[1];
                }
            }
            return imagePath;
        }
    };
    const urlRecognizer = {
        recognize: (editor, line) => {
            let imageUrls = /url\('?"?([^'"]*)'?"?\)/igm;
            let match = imageUrls.exec(line);
            let imagePath;
            if (match && match.length > 1) {
                imagePath = match[1];
            }
            return imagePath;
        }
    };
    const imgSrcRecognizer = {
        recognize: (editor, line) => {
            let imageUrls = /src=['"]{1}([^'"]*)['"]{1}/igm;
            let match = imageUrls.exec(line);
            let imagePath;
            if (match && match.length > 1) {
                imagePath = match[1];
            }
            return imagePath;
        }
    };
    const pythonRecognizer = {
        recognize: (editor, line) => {
            let imageUrls = /['`"]{1}([^'`"]+\.[\w]{3})['`"]{1}/igm;
            let match = imageUrls.exec(line);
            let imagePath;
            if (match && match.length > 1) {
                imagePath = match[1];
            }
            return imagePath;
        }
    };
    const dataUrlMapper = {
        map(editor, imagePath) {
            let absoluteImagePath;
            if (imagePath.indexOf("data:image") === 0) {
                absoluteImagePath = imagePath;
            }
            return absoluteImagePath;
        },
        refreshConfig() {
        }
    };
    const simpleUrlMapper = {
        map(editor, imagePath) {
            let absoluteImagePath;
            if (imagePath.indexOf("http") == 0) {
                absoluteImagePath = imagePath;
            }
            else if (imagePath.indexOf("//") == 0) {
                absoluteImagePath = "http:" + imagePath;
            }
            else if (path.isAbsolute(imagePath)) {
                if (fs.existsSync(imagePath)) {
                    absoluteImagePath = imagePath;
                }
            }
            return absoluteImagePath;
        },
        refreshConfig() {
        }
    };
    const relativeToOpenFileUrlMapper = {
        map(editor, imagePath) {
            let absoluteImagePath;
            const pathName = url.parse(imagePath).pathname;
            let testImagePath = path.join(editor.document.fileName, '..', pathName);
            if (fs.existsSync(testImagePath)) {
                absoluteImagePath = testImagePath;
            }
            return absoluteImagePath;
        },
        refreshConfig() {
        }
    };
    class RelativeToWorkspaceRootFileUrlMapper {
        constructor() {
            this.additionalSourceFolder = "";
        }
        map(editor, imagePath) {
            let absoluteImagePath;
            let root = vscode.workspace.getWorkspaceFolder(editor.document.uri);
            if (root && root.uri && root.uri.fsPath) {
                const rootPath = root.uri.fsPath;
                const pathName = url.parse(imagePath).pathname;
                let testImagePath = path.join(rootPath, pathName);
                if (fs.existsSync(testImagePath)) {
                    absoluteImagePath = testImagePath;
                }
                else {
                    let testImagePath = path.join(rootPath, this.additionalSourceFolder, pathName);
                    if (fs.existsSync(testImagePath)) {
                        absoluteImagePath = testImagePath;
                    }
                }
            }
            return absoluteImagePath;
        }
        refreshConfig() {
            const config = vscode.workspace.getConfiguration('gutterpreview');
            this.additionalSourceFolder = config.get('sourcefolder', "");
        }
    }
    const relativeToWorkspaceRootFileUrlMapper = new RelativeToWorkspaceRootFileUrlMapper();
    const nonNull = (item) => {
        return !(item == null || item == undefined || item.length == 0);
    };
    const recognizers = [markdownRecognizer, urlRecognizer, imgSrcRecognizer, pythonRecognizer];
    const absoluteUrlMappers = [dataUrlMapper, simpleUrlMapper, relativeToOpenFileUrlMapper, relativeToWorkspaceRootFileUrlMapper];
    const collectEntries = (editor, lastScanResult) => {
        var max = editor.document.lineCount;
        const config = vscode.workspace.getConfiguration('gutterpreview');
        const showImagePreviewOnGutter = config.get('showimagepreviewongutter', true);
        for (var lineIndex = 0; lineIndex < max; lineIndex++) {
            var lineObject = editor.document.lineAt(lineIndex);
            var line = lineObject.text;
            absoluteUrlMappers.forEach(absoluteUrlMapper => absoluteUrlMapper.refreshConfig());
            let recognizedImages = recognizers.map(recognizer => recognizer.recognize(editor, line)).filter(item => nonNull(item));
            recognizedImages.forEach((imagePath) => {
                let absoluteUrls = absoluteUrlMappers.map(mapper => mapper.map(editor, imagePath)).filter(item => nonNull(item));
                let absoluteUrlsSet = new Set(absoluteUrls);
                absoluteUrlsSet.forEach((absoluteImagePath) => {
                    appendImagePath(showImagePreviewOnGutter, absoluteImagePath, lineIndex, lastScanResult);
                });
            });
        }
        ;
    };
    const clearEditor = (editor, lastScanResult) => {
        lastScanResult.forEach(element => {
            let { textEditorDecorationType, decorations, originalImagePath, imagePath } = element;
            vscode.window.activeTextEditor.setDecorations(textEditorDecorationType, []);
        });
    };
    const appendImagePath = (showImagePreviewOnGutter, absoluteImagePath, lineIndex, lastScanResult) => {
        if (absoluteImagePath) {
            let isDataUri = absoluteImagePath.indexOf("data:image") == 0;
            let isExtensionSupported;
            if (!isDataUri) {
                const absoluteImageUrl = url.parse(absoluteImagePath);
                let absolutePath = path.parse(absoluteImageUrl.pathname);
                isExtensionSupported = acceptedExtensions.some((ext) => absolutePath.ext && absolutePath.ext.toLowerCase().startsWith(ext));
            }
            absoluteImagePath = absoluteImagePath.replace(/\|(width=\d*)?(height=\d*)?/gm, '');
            if (isDataUri || isExtensionSupported) {
                let decorations = [];
                decorations.push({
                    range: new vscode.Range(lineIndex, 0, lineIndex, 0),
                    hoverMessage: ""
                });
                var uri = absoluteImagePath;
                if (major > 1 || (major == 1 && minor > 5)) {
                    uri = vscode.Uri.parse(absoluteImagePath);
                }
                const decorate = (uri) => {
                    let decorationRenderOptions = {
                        gutterIconPath: uri,
                        gutterIconSize: 'contain'
                    };
                    let textEditorDecorationType = vscode.window.createTextEditorDecorationType(decorationRenderOptions);
                    lastScanResult.push({ textEditorDecorationType, decorations, originalImagePath: absoluteImagePath, imagePath: uri });
                    if (showImagePreviewOnGutter) {
                        vscode.window.activeTextEditor.setDecorations(textEditorDecorationType, decorations);
                    }
                };
                if (isDataUri) {
                    decorate(uri);
                }
                else {
                    if (imageCache.has(absoluteImagePath)) {
                        imageCache.get(absoluteImagePath).then((path) => decorate(path));
                    }
                    else {
                        try {
                            const absoluteImageUrl = url.parse(absoluteImagePath);
                            const tempFile = tmp.fileSync({
                                postfix: path.parse(absoluteImageUrl.pathname).ext
                            });
                            const filePath = tempFile.name;
                            const promise = new Promise((resolve, reject) => {
                                if (absoluteImageUrl.protocol && absoluteImageUrl.protocol.startsWith('http')) {
                                    var r = request(absoluteImagePath)
                                        .on('response', function (res) {
                                        r.pipe(fs.createWriteStream(filePath)).on('close', () => {
                                            resolve(filePath);
                                        });
                                    });
                                }
                                else {
                                    const handle = fs.watch(absoluteImagePath, function fileChangeListener() {
                                        handle.close();
                                        fs.unlink(filePath, () => { });
                                        imageCache.delete(absoluteImagePath);
                                        throttledScan(50);
                                    });
                                    copyFile(absoluteImagePath, filePath, (err) => {
                                        if (!err) {
                                            resolve(filePath);
                                        }
                                    });
                                }
                            });
                            promise.then(path => decorate(path));
                            imageCache.set(absoluteImagePath, promise);
                        }
                        catch (error) {
                        }
                    }
                }
            }
        }
    };
    function copyFile(source, target, cb) {
        var cbCalled = false;
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            done(err);
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            done(err);
        });
        wr.on("close", function (ex) {
            done();
        });
        rd.pipe(wr);
        function done(err) {
            if (!cbCalled) {
                cb(err);
                cbCalled = true;
            }
        }
    }
    fallbackImage = context.asAbsolutePath("images/logo.png");
    let disposables = [];
    let lastScanResult = [];
    let throttleId = undefined;
    let throttledScan = (timeout = 500) => {
        if (throttleId)
            clearTimeout(throttleId);
        throttleId = setTimeout(() => scan(), timeout);
    };
    const scan = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            clearEditor(editor, lastScanResult);
            lastScanResult = [];
            collectEntries(editor, lastScanResult);
        }
    };
    let hoverProvider = {
        provideHover(document, position, token) {
            let range = document.getWordRangeAtPosition(position);
            let result = undefined;
            if (range) {
                if (major > 1 || (major == 1 && minor > 7)) {
                    const matchingDecoratorAndItem = lastScanResult.map(item => {
                        return {
                            item: item,
                            decoration: item.decorations.find(dec => range.start.line == dec.range.start.line)
                        };
                    }).find(pair => pair.decoration != null);
                    if (matchingDecoratorAndItem) {
                        const item = matchingDecoratorAndItem.item;
                        const dec = matchingDecoratorAndItem.decoration;
                        var fallback = () => {
                            let markedString = "![" + item.originalImagePath + "](" + item.originalImagePath + "|height=100)";
                            let resultset = [markedString];
                            return new vscode.Hover(resultset, document.getWordRangeAtPosition(position));
                        };
                        var imageWithSize = (markedString, result) => {
                            let resultset = [markedString + `  \r\n${result.width}x${result.height}`];
                            return new vscode.Hover(resultset, document.getWordRangeAtPosition(position));
                        };
                        try {
                            let markedString = "![" + item.originalImagePath + "](" + item.imagePath + "|height=100)";
                            result = probe(fs.createReadStream(item.imagePath)).then((result) => imageWithSize(markedString, result), () => fallback());
                        }
                        catch (error) {
                            result = Promise.resolve(fallback());
                        }
                    }
                }
            }
            return result;
        }
    };
    disposables.push(vscode.languages.registerHoverProvider(['*'], hoverProvider));
    disposables.push(vscode.Disposable.from({
        dispose: () => cleanupUnusedTempFiles()
    }));
    const cleanupUnusedTempFiles = () => {
        imageCache.forEach(value => {
            value.then(tmpFile => fs.unlink(tmpFile, () => { }));
        });
        imageCache.clear();
    };
    vscode.workspace.onDidChangeTextDocument(() => throttledScan());
    vscode.window.onDidChangeActiveTextEditor(e => {
        cleanupUnusedTempFiles();
        throttledScan();
    });
    vscode.workspace.onDidChangeWorkspaceFolders(e => {
        cleanupUnusedTempFiles();
        throttledScan();
    });
    vscode.workspace.onDidOpenTextDocument(() => {
        lastScanResult = [];
        cleanupUnusedTempFiles();
        throttledScan();
    });
    throttledScan();
    context.subscriptions.push(...disposables);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map