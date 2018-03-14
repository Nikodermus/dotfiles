"use strict";
var all_1 = require('../utils/all');
var RegexType_1 = require('./RegexType');
var all_2 = require('../const/all');
var map = new all_1.Dictionary();
var LanguageType = (function () {
    function LanguageType(name, regex) {
        this.name = name;
        this.regex = regex;
        map.setValue(name, this);
    }
    LanguageType.prototype.getRegex = function () {
        return this.regex;
    };
    LanguageType.fromId = function (id) {
        if (!id || !map.containsKey(id))
            return LanguageName.PLAINTEXT; // default is PlainText
        return map.getValue(id);
    };
    LanguageType.prototype.toString = function () {
        return this.name;
    };
    LanguageType.prototype.hashCode = function () {
        return all_1.hashCode(this.name);
    };
    return LanguageType;
}());
exports.LanguageType = LanguageType;
// 19 languages
var LanguageName = (function () {
    function LanguageName() {
    }
    LanguageName.ADA = new LanguageType("ada", new RegexType_1.RegexType(all_2.RG_ADA));
    LanguageName.C = new LanguageType("c", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.COFFEESCRIPT = new LanguageType("coffeescript", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.CPP = new LanguageType("cpp", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.CSHARP = new LanguageType("csharp", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.CSS = new LanguageType("css", new RegexType_1.RegexType(all_2.RG_CSS));
    LanguageName.FSHARP = new LanguageType("fsharp", new RegexType_1.RegexType(all_2.RG_FSHARP));
    LanguageName.GO = new LanguageType("go", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.HASKELL = new LanguageType("haskell", new RegexType_1.RegexType(all_2.RG_ADA));
    LanguageName.JAVA = new LanguageType("java", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.LATEX = new LanguageType("latex", new RegexType_1.RegexType(all_2.RG_LATEX));
    LanguageName.LESS = new LanguageType("less", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.LUA = new LanguageType("lua", new RegexType_1.RegexType(all_2.RG_ADA));
    LanguageName.MARKDOWN = new LanguageType("markdown", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.PERL = new LanguageType("perl", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.PHP = new LanguageType("php", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.PLAINTEXT = new LanguageType("plaintext", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.POWERSHELL = new LanguageType("powershell", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.PYTHON = new LanguageType("python", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.R = new LanguageType("r", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.RUBY = new LanguageType("ruby", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.SASS = new LanguageType("sass", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.TYPESCRIPT = new LanguageType("typescript", new RegexType_1.RegexType(all_2.RG_JAVA));
    LanguageName.ELIXIR = new LanguageType("elixir", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.BASH = new LanguageType("shellscript", new RegexType_1.RegexType(all_2.RG_PYTHON));
    LanguageName.VB = new LanguageType("vb", new RegexType_1.RegexType(all_2.RG_VB));
    LanguageName.TWIG = new LanguageType("twig", new RegexType_1.RegexType(all_2.RG_TWIG));
    LanguageName.MATLAB = new LanguageType("matlab", new RegexType_1.RegexType(all_2.RG_LATEX));
    return LanguageName;
}());
exports.LanguageName = LanguageName;
//# sourceMappingURL=LanguageType.js.map