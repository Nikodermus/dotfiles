"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
let ThemeService = class ThemeService {
    getThemeDetails(theme, backgroundColor, color) {
        const editorConfig = vscode_1.workspace.getConfiguration('editor');
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const fontFamily = editorConfig.get('fontFamily').split('\'').join('').split('"').join('');
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const fontSize = `${editorConfig.get('fontSize')}px`;
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const fontWeight = editorConfig.get('fontWeight');
        return {
            theme: theme,
            backgroundColor: backgroundColor,
            color: color,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight
        };
    }
};
ThemeService = __decorate([
    inversify_1.injectable()
], ThemeService);
exports.ThemeService = ThemeService;
//# sourceMappingURL=themeService.js.map