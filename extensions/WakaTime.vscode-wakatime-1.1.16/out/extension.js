// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var fs = require('fs');
var os = require('os');
var path = require('path');
var child_process = require('child_process');
var AdmZip = require('adm-zip');
var ini = require('ini');
var request = require('request');
var rimraf = require('rimraf');
var logger;
var options;
// this method is called when your extension is activated. activation is
// controlled by the activation events defined in package.json
function activate(ctx) {
    options = new Options();
    logger = new Logger('info');
    // initialize WakaTime
    var wakatime = new WakaTime();
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.apikey', function (args) {
        wakatime.promptForApiKey();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.proxy', function (args) {
        wakatime.promptForProxy();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.debug', function (args) {
        wakatime.promptForDebug();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.status_bar_icon', function (args) {
        wakatime.promptStatusBarIcon();
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand('wakatime.dashboard', function (args) {
        wakatime.openDashboardWebsite();
    }));
    // add to a list of disposables which are disposed when this extension
    // is deactivated again.
    ctx.subscriptions.push(wakatime);
    options.getSetting('settings', 'debug', function (error, debug) {
        if (debug && debug.trim() === 'true')
            logger.setLevel('debug');
        wakatime.initialize();
    });
}
exports.activate = activate;
var WakaTime = (function () {
    function WakaTime() {
        this.extension = vscode.extensions.getExtension("WakaTime.vscode-wakatime").packageJSON;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.lastHeartbeat = 0;
        this.options = new Options();
    }
    WakaTime.prototype.initialize = function () {
        var _this = this;
        logger.debug('Initializing WakaTime v' + this.extension.version);
        this.statusBar.text = '$(clock) WakaTime Initializing...';
        this.statusBar.show();
        this._checkApiKey();
        this.dependencies = new Dependencies(this.options);
        this.dependencies.checkAndInstall(function () {
            _this.statusBar.text = '$(clock) WakaTime Initialized';
            _this.options.getSetting('settings', 'status_bar_icon', function (err, val) {
                if (val && val.trim() == 'false')
                    _this.statusBar.hide();
                else
                    _this.statusBar.show();
            });
        });
        this._setupEventListeners();
    };
    WakaTime.prototype.promptForApiKey = function () {
        var _this = this;
        this.options.getSetting('settings', 'api_key', function (err, defaultVal) {
            if (_this.validateKey(defaultVal) != null)
                defaultVal = '';
            var promptOptions = {
                prompt: 'WakaTime API Key',
                placeHolder: 'Enter your api key from wakatime.com/settings',
                value: defaultVal,
                ignoreFocusOut: true,
                validateInput: _this.validateKey.bind(_this),
            };
            vscode.window.showInputBox(promptOptions).then(function (val) {
                if (_this.validateKey(val) == null)
                    _this.options.setSetting('settings', 'api_key', val);
            });
        });
    };
    WakaTime.prototype.validateKey = function (key) {
        var err = 'Invalid api key... check https://wakatime.com/settings for your key.';
        if (!key)
            return err;
        var re = new RegExp('^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$', 'i');
        if (!re.test(key))
            return err;
        return null;
    };
    WakaTime.prototype.promptForProxy = function () {
        var _this = this;
        this.options.getSetting('settings', 'proxy', function (err, defaultVal) {
            if (!defaultVal)
                defaultVal = '';
            var promptOptions = {
                prompt: 'WakaTime Proxy',
                placeHolder: 'Proxy format is https://user:pass@host:port',
                value: defaultVal,
                ignoreFocusOut: true,
                validateInput: _this.validateProxy.bind(_this),
            };
            vscode.window.showInputBox(promptOptions).then(function (val) {
                if (val || val === '')
                    _this.options.setSetting('settings', 'proxy', val);
            });
        });
    };
    WakaTime.prototype.validateProxy = function (proxy) {
        var err = 'Invalid proxy. Valid formats are https://user:pass@host:port or socks5://user:pass@host:port or domain\\user:pass.';
        if (!proxy)
            return err;
        var re = new RegExp('^((https?|socks5)://)?([^:@]+(:([^:@])+)?@)?[\\w\\.-]+(:\\d+)?$', 'i');
        if (proxy.indexOf('\\') > -1)
            re = new RegExp('^.*\\\\.+$', 'i');
        if (!re.test(proxy))
            return err;
        return null;
    };
    WakaTime.prototype.promptForDebug = function () {
        var _this = this;
        this.options.getSetting('settings', 'debug', function (err, defaultVal) {
            if (!defaultVal || defaultVal.trim() !== 'true')
                defaultVal = 'false';
            var items = ['true', 'false'];
            var promptOptions = {
                placeHolder: 'true or false (Currently ' + defaultVal + ')',
                value: defaultVal,
                ignoreFocusOut: true,
            };
            vscode.window.showQuickPick(items, promptOptions).then(function (newVal) {
                if (newVal == null)
                    return;
                _this.options.setSetting('settings', 'debug', newVal);
                if (newVal === 'true') {
                    logger.setLevel('debug');
                    logger.debug('Debug enabled');
                }
                else {
                    logger.setLevel('info');
                }
            });
        });
    };
    WakaTime.prototype.promptStatusBarIcon = function () {
        var _this = this;
        this.options.getSetting('settings', 'status_bar_icon', function (err, defaultVal) {
            if (!defaultVal || defaultVal.trim() !== 'false')
                defaultVal = 'true';
            var items = ['true', 'false'];
            var promptOptions = {
                placeHolder: 'true or false (Currently ' + defaultVal + ')',
                value: defaultVal,
                ignoreFocusOut: true,
            };
            vscode.window.showQuickPick(items, promptOptions).then(function (newVal) {
                if (newVal == null)
                    return;
                _this.options.setSetting('settings', 'status_bar_icon', newVal);
                if (newVal === 'true') {
                    _this.statusBar.show();
                    logger.debug('Status bar icon enabled');
                }
                else {
                    _this.statusBar.hide();
                    logger.debug('Status bar icon disabled');
                }
            });
        });
    };
    WakaTime.prototype.openDashboardWebsite = function () {
        var open = 'xdg-open';
        var args = ['https://wakatime.com/'];
        if (Dependencies.isWindows()) {
            open = 'cmd';
            args.unshift('/c', 'start', '""');
        }
        else if (os.type() == 'Darwin') {
            open = 'open';
        }
        var process = child_process.execFile(open, args, function (error, stdout, stderr) {
            if (error != null) {
                if (stderr && stderr.toString() != '')
                    logger.error(stderr.toString());
                if (stdout && stdout.toString() != '')
                    logger.error(stdout.toString());
                logger.error(error.toString());
            }
        });
    };
    WakaTime.prototype._checkApiKey = function () {
        var _this = this;
        this.hasApiKey(function (hasApiKey) {
            if (!hasApiKey)
                _this.promptForApiKey();
        });
    };
    WakaTime.prototype.hasApiKey = function (callback) {
        var _this = this;
        this.options.getSetting('settings', 'api_key', function (error, apiKey) {
            callback(_this.validateKey(apiKey) == null);
        });
    };
    WakaTime.prototype._setupEventListeners = function () {
        // subscribe to selection change and editor activation events
        var subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this._onChange, this, subscriptions);
        vscode.window.onDidChangeActiveTextEditor(this._onChange, this, subscriptions);
        vscode.workspace.onDidSaveTextDocument(this._onSave, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this.disposable = (_a = vscode.Disposable).from.apply(_a, subscriptions);
        var _a;
    };
    WakaTime.prototype._onChange = function () {
        this._onEvent(false);
    };
    WakaTime.prototype._onSave = function () {
        this._onEvent(true);
    };
    WakaTime.prototype._onEvent = function (isWrite) {
        var editor = vscode.window.activeTextEditor;
        if (editor) {
            var doc = editor.document;
            if (doc) {
                var file = doc.fileName;
                if (file) {
                    var time = Date.now();
                    if (isWrite || this._enoughTimePassed(time) || this.lastFile !== file) {
                        this._sendHeartbeat(file, isWrite);
                        this.lastFile = file;
                        this.lastHeartbeat = time;
                    }
                }
            }
        }
    };
    WakaTime.prototype._sendHeartbeat = function (file, isWrite) {
        var _this = this;
        this.hasApiKey(function (hasApiKey) {
            if (hasApiKey) {
                _this.dependencies.getPythonLocation(function (pythonBinary) {
                    if (pythonBinary) {
                        var core = _this.dependencies.getCoreLocation();
                        var user_agent = 'vscode/' + vscode.version + ' vscode-wakatime/' + _this.extension.version;
                        var args = [core, '--file', file, '--plugin', user_agent];
                        var project = _this._getProjectName();
                        if (project)
                            args.push('--alternate-project', project);
                        if (isWrite)
                            args.push('--write');
                        if (Dependencies.isWindows())
                            args.push('--config', _this.options.getConfigFile(), '--logfile', _this.options.getLogFile());
                        logger.debug('Sending heartbeat: ' + _this.formatArguments(pythonBinary, args));
                        var process_1 = child_process.execFile(pythonBinary, args, function (error, stdout, stderr) {
                            if (error != null) {
                                if (stderr && stderr.toString() != '')
                                    logger.error(stderr.toString());
                                if (stdout && stdout.toString() != '')
                                    logger.error(stdout.toString());
                                logger.error(error.toString());
                            }
                        });
                        process_1.on('close', function (code, signal) {
                            if (code == 0) {
                                _this.statusBar.text = '$(clock) WakaTime Active';
                                var today = new Date();
                                _this.statusBar.tooltip = 'Last heartbeat sent at ' + _this.formatDate(today);
                            }
                            else if (code == 102) {
                                _this.statusBar.text = '$(clock) WakaTime Offline, coding activity will sync when online.';
                                logger.warn('API Error (102); Check your ~/.wakatime.log file for more details.');
                            }
                            else if (code == 103) {
                                _this.statusBar.text = '$(clock) WakaTime Error';
                                var error_msg = 'Config Parsing Error (103); Check your ~/.wakatime.log file for more details.';
                                _this.statusBar.tooltip = error_msg;
                                logger.error(error_msg);
                            }
                            else if (code == 104) {
                                _this.statusBar.text = '$(clock) WakaTime Error';
                                var error_msg = 'Invalid API Key (104); Make sure your API Key is correct!';
                                _this.statusBar.tooltip = error_msg;
                                logger.error(error_msg);
                            }
                            else {
                                _this.statusBar.text = '$(clock) WakaTime Error';
                                var error_msg = 'Unknown Error (' + code + '); Check your ~/.wakatime.log file for more details.';
                                _this.statusBar.tooltip = error_msg;
                                logger.error(error_msg);
                            }
                        });
                    }
                });
            }
            else {
                _this.promptForApiKey();
            }
        });
    };
    WakaTime.prototype.formatDate = function (date) {
        var months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        var ampm = 'AM';
        var hour = date.getHours();
        if (hour > 11) {
            ampm = 'PM';
            hour = hour - 12;
        }
        if (hour == 0) {
            hour = 12;
        }
        var minute = date.getMinutes();
        if (minute < 10)
            minute = '0' + minute;
        return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ' ' + hour + ':' + minute + ' ' + ampm;
    };
    WakaTime.prototype._enoughTimePassed = function (time) {
        return this.lastHeartbeat + 120000 < time;
    };
    WakaTime.prototype._getProjectName = function () {
        if (vscode.workspace && vscode.workspace.rootPath)
            try {
                return vscode.workspace.rootPath.match(/([^\/^\\]*)[\/\\]*$/)[1];
            }
            catch (e) { }
        return null;
    };
    WakaTime.prototype.obfuscateKey = function (key) {
        var newKey = '';
        if (key) {
            newKey = key;
            if (key.length > 4)
                newKey = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX' + key.substring(key.length - 4);
        }
        return newKey;
    };
    WakaTime.prototype.wrapArg = function (arg) {
        if (arg.indexOf(' ') > -1)
            arg = '"' + arg + '"';
        return arg;
    };
    WakaTime.prototype.formatArguments = function (python, args) {
        var clone = args.slice(0);
        clone.unshift(this.wrapArg(python));
        var newCmds = [];
        var lastCmd = '';
        for (var i = 0; i < clone.length; i++) {
            if (lastCmd == '--key')
                newCmds.push(this.wrapArg(this.obfuscateKey(clone[i])));
            else
                newCmds.push(this.wrapArg(clone[i]));
            lastCmd = clone[i];
        }
        return newCmds.join(' ');
    };
    WakaTime.prototype.dispose = function () {
        this.statusBar.dispose();
        this.disposable.dispose();
    };
    return WakaTime;
})();
exports.WakaTime = WakaTime;
var Dependencies = (function () {
    function Dependencies(options) {
        this._dirname = __dirname;
        this.installCore = function (callback) {
            var _this = this;
            logger.debug('Downloading wakatime-core...');
            var url = 'https://github.com/wakatime/wakatime/archive/master.zip';
            var zipFile = this._dirname + path.sep + 'wakatime-master.zip';
            this.downloadFile(url, zipFile, function () {
                _this.extractCore(zipFile, callback);
            });
        };
        this.options = options;
    }
    Dependencies.prototype.checkAndInstall = function (callback) {
        var _this = this;
        this.isPythonInstalled(function (isInstalled) {
            if (!isInstalled) {
                _this.installPython(function () {
                    _this.checkAndInstallCore(callback);
                });
            }
            else {
                _this.checkAndInstallCore(callback);
            }
        });
    };
    Dependencies.prototype.checkAndInstallCore = function (callback) {
        var _this = this;
        if (!this.isCoreInstalled()) {
            this.installCore(callback);
        }
        else {
            this.isCoreLatest(function (isLatest) {
                if (!isLatest) {
                    _this.installCore(callback);
                }
                else {
                    callback();
                }
            });
        }
    };
    Dependencies.prototype.getPythonLocation = function (callback) {
        if (this._cachedPythonLocation)
            return callback(this._cachedPythonLocation);
        var locations = [
            this._dirname + path.sep + 'python' + path.sep + 'pythonw',
            "pythonw",
            "python",
            "/usr/local/bin/python",
            "/usr/bin/python",
        ];
        for (var i = 40; i >= 26; i--) {
            locations.push('\\python' + i + '\\pythonw');
            locations.push('\\Python' + i + '\\pythonw');
        }
        var args = ['--version'];
        for (var i = 0; i < locations.length; i++) {
            try {
                var stdout = child_process.execFileSync(locations[i], args);
                this._cachedPythonLocation = locations[i];
                return callback(locations[i]);
            }
            catch (e) { }
        }
        callback(null);
    };
    Dependencies.prototype.getCoreLocation = function () {
        var dir = this._dirname + path.sep + 'wakatime-master' + path.sep + 'wakatime' + path.sep + 'cli.py';
        return dir;
    };
    Dependencies.prototype.isCoreInstalled = function () {
        return fs.existsSync(this.getCoreLocation());
    };
    Dependencies.isWindows = function () {
        return os.type() === 'Windows_NT';
    };
    Dependencies.prototype.isCoreLatest = function (callback) {
        var _this = this;
        this.getPythonLocation(function (pythonBinary) {
            if (pythonBinary) {
                var args = [_this.getCoreLocation(), '--version'];
                child_process.execFile(pythonBinary, args, function (error, stdout, stderr) {
                    if (!(error != null)) {
                        var currentVersion = stderr.toString().trim();
                        logger.debug('Current wakatime-core version is ' + currentVersion);
                        logger.debug('Checking for updates to wakatime-core...');
                        _this.getLatestCoreVersion(function (latestVersion) {
                            if (currentVersion === latestVersion) {
                                logger.debug('wakatime-core is up to date.');
                                if (callback)
                                    callback(true);
                            }
                            else if (latestVersion) {
                                logger.debug('Found an updated wakatime-core v' + latestVersion);
                                if (callback)
                                    callback(false);
                            }
                            else {
                                logger.debug('Unable to find latest wakatime-core version from GitHub.');
                                if (callback)
                                    callback(false);
                            }
                        });
                    }
                    else {
                        if (callback)
                            callback(false);
                    }
                });
            }
            else {
                if (callback)
                    callback(false);
            }
        });
    };
    Dependencies.prototype.getLatestCoreVersion = function (callback) {
        var url = 'https://raw.githubusercontent.com/wakatime/wakatime/master/wakatime/__about__.py';
        this.options.getSetting('settings', 'proxy', function (err, proxy) {
            var options = { url: url };
            if (proxy && proxy.trim())
                options['proxy'] = proxy.trim();
            request.get(options, function (error, response, body) {
                var version = null;
                if (!error && response.statusCode == 200) {
                    var lines = body.split('\n');
                    for (var i = 0; i < lines.length; i++) {
                        var re = /^__version_info__ = \('([0-9]+)', '([0-9]+)', '([0-9]+)'\)/g;
                        var match = re.exec(lines[i]);
                        if (match != null) {
                            version = match[1] + '.' + match[2] + '.' + match[3];
                            if (callback)
                                return callback(version);
                        }
                    }
                }
                if (callback)
                    return callback(version);
            });
        });
    };
    Dependencies.prototype.extractCore = function (zipFile, callback) {
        var _this = this;
        logger.debug('Extracting wakatime-core into "' + this._dirname + '"...');
        this.removeCore(function () {
            _this.unzip(zipFile, _this._dirname, callback);
            logger.debug('Finished extracting wakatime-core.');
        });
    };
    Dependencies.prototype.removeCore = function (callback) {
        if (fs.existsSync(this._dirname + path.sep + 'wakatime-master')) {
            try {
                rimraf(this._dirname + path.sep + 'wakatime-master', function () {
                    if (callback != null) {
                        return callback();
                    }
                });
            }
            catch (e) {
                logger.warn(e);
            }
        }
        else {
            if (callback != null) {
                return callback();
            }
        }
    };
    Dependencies.prototype.downloadFile = function (url, outputFile, callback) {
        this.options.getSetting('settings', 'proxy', function (err, proxy) {
            var options = { url: url };
            if (proxy && proxy.trim())
                options['proxy'] = proxy.trim();
            var r = request.get(options);
            var out = fs.createWriteStream(outputFile);
            r.pipe(out);
            return r.on('end', function () {
                return out.on('finish', function () {
                    if (callback != null) {
                        return callback();
                    }
                });
            });
        });
    };
    Dependencies.prototype.unzip = function (file, outputDir, callback) {
        if (callback === void 0) { callback = null; }
        if (fs.existsSync(file)) {
            try {
                var zip = new AdmZip(file);
                zip.extractAllTo(outputDir, true);
            }
            catch (e) {
                return logger.error(e);
            }
            finally {
                fs.unlink(file);
                if (callback != null) {
                    return callback();
                }
            }
        }
    };
    Dependencies.prototype.isPythonInstalled = function (callback) {
        this.getPythonLocation(function (pythonBinary) {
            callback(!!pythonBinary);
        });
    };
    Dependencies.prototype.installPython = function (callback) {
        var _this = this;
        if (Dependencies.isWindows()) {
            var ver = '3.5.1';
            var arch = 'win32';
            if (os.arch().indexOf('x64') > -1)
                arch = 'amd64';
            var url = 'https://www.python.org/ftp/python/' + ver + '/python-' + ver + '-embed-' + arch + '.zip';
            logger.debug('Downloading python...');
            var zipFile = this._dirname + path.sep + 'python.zip';
            this.downloadFile(url, zipFile, function () {
                logger.debug('Extracting python...');
                _this.unzip(zipFile, _this._dirname + path.sep + 'python');
                logger.debug('Finished installing python.');
                callback();
            });
        }
        else {
            logger.error('WakaTime depends on Python. Install it from https://python.org/downloads then restart VSCode.');
        }
    };
    return Dependencies;
})();
var Options = (function () {
    function Options() {
        this._configFile = path.join(this.getUserHomeDir(), '.wakatime.cfg');
        this._logFile = path.join(this.getUserHomeDir(), '.wakatime.log');
    }
    Options.prototype.getSetting = function (section, key, callback) {
        var _this = this;
        fs.readFile(this.getConfigFile(), 'utf-8', function (err, content) {
            if (err) {
                if (callback)
                    callback(new Error('could not read ~/.wakatime.cfg'), null);
            }
            else {
                var currentSection = '';
                var lines = content.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (_this.startsWith(line.trim(), '[') && _this.endsWith(line.trim(), ']')) {
                        currentSection = line.trim().substring(1, line.trim().length - 1).toLowerCase();
                    }
                    else if (currentSection === section) {
                        var parts = line.split('=');
                        var currentKey = parts[0].trim();
                        if (currentKey === key && parts.length > 1) {
                            if (callback)
                                callback(null, parts[1].trim());
                            return;
                        }
                    }
                }
                if (callback)
                    callback(null, null);
            }
        });
    };
    Options.prototype.setSetting = function (section, key, val, callback) {
        var _this = this;
        fs.readFile(this.getConfigFile(), 'utf-8', function (err, content) {
            // ignore errors because config file might not exist yet
            if (err)
                content = '';
            var contents = [];
            var currentSection = '';
            var found = false;
            var lines = content.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (_this.startsWith(line.trim(), '[') && _this.endsWith(line.trim(), ']')) {
                    if ((currentSection === section) && !found) {
                        contents.push(key + ' = ' + val);
                        found = true;
                    }
                    currentSection = line.trim().substring(1, line.trim().length - 1).toLowerCase();
                    contents.push(line);
                }
                else if (currentSection === section) {
                    var parts = line.split('=');
                    var currentKey = parts[0].trim();
                    if (currentKey === key) {
                        if (!found) {
                            contents.push(key + ' = ' + val);
                            found = true;
                        }
                    }
                    else {
                        contents.push(line);
                    }
                }
                else {
                    contents.push(line);
                }
            }
            if (!found) {
                if (currentSection !== section) {
                    contents.push('[' + section + ']');
                }
                contents.push(key + ' = ' + val);
            }
            fs.writeFile(_this.getConfigFile(), contents.join('\n'), function (err2) {
                if (err) {
                    if (callback)
                        callback(new Error('could not write to ~/.wakatime.cfg'));
                }
                else {
                    if (callback)
                        callback(null);
                }
            });
        });
    };
    Options.prototype.getConfigFile = function () {
        return this._configFile;
    };
    Options.prototype.getLogFile = function () {
        return this._logFile;
    };
    Options.prototype.getUserHomeDir = function () {
        return process.env[Dependencies.isWindows() ? 'USERPROFILE' : 'HOME'] || '';
    };
    Options.prototype.startsWith = function (outer, inner) {
        return outer.slice(0, inner.length) === inner;
    };
    Options.prototype.endsWith = function (outer, inner) {
        return (inner === '') || (outer.slice(-inner.length) === inner);
    };
    return Options;
})();
var Logger = (function () {
    function Logger(level) {
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        this.setLevel(level);
    }
    Logger.prototype.setLevel = function (level) {
        if (level in this.levels) {
            this._level = level;
        }
        else {
            throw new TypeError('Invalid level: ' + level);
        }
    };
    Logger.prototype.log = function (level, msg) {
        if (!(level in this.levels))
            throw new TypeError('Invalid level: ' + level);
        var current = this.levels[level];
        var cutoff = this.levels[this._level];
        if (current >= cutoff) {
            msg = '[WakaTime] [' + level.toUpperCase() + '] ' + msg;
            if (level == 'debug')
                console.log(msg);
            if (level == 'info')
                console.info(msg);
            if (level == 'warn')
                console.warn(msg);
            if (level == 'error')
                console.error(msg);
        }
    };
    Logger.prototype.debug = function (msg) {
        this.log('debug', msg);
    };
    Logger.prototype.info = function (msg) {
        this.log('info', msg);
    };
    Logger.prototype.warn = function (msg) {
        this.log('warn', msg);
    };
    Logger.prototype.error = function (msg) {
        this.log('error', msg);
    };
    return Logger;
})();
//# sourceMappingURL=extension.js.map