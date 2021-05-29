"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const crypto_1 = require("../crypto");
class Profile {
    constructor(client) {
        this.client = client;
    }
    updateAvatar(image) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.api.request({
                    "+a": crypto_1.base64.encrypt(image),
                    "a": "up",
                    "i": "Yx9sLEGlxg",
                });
                return Promise.resolve();
            }
            catch (error) {
                return Promise.reject(new Error(error));
            }
        });
    }
    getAvatar() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { av: avatarBase64 } = yield this.client.api.request({
                    a: "uga",
                    u: this.client.state.USER_ID || "aMbaJ92YWfU",
                    ua: "+a",
                    v: 1,
                });
                return Promise.resolve(crypto_1.base64.decrypt(avatarBase64));
            }
            catch (error) {
                return Promise.reject(new Error(error));
            }
        });
    }
}
exports.Profile = Profile;
