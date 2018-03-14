"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const inversify_1 = require("inversify");
const stateStore_1 = require("../../application/types/stateStore");
const types_1 = require("../../ioc/types");
const types_2 = require("../repository/types");
const base_1 = require("./base");
// tslint:disable-next-line:no-require-imports no-var-requires
const { URL } = require('url');
let GithubAvatarProvider = class GithubAvatarProvider extends base_1.BaseAvatarProvider {
    constructor(serviceContainer) {
        super(serviceContainer, types_2.GitOriginType.github);
        const stateStoreFactory = this.serviceContainer.get(stateStore_1.IStateStoreFactory);
        this.stateStore = stateStoreFactory.createStore();
    }
    get proxy() {
        let proxy;
        if (this.httpProxy.length > 0) {
            const proxyUri = new URL(this.httpProxy);
            proxy = { host: proxyUri.hostname, port: proxyUri.port };
        }
        return proxy;
    }
    getAvatarImplementation(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchedLogins = yield this.findMatchingLogins(user);
            if (!Array.isArray(matchedLogins)) {
                return;
            }
            const userInfo = yield this.findLoginWithSameNameAndEmail(user, matchedLogins);
            if (!userInfo) {
                return;
            }
            return {
                url: userInfo.url,
                avatarUrl: userInfo.avatar_url,
                name: user.name,
                email: user.email
            };
        });
    }
    getUserByLogin(loginName) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `GitHub:User:LoginName${loginName}`;
            if (this.stateStore.has(key)) {
                const cachedInfo = yield this.stateStore.get(key);
                if (cachedInfo) {
                    return cachedInfo;
                }
            }
            const proxy = this.proxy;
            const info = yield axios_1.default.get(`https://api.github.com/users/${encodeURIComponent(loginName)}`, { proxy })
                .then((result) => {
                if (!result.data || !result.data.name) {
                    return;
                }
                else {
                    return result.data;
                }
            });
            yield this.stateStore.set(key, info);
            return info;
        });
    }
    findLoginWithSameNameAndEmail(user, logins) {
        return __awaiter(this, void 0, void 0, function* () {
            const matchedUsers = [];
            for (const loginName of logins) {
                const userInfo = yield this.getUserByLogin(loginName);
                if (userInfo && userInfo.name === user.name) {
                    if (userInfo.email && user.email && userInfo.email !== user.email) {
                        continue;
                    }
                    matchedUsers.push(userInfo);
                }
            }
            // Return only if there's exactly one match
            return matchedUsers.length === 0 ? matchedUsers[0] : undefined;
        });
    }
    searchLogins(cacheKey, searchValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stateStore.has(cacheKey)) {
                const cachedInfo = yield this.stateStore.get(cacheKey);
                if (cachedInfo) {
                    return cachedInfo;
                }
            }
            const proxy = this.proxy;
            const searchResult = yield axios_1.default.get(`https://api.github.com/search/users?q=${encodeURIComponent(searchValue)}`, { proxy })
                .then((result) => {
                if (!result.data || !Array.isArray(result.data.items) || result.data.items.length === 0) {
                    return undefined;
                }
                else {
                    return result.data.items.map(item => item.login);
                }
            });
            yield this.stateStore.set(cacheKey, searchResult);
            return searchResult;
        });
    }
    findMatchingLogins(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchByName = yield this.searchLogins(`GitHub:Users:Search:Name${user.name}`, user.name);
            if (searchByName) {
                return searchByName;
            }
            if (!user.email) {
                return;
            }
            return this.searchLogins(`GitHub:Users:Search:Email${user.email}`, user.email);
        });
    }
};
GithubAvatarProvider = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.IServiceContainer)),
    __metadata("design:paramtypes", [Object])
], GithubAvatarProvider);
exports.GithubAvatarProvider = GithubAvatarProvider;
//# sourceMappingURL=github.js.map