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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var querystring_1 = require("querystring");
var axios_1 = __importDefault(require("axios"));
var crypto_1 = require("../crypto");
var events_1 = require("events");
var crypto_2 = require("crypto");
var errors_1 = require("./errors");
var MAX_RETRIES = 7;
var Api = /** @class */ (function (_super) {
    __extends(Api, _super);
    function Api(options) {
        var _this = _super.call(this) || this;
        _this.counterId = Math.random().toString().substr(2, 10);
        _this.gateway = "https://eu.api.mega.co.nz/";
        if (!options) {
            _this.keepalive = true;
            _this.axios = axios_1.default;
        }
        else {
            _this.keepalive = options.keepalive;
            _this.axios = axios_1.default;
        }
        return _this;
    }
    Api.prototype.customRequest = function (data, params, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var qs, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        qs = __assign({ id: (this.counterId++).toString() }, params);
                        this.sid && (qs.sid = this.sid);
                        return [4 /*yield*/, this.axios.post(this.gateway + "cs?" + querystring_1.stringify(qs), [data], config)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data[0]];
                }
            });
        });
    };
    Api.prototype.request = function (json, retryno, customParams, ignoreError) {
        var _this = this;
        if (retryno === void 0) { retryno = 0; }
        if (customParams === void 0) { customParams = {}; }
        if (ignoreError === void 0) { ignoreError = false; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = { id: (this.counterId++).toString() };
                        this.sid && (params.sid = this.sid);
                        return [4 /*yield*/, this.axios.post(this.gateway + "cs?" + querystring_1.stringify(params), [json])];
                    case 1:
                        response = (_a.sent()).data[0];
                        if (response === 0)
                            resolve(null);
                        if (typeof response === "undefined" && !ignoreError) {
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                var response;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.request(json, retryno + 1)];
                                        case 1:
                                            response = _a.sent();
                                            resolve(response);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, Math.pow(2, retryno + 1) * 1e3);
                        }
                        if (!(typeof response === "number" && response < 0 && !ignoreError)) return [3 /*break*/, 2];
                        if (response === -3) {
                            if (retryno < MAX_RETRIES) {
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var response;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.request(json, retryno + 1)];
                                            case 1:
                                                response = _a.sent();
                                                resolve(response);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, Math.pow(2, retryno + 1) * 1e3);
                            }
                        }
                        reject(errors_1.ERRORS[-response]);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(this.keepalive && response && response.sn)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.pull(response.sn)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        resolve(response);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Api.prototype.pull = function (sn, retryno) {
        var _this = this;
        if (retryno === void 0) { retryno = 0; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.axios.post(this.gateway + "sc?" + querystring_1.stringify({ sn: sn, sid: this.sid }), "sc?" + querystring_1.stringify({ sn: sn }))];
                    case 1:
                        response = (_a.sent()).data;
                        if (typeof response === "number" && response < 0) {
                            if (response === -3) {
                                if (retryno < MAX_RETRIES) {
                                    return [2 /*return*/, setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, this.pull(sn, retryno + 1)];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }, Math.pow(2, retryno + 1) * 1e3)];
                                }
                            }
                            reject(errors_1.ERRORS[-response]);
                        }
                        if (response.w) {
                            this.wait(response.w, sn);
                        }
                        else if (response.sn) {
                            if (response.a) {
                                this.emit("sc", response.a);
                            }
                            this.pull(response.sn);
                        }
                        resolve(null);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Api.prototype.wait = function (uri, sn) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.axios.post(uri)];
                    case 1:
                        _a.sent();
                        this.sn = undefined;
                        return [4 /*yield*/, this.pull(sn)];
                    case 2:
                        _a.sent();
                        resolve(null);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Api.prototype.anonSession = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var masterkey, passwordKey, ssc, aes, user, _a, tsid, k, ph, n, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        masterkey = crypto_2.randomBytes(16);
                        this.masterKey = masterkey;
                        passwordKey = crypto_2.randomBytes(16);
                        ssc = crypto_2.randomBytes(16);
                        aes = new crypto_1.AES(passwordKey);
                        return [4 /*yield*/, this.request({
                                a: "up",
                                k: crypto_1.e64(aes.encryptECB(masterkey)),
                                ts: crypto_1.e64(Buffer.concat([ssc, new crypto_1.AES(this.masterKey).encryptECB(ssc)])),
                            })];
                    case 1:
                        user = _b.sent();
                        return [4 /*yield*/, this.request({ a: "us", user: user })];
                    case 2:
                        _a = _b.sent(), tsid = _a.tsid, k = _a.k;
                        this.masterKey = aes.decryptECB(crypto_1.d64(k));
                        this.sid = tsid;
                        return [4 /*yield*/, this.request({ a: "ug" })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.request({ a: "wpdf" })];
                    case 4:
                        ph = (_b.sent()).ph;
                        return [4 /*yield*/, this.request({ a: "g", p: ph })];
                    case 5:
                        n = _b.sent();
                        resolve(null);
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _b.sent();
                        reject(err_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
    };
    Api.prototype.close = function () {
        if (this.sn)
            this.sn.abort();
    };
    return Api;
}(events_1.EventEmitter));
exports.default = Api;
