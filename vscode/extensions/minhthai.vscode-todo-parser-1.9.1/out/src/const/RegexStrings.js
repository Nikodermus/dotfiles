"use strict";
exports.RG_JAVA = "/\\*+([\\s\\S]*?)\\*/|//([^\\r\\n]+)";
exports.RG_PYTHON = "#\\s*(.+)";
exports.RG_ADA = "--\\s*(.+)";
exports.RG_FSHARP = "\\(\\*([\\s\\S]*?)\\*\\)|//([^\\r\\n]+)";
// For CSS, only /*..*/ is available and not allow nested comment
exports.RG_CSS = "/\\*([^*]*\\*+(?:[^/*][^*]*\\*+)*)/";
exports.RG_LATEX = "%\\s*(.+)";
exports.RG_VB = "(?:'|REM)\s*([^\\r\\n]+)";
exports.RG_TWIG = "{#([\\s\\S]*?)#}";
//# sourceMappingURL=RegexStrings.js.map