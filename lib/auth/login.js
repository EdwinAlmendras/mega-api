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
var api_1 = __importDefault(require("../api"));
var crypto_1 = require("../crypto");
var user_1 = __importDefault(require("../core/user"));
function login(_a, options) {
    var _this = this;
    var email = _a.email, password = _a.password;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var aes, userHash, api, _a, v, s, deriveKey, params, _b, k, privk, csid, MASTER_KEY, KEY_AES, t, RSA_PRIVATE_KEY, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    api = new api_1.default(options);
                    return [4 /*yield*/, api.request({ a: "us0", user: email })];
                case 1:
                    _a = _c.sent(), v = _a.v, s = _a.s;
                    // V1 ACCOUNT HADLE LOGIN
                    if (v === 1) {
                        aes = new crypto_1.AES(crypto_1.prepareKey(Buffer.from(password, "utf8")));
                        userHash = crypto_1.e64(aes.stringhash(Buffer.from(email)));
                    }
                    // V2 ACCOUNT HADLE LOGIN
                    else if (v === 2) {
                        deriveKey = crypto_1.prepareKeyV2(Buffer.from(password), s);
                        aes = new crypto_1.AES(deriveKey.slice(0, 16));
                        userHash = crypto_1.e64(deriveKey.slice(16));
                    }
                    params = { a: "us", user: email, uh: userHash };
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, api.request(params)];
                case 3:
                    _b = _c.sent(), k = _b.k, privk = _b.privk, csid = _b.csid;
                    MASTER_KEY = aes.decryptECB(crypto_1.formatKey(k));
                    KEY_AES = new crypto_1.AES(MASTER_KEY);
                    t = crypto_1.formatKey(csid);
                    RSA_PRIVATE_KEY = crypto_1.cryptoDecodePrivKey(KEY_AES.decryptECB(crypto_1.formatKey(privk)));
                    api.sid = crypto_1.e64(crypto_1.cryptoRsaDecrypt(t, RSA_PRIVATE_KEY).slice(0, 43));
                    resolve(new user_1.default({ api: api, KEY_AES: KEY_AES, RSA_PRIVATE_KEY: RSA_PRIVATE_KEY, MASTER_KEY: MASTER_KEY }));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    reject(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
}
exports.default = login;
