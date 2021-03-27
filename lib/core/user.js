"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
var promise_fs_1 = require("promise-fs");
var crypto_1 = require("../crypto");
var events_1 = require("events");
//import { Schema$File, } from "../types";
var url_1 = require("url");
var email_1 = require("../utils/email");
var cheerio_1 = __importDefault(require("cheerio"));
var file_1 = __importDefault(require("../file"));
var crypto_2 = require("crypto");
/*


NOT IMPLEMENTDE YET


  async export() {
     let files = this.files.list(this.);
     let folder = await this.files.create({
       name: "ULTRAMK",
       parent: this.cloudDrive,
       folder: true,
     });
     for await (let file of files) {
       await this.files.move(file.nodeId, folder);
     }
     let link = await this.files.link(folder);
     return link
   }

   async copy(user: User) {
     let link = await this.files.export({nodeId: this.cloudDrive});
     await user.files.import(link, user.cloudDrive);
   }

   async backup() {
     let link = await this.export(this.cloudDrive);
     let user = await register();
     let { email, password } = user;
     await user.files.import(link);
     await saveCredentials({ email, password, title: "backup generic" });
   }




*/
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User(context) {
        var _this = _super.call(this) || this;
        Object.assign(_this, context);
        return _this;
    }
    User.prototype.loadUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.request({ a: 'ug' })];
                    case 1:
                        response = _a.sent();
                        this.name = response.name;
                        this.user = response.u;
                        return [2 /*return*/];
                }
            });
        });
    };
    /* RETURN FILES OBJECT */
    User.prototype.getFiles = function () {
        this.files = new file_1.default(this);
        return this.files;
    };
    User.prototype.saveSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promise_fs_1.writeFile("session.json", JSON.stringify({
                            key: this.MASTER_KEY,
                            sid: this.api.sid,
                        }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    User.prototype.account = function () {
        return new Account(this.api, this.email);
    };
    return User;
}(events_1.EventEmitter));
exports.default = User;
var Account = /** @class */ (function () {
    function Account(api, email) {
        this.api = api;
        this.email = email;
    }
    Account.prototype.info = function () {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var response, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.request({
                            a: "uq",
                            strg: 1,
                            xfer: 1,
                            pro: 1,
                        })];
                    case 1:
                        response = _a.sent();
                        account = {};
                        account.type = response.utype;
                        account.spaceUsed = response.cstrg;
                        account.spaceTotal = response.mstrg;
                        account.downloadBandwidthTotal = response.mxfer || Math.pow(1024, 5) * 10;
                        account.downloadBandwidthUsed = response.caxfer || 0;
                        account.sharedBandwidthUsed = response.csxfer || 0;
                        account.sharedBandwidthLimit = response.srvratio;
                        resolve(account);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Account.prototype.changeEmail = function (_a) {
        var email = _a.email;
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        params = {
                            a: 'se',
                            aa: 'a',
                            e: email, // The new email address
                        };
                        return [4 /*yield*/, this.api.request(params)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Account.prototype.changePassword = function (_a) {
        var password = _a.password;
        return __awaiter(this, void 0, void 0, function () {
            var keys, requestParams;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        keys = crypto_1.deriveKeys(password, crypto_2.randomBytes(32));
                        requestParams = {
                            a: 'up',
                            k: crypto_1.e64(keys.k),
                            uh: crypto_1.e64(keys.hak),
                            crv: crypto_1.e64(keys.crv)
                        };
                        return [4 /*yield*/, this.api.request(requestParams)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Account.prototype.cancel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var email, id, mail, $, link, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    /* RESPONSE SHOULD BE 0 */
                    return [4 /*yield*/, this.api.request({ a: 'erm', m: this.email, t: 21 })
                        /* THIS WILL BE RECEIVED EMAIL */
                    ];
                    case 1:
                        /* RESPONSE SHOULD BE 0 */
                        _a.sent();
                        if (!this.email.includes("temporary-mail")) return [3 /*break*/, 4];
                        email = new email_1.TemporaryEmail({ reload: false, email: this.email });
                        return [4 /*yield*/, email.fetch()];
                    case 2:
                        id = (_a.sent())[0].id;
                        return [4 /*yield*/, email.get(id)];
                    case 3:
                        mail = _a.sent();
                        $ = cheerio_1.default.load(mail.body.html);
                        link = $("a").eq(2).attr("href");
                        hash = url_1.parse(link).hash;
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Account;
}());
exports.Account = Account;
