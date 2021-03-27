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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var properties_1 = __importDefault(require("./properties"));
var axios_1 = __importDefault(require("axios"));
var stream_1 = require("stream");
var util_1 = require("util");
var pump = util_1.promisify(require('pump'));
var crypto_2 = require("../crypto");
var url_1 = require("url");
var uuid_1 = require("uuid");
var lodash_1 = require("lodash");
var KEY_CACHE = {};
var Files = /** @class */ (function (_super) {
    __extends(Files, _super);
    function Files(context) {
        var _this = _super.call(this) || this;
        Object.assign(_this, context);
        return _this;
    }
    Files.prototype.fetch = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _a, ok, f, f_1, f_1_1, file, e_1_1;
            var _this = this;
            var e_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.data = [];
                        return [4 /*yield*/, this.api.request({ a: "f", c: 1 })];
                    case 1:
                        _a = _c.sent(), ok = _a.ok, f = _a.f;
                        this.shareKeys = ok.reduce(function (shares, share) {
                            var handler = share.h;
                            var auth = _this.KEY_AES.encryptECB(Buffer.from(handler + handler, "utf8"));
                            console.log(share, auth, handler);
                            if (crypto_2.constantTimeCompare(crypto_2.formatKey(share.ha), auth)) {
                                shares[handler] = _this.KEY_AES.decryptECB(crypto_2.formatKey(share.k));
                            }
                            return shares;
                        }, {});
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 7, 8, 13]);
                        f_1 = __asyncValues(f);
                        _c.label = 3;
                    case 3: return [4 /*yield*/, f_1.next()];
                    case 4:
                        if (!(f_1_1 = _c.sent(), !f_1_1.done)) return [3 /*break*/, 6];
                        file = f_1_1.value;
                        this.compose(file);
                        _c.label = 5;
                    case 5: return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _c.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _c.trys.push([8, , 11, 12]);
                        if (!(f_1_1 && !f_1_1.done && (_b = f_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _b.call(f_1)];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        resolve(this.data);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Files.prototype.compose = function (f) {
        if (!this.data.find(function (e) { return e.nodeId === f.h; })) {
            var file = this.parse(f);
            switch (f.t) {
                case 2:
                    this.ID_ROOT_FOLDER = f["h"];
                    file.name = "Cloud Drive";
                    break;
                case 3:
                    this.ID_TRASH = f["h"];
                    file.name = "Rubbish Bin";
                    break;
                case 4:
                    this.ID_INBOX = f["h"];
                    file.name = "Inbox";
                    break;
                default:
                    break;
            }
            this.data.push(file);
        }
        return this.data.find(function (e) { return e.nodeId === f.h; });
    };
    Files.prototype.parse = function (f) {
        var metadata = {
            nodeId: f.h,
            createdTime: f.ts,
            type: f.t,
            isDir: !!f.t,
            parent: f.p,
        };
        /* IF FILE HAS KEY */
        if (f.k) {
            var KEY_AES = this.KEY_AES;
            var idKeyPairs = f.k.split('/');
            for (var _i = 0, idKeyPairs_1 = idKeyPairs; _i < idKeyPairs_1.length; _i++) {
                var idKeyPair = idKeyPairs_1[_i];
                var id = idKeyPair.split(':')[0];
                if (id === this.user) {
                    f.k = idKeyPair;
                    break;
                }
                var shareKey = this.shareKeys[id];
                if (shareKey) {
                    f.k = idKeyPair;
                    KEY_AES = KEY_CACHE[id];
                    if (!KEY_AES) {
                        KEY_AES = KEY_CACHE[id] = new crypto_2.AES(shareKey);
                    }
                    break;
                }
            }
            Object.assign(metadata, this.loadMetadata(f, KEY_AES));
            return metadata;
        }
        return metadata;
    };
    Files.prototype.loadMetadata = function (file, aes) {
        if (aes === void 0) { aes = null; }
        /* HANDLING FILE INFO */
        var metadata = {
            size: file.s || 0,
            createdTime: file.ts || 0,
            type: file.t,
            isDir: !!file.t,
            owner: file.u,
        };
        var parts = file.k.split(":");
        var key = crypto_2.formatKey(parts[parts.length - 1]);
        metadata.key = aes ? aes.decryptECB(key) : this.KEY_AES.decryptECB(key);
        if (file.a) {
            var properties = properties_1.default.decrypt(file.a, key);
            metadata = __assign(__assign({}, metadata), { properties: properties });
        }
        return metadata;
    };
    // OK
    Files.prototype.get = function (_a, options) {
        var _this = this;
        var nodeId = _a.nodeId, name = _a.name, stream = _a.stream, parent = _a.parent;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var file, resp, stream_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (nodeId) {
                            file = searchByNode(this.data, nodeId);
                        }
                        else if (name) {
                            file = parent
                                ? searchByName(this.data.filter(function (e) { return e.parent === parent; }), name)
                                : searchByName(this.data, name);
                        }
                        else {
                            file = searchByNode(this.data, this.ID_ROOT_FOLDER);
                        }
                        if (!stream) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.api.request({
                                a: 'g',
                                g: 1,
                                n: file.nodeId,
                                ssl: (process.env.IS_BROWSER_BUILD || options.ssl) ? 2 : 0
                            })];
                    case 1:
                        resp = _b.sent();
                        stream_2 = new stream_1.PassThrough();
                        _a = pump;
                        return [4 /*yield*/, axios_1.default.get(resp.g, { responseType: "stream" })];
                    case 2: return [4 /*yield*/, _a.apply(void 0, [_b.sent(), crypto_2.createDecrypterStream(file.key), stream_2])];
                    case 3:
                        _b.sent();
                        resolve(stream_2);
                        _b.label = 4;
                    case 4:
                        resolve(file);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    // pOK
    Files.prototype.list = function (_a) {
        var folderId = _a.folderId, onlyFolders = _a.onlyFolders;
        function filterReducer(file) {
            if (onlyFolders) {
                if (file.parent === folderId && file.isDir)
                    return true;
            }
            else {
                return file.parent === folderId;
            }
        }
        return this.data.filter(filterReducer);
    };
    // OK
    Files.prototype.dir = function (options) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var name, parent, parentName, properties, t, _a, key, node, response, file;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        name = options.name, parent = options.parent, parentName = options.parentName, properties = options.properties;
                        _a = parent;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.get({ name: parentName })];
                    case 1:
                        _a = (_b.sent()).parent;
                        _b.label = 2;
                    case 2:
                        t = _a || this.ID_ROOT_FOLDER;
                        key = crypto_1.randomBytes(16);
                        node = [{
                                h: "xxxxxxxx",
                                t: 1,
                                a: crypto_2.e64(crypto_2.getCipher(key).encryptCBC(properties_1.default.pack(__assign({ n: name }, properties)))),
                                k: crypto_2.e64(this.KEY_AES.encryptECB(key)),
                            }];
                        return [4 /*yield*/, this.api.request({
                                a: "p",
                                t: t,
                                n: node,
                            })];
                    case 3:
                        response = _b.sent();
                        file = this.compose(response.f[0]);
                        resolve(file);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Files.prototype.rdir = function (_a) {
        var _this = this;
        var folderPath = _a.folderPath, parent = _a.parent;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var dirs, dirs_1, dirs_1_1, dirname, nodeId, folder, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dirs = folderPath.split("/");
                        if (!parent)
                            parent = this.ID_ROOT_FOLDER;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 8, 9, 14]);
                        dirs_1 = __asyncValues(dirs);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, dirs_1.next()];
                    case 3:
                        if (!(dirs_1_1 = _b.sent(), !dirs_1_1.done)) return [3 /*break*/, 7];
                        dirname = dirs_1_1.value;
                        return [4 /*yield*/, this.exists(dirname)];
                    case 4:
                        nodeId = _b.sent();
                        if (nodeId) {
                            parent = nodeId;
                            return [3 /*break*/, 6];
                        }
                        return [4 /*yield*/, this.dir({ name: dirname, parent: parent })];
                    case 5:
                        folder = _b.sent();
                        parent = folder.nodeId;
                        _b.label = 6;
                    case 6: return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 14];
                    case 8:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 14];
                    case 9:
                        _b.trys.push([9, , 12, 13]);
                        if (!(dirs_1_1 && !dirs_1_1.done && (_a = dirs_1.return))) return [3 /*break*/, 11];
                        return [4 /*yield*/, _a.call(dirs_1)];
                    case 10:
                        _b.sent();
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 13: return [7 /*endfinally*/];
                    case 14:
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    // OK
    Files.prototype.search = function (text) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var files, filesId, _a, name, nodeId, timestamp, key, downloadId;
            return __generator(this, function (_b) {
                files = [];
                for (filesId in this.data) {
                    _a = this.data[filesId], name = _a.name, nodeId = _a.nodeId, timestamp = _a.timestamp, key = _a.key, downloadId = _a.downloadId;
                    if (!name)
                        continue;
                    if (name.includes(text)) {
                        files.push({
                            name: name,
                            nodeId: nodeId,
                            createdAt: timestamp,
                            key: key,
                            dl: downloadId || false,
                        });
                    }
                }
                if (files.length === 0)
                    resolve(false);
                resolve(files);
                return [2 /*return*/];
            });
        }); });
    };
    //OK
    Files.prototype.exists = function (name) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var filesId;
            return __generator(this, function (_a) {
                for (filesId in this.data) {
                    if (!this.data[filesId].name)
                        continue;
                    if (this.data[filesId].name.includes(name)) {
                        resolve(this.data[filesId].nodeId);
                    }
                }
                resolve(false);
                return [2 /*return*/];
            });
        }); });
    };
    //ok
    Files.prototype.isDir = function (nodeId) {
        var isDir = this.data.find(function (e) { return e.nodeId === nodeId; }).isDir;
        return isDir;
    };
    //OK
    Files.prototype.delete = function (_a) {
        var _this = this;
        var nodeId = _a.nodeId, permanent = _a.permanent;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!permanent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.api.request({ a: "d", n: nodeId })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.move({ nodeId: nodeId, target: this.ID_TRASH })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        reject(err_1);
                        return [3 /*break*/, 6];
                    case 6:
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    //OK
    Files.prototype.move = function (_a) {
        var _this = this;
        var nodeId = _a.nodeId, target = _a.target;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.api.request({ a: "m", n: nodeId, t: target })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        reject(err_2);
                        return [3 /*break*/, 3];
                    case 3:
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    //OK
    Files.prototype.update = function (_a) {
        var _this = this;
        var name = _a.name, nodeId = _a.nodeId, properties = _a.properties;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var file, tags, newProperties, unparsed, packed, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get({ name: name, nodeId: nodeId })];
                    case 1:
                        file = _a.sent();
                        tags = properties.tags;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        // uniquify array tags if exists
                        tags && (properties.tags = lodash_1.uniq(file.properties.tags.concat(tags)));
                        newProperties = Object.assign(file.properties, properties);
                        unparsed = properties_1.default.unparse(newProperties);
                        packed = properties_1.default.pack(unparsed);
                        crypto_2.getCipher(file.key).encryptCBC(packed);
                        // making request
                        return [4 /*yield*/, this.api.request({ a: "a", n: file.nodeId, at: crypto_2.e64(packed) })];
                    case 3:
                        // making request
                        _a.sent();
                        resolve();
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _a.sent();
                        reject(err_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    Files.prototype.shortcut = function (_a, _b) {
        var _this = this;
        var name = _a.name, nodeId = _a.nodeId;
        var parent = _b.parent, props = _b.props;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var fileSource, uid, regex, key, properties, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get({ name: name, nodeId: nodeId })];
                    case 1:
                        fileSource = _a.sent();
                        return [4 /*yield*/, this.get({ name: props })];
                    case 2:
                        _a.sent();
                        uid = fileSource.properties.uid;
                        regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
                        if (!(!(regex.test(uid)) || !uid)) return [3 /*break*/, 4];
                        console.log("generating new uid, matched is not valid or dont exists");
                        uid = uuid_1.v4();
                        this.emit("action", "ADDING UID TO FILE SOURCE");
                        return [4 /*yield*/, this.update({ nodeId: fileSource.nodeId, properties: { uid: uid } })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        key = crypto_1.randomBytes(16);
                        properties = __assign({ n: props.name || fileSource.name, target: { uid: uid } }, props);
                        this.emit("action", "SAVING UID IN TARGET SHORTCUT");
                        return [4 /*yield*/, this.api.request({
                                a: "p",
                                t: parent || this.ID_ROOT_FOLDER,
                                n: [
                                    {
                                        h: "xxxxxxxx",
                                        t: 1,
                                        a: crypto_2.e64(crypto_2.getCipher(key).encryptCBC(properties_1.default.pack(properties))),
                                        k: crypto_2.e64(this.KEY_AES.encryptECB(key)),
                                    },
                                ],
                            })];
                    case 5:
                        resp = _a.sent();
                        this.compose(resp.f[0]);
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Files.prototype.find = function (_a) {
        var path = _a.path;
    };
    //OK
    Files.prototype.export = function (_a) {
        var _this = this;
        var name = _a.name, nodeId = _a.nodeId;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var shareKey, file, cr, params, id, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get({ name: name, nodeId: nodeId })];
                    case 1:
                        file = _a.sent();
                        if (!file.isDir) return [3 /*break*/, 3];
                        shareKey = crypto_1.randomBytes(16);
                        this.shareKeys[file.nodeId] = shareKey;
                        cr = makeCryptoRequest(this, file);
                        params = {
                            a: 's2',
                            n: file.nodeId,
                            s: [{ u: 'EXP', r: 0 }],
                            ok: crypto_2.e64(this.KEY_AES.encryptECB(Buffer.from(shareKey))),
                            ha: crypto_2.e64(this.KEY_AES.encryptECB(Buffer.from(file.nodeId + file.nodeId))),
                            cr: cr
                        };
                        return [4 /*yield*/, this.api.request(params)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.api.request({ a: 'l', n: file.nodeId })];
                    case 4:
                        id = _a.sent();
                        url = "https://mega.nz/" + (file.isDir ? 'folder' : 'file') + "/" + id + "#" + crypto_2.e64(shareKey || file.key);
                        console.log(url);
                        resolve(url);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Files.prototype.unexport = function (_a) {
        var _this = this;
        var name = _a.name, nodeId = _a.nodeId;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        }); });
    };
    Files.prototype.import = function (_a) {
        var nodeId = _a.nodeId, url = _a.url;
        return __awaiter(this, void 0, void 0, function () {
            function prepareRequest(source, ph) {
                if (ph === void 0) { ph = false; }
                var cipher = crypto_2.getCipher(source.key);
                var packedProperties = properties_1.default.pack(source.properties);
                var publicHandle = source.downloadId;
                var req = {
                    h: Array.isArray(publicHandle) ? publicHandle[1] : publicHandle,
                    t: source.isDir ? 1 : 0,
                    a: crypto_2.e64(cipher.encryptCBC(packedProperties)),
                    k: crypto_2.e64(self.KEY_AES.encryptECB(source.key))
                };
                ph && (req.h = req.ph);
                return req;
            }
            var self, urlData, source, request;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        self = this;
                        urlData = Url.parse(url);
                        return [4 /*yield*/, this.loadAttributes(urlData)];
                    case 1:
                        source = _b.sent();
                        console.log(urlData);
                        request = urlData.isDir ? {
                            a: 'p',
                            t: nodeId || this.ID_ROOT_FOLDER,
                            n: source.map(function (file) { return prepareRequest(file); }),
                            sm: 1,
                            v: 3
                        } : {
                            a: 'p',
                            t: nodeId || this.ID_ROOT_FOLDER,
                            n: prepareRequest(source, true)
                        };
                        if (this.shareKeys && this.shareKeys.length) {
                            request.cr = makeCryptoRequest(this, source[0]);
                        }
                        console.log(request);
                        return [4 /*yield*/, this.api.request(request)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Files.prototype.loadAttributes = function (_a) {
        var isDir = _a.isDir, downloadId = _a.downloadId, file = _a.file, key = _a.key;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var req, response, nodes, rootFolder, aes, folder, filesSource, _i, nodes_1, file_1, childFile, properties;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    req = isDir ? {
                                        a: 'f',
                                        c: 1,
                                        ca: 1,
                                        r: 1,
                                    } : {
                                        a: 'g',
                                        p: downloadId
                                    };
                                    return [4 /*yield*/, this.api.customRequest(req, { n: downloadId })];
                                case 1:
                                    response = _a.sent();
                                    if (!isDir) return [3 /*break*/, 3];
                                    nodes = response.f;
                                    rootFolder = nodes.find(function (node) { return node.k && node.h === node.k.split(':')[0]; });
                                    aes = key ? new crypto_2.AES(key) : null;
                                    return [4 /*yield*/, properties_1.default.loadMetadata(rootFolder, aes)];
                                case 2:
                                    folder = _a.sent();
                                    filesSource = [__assign(__assign({}, folder), { downloadId: downloadId })];
                                    for (_i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                                        file_1 = nodes_1[_i];
                                        if (file_1 === rootFolder)
                                            continue;
                                        childFile = properties_1.default.loadMetadata(file_1, aes);
                                        childFile.downloadId = downloadId;
                                        filesSource.push(childFile);
                                    }
                                    resolve(filesSource);
                                    return [3 /*break*/, 4];
                                case 3:
                                    properties = properties_1.default.decrypt(response.at, key);
                                    resolve({
                                        size: response.s,
                                        key: key,
                                        isDir: false,
                                        properties: properties
                                    });
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    return Files;
}(stream_1.EventEmitter));
exports.default = Files;
function makeCryptoRequest(files, sources, shares) {
    function selfAndChildren(file, files) {
        return [file].concat(files.list(file.nodeId).map(function (e) { return e.isDir ? selfAndChildren(e, files) : e; })).reduce(function (arr, el) { return arr.concat(el); }, []);
    }
    function getShares(shareKeys, node) {
        var handle = node.nodeId;
        var parent = node.parent;
        var shares = [];
        if (shareKeys[handle]) {
            shares.push(handle);
        }
        return parent
            ? shares.concat(getShares(shareKeys, parent))
            : shares;
    }
    var shareKeys = files.shareKeys;
    if (!Array.isArray(sources)) {
        sources = selfAndChildren(sources, files);
    }
    console.log(files.shareKeys);
    if (!shares) {
        shares = sources
            .map(function (source) { return getShares(shareKeys, source); })
            .reduce(function (arr, el) { return arr.concat(el); })
            .filter(function (el, index, arr) { return index === arr.indexOf(el); });
    }
    var cryptoRequest = [
        shares,
        sources.map(function (node) { return node.nodeId; }),
        []
    ];
    // TODO: optimize - keep track of pre-existing/sent keys, only send new ones
    for (var i = shares.length; i--;) {
        var aes = new crypto_2.AES(shareKeys[shares[i]]);
        console.log(shareKeys[shares[i]]);
        for (var j = sources.length; j--;) {
            console.log(sources[j]);
            var fileKey = Buffer.from(sources[j].key);
            if (fileKey && (fileKey.length === 32 || fileKey.length === 16)) {
                cryptoRequest[2].push(i, j, crypto_2.e64(aes.encryptECB(fileKey)));
            }
        }
    }
    return cryptoRequest;
}
var Url = /** @class */ (function () {
    function Url() {
    }
    Url.parse = function (url) {
        url = url_1.parse(url);
        if (url.path.match(/\/(file|folder)\//) !== null) {
            // new format
            var _a = url.hash.substr(1).split("/file/"), key = _a[0], file = _a[1];
            var downloadId = url.path.substring(url.path.lastIndexOf("/") + 1, url.path.length + 1);
            var isDir = url.path.indexOf("/folder/") >= 0;
            console.log(key, "from static url");
            return { key: crypto_2.d64(key), file: file, downloadId: downloadId, isDir: isDir };
        }
        else {
            // old format
            var _b = url.hash.split("!"), isDir = _b[0], downloadId = _b[1], key = _b[2], file = _b[3];
            return { key: key, file: file, downloadId: downloadId, isDir: isDir };
        }
    };
    return Url;
}());
function searchByName(data, name) {
    return data.find(function (e) { var _a; return name === ((_a = e === null || e === void 0 ? void 0 : e.properties) === null || _a === void 0 ? void 0 : _a.name); });
}
function searchByNode(data, nodeId) {
    return data.find(function (e) { return nodeId === e.nodeId; });
}
var DarkFiles = /** @class */ (function (_super) {
    __extends(DarkFiles, _super);
    function DarkFiles(context) {
        return _super.call(this, context) || this;
    }
    return DarkFiles;
}(Files));
