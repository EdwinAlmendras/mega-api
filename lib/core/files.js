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
exports.Uploader = void 0;
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable no-async-promise-executor */
const crypto_1 = require("crypto");
const properties_1 = __importDefault(require("./properties"));
const axios_1 = __importDefault(require("axios"));
const stream_1 = require("stream");
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
const events_1 = __importDefault(require("events"));
const KEY_CACHE = {};
const crypto_2 = require("../crypto");
/**
 * Class uploader - return instance upload - for upload any into folder
 */
class Uploader {
    // eslint-disable-next-line require-jsdoc
    constructor(client) {
        this.client = client;
    }
}
exports.Uploader = Uploader;
/**
 * Main class files for every purpose file
 */
class Files extends events_1.default {
    constructor(client) {
        super();
        this.client = client;
        this.KEY_AES = this.client.state.KEY_AES;
        this.api = this.client.api;
    }
    /**
     * fetch fetch all mount files for user storage
     * @return {null}
     */
    fetch() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            this.data = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let response;
            try {
                response = yield this.client.api.request({
                    a: "f",
                    c: 1,
                });
            }
            catch (error) {
                reject(error);
            }
            const { ok, f } = response;
            this.shareKeys = ok.reduce((shares, share) => {
                const handler = share.h;
                const auth = this.client.state.KEY_AES.encrypt.ecb(Buffer.from(handler + handler, "utf8"));
                // console.log(share, auth, handler);
                if (crypto_2.constantTimeCompare(crypto_2.base64.decrypt(share.ha), auth)) {
                    shares[handler] = this.client.state.KEY_AES.decrypt.ecb(crypto_2.base64.decrypt(share.k));
                }
                return shares;
            }, {});
            try {
                for (var f_1 = __asyncValues(f), f_1_1; f_1_1 = yield f_1.next(), !f_1_1.done;) {
                    const file = f_1_1.value;
                    this.compose(file);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (f_1_1 && !f_1_1.done && (_a = f_1.return)) yield _a.call(f_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            resolve(this.data);
        }));
    }
    /**
     * Compose - compons file decrypting and mounting in this.data object
     * @param {Object} f
     * @returns {void}
     */
    compose(f) {
        if (!this.data.find((e) => e.nodeId === f.h)) {
            const file = this.parse(f);
            switch (f.t) {
                case 2:
                    this.ID_ROOT_FOLDER = this.client.state.ID_ROOT_FOLDER = f["h"];
                    file.name = "Cloud Drive";
                    break;
                case 3:
                    this.ID_TRASH = this.client.state.ID_TRASH = f["h"];
                    file.name = "Rubbish Bin";
                    break;
                case 4:
                    this.ID_INBOX = this.client.state.ID_FOLDER_INBOX = f["h"];
                    file.name = "Inbox";
                    break;
                default:
                    break;
            }
            this.data.push(file);
        }
        return this.data.find((e) => e.nodeId === f.h);
    }
    /**
     * Parse a file data
     * @param {Object} f
     * @returns {void}
     */
    parse(f) {
        const metadata = {
            nodeId: f.h,
            createdTime: f.ts,
            type: f.t,
            isDir: !!f.t,
            parent: f.p,
        };
        // Adding thumbnails links '835:1*1Kp8_ha2_fU/835:0*dxCWLWRUSXI"
        if (f.fa)
            metadata.thumbs = f.fa;
        /* {
          const thumb = f.fa.split("/")[0].split("*")[1];
          const preview = f.fa.split("/")[1].split("*")[1];
          metadata.thumbs = [thumb, preview];
        } */
        /* IF FILE HAS KEY */
        if (f.k) {
            let KEY_AES = this.KEY_AES;
            const idKeyPairs = f.k.split("/");
            for (const idKeyPair of idKeyPairs) {
                const id = idKeyPair.split(":")[0];
                if (id === this.client.state.USER_ID) {
                    f.k = idKeyPair;
                    break;
                }
                const shareKey = this.shareKeys[id];
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
    }
    /**
     * Gets file attributes and parses data with AES Key
     * @param file file encrypted data
     * @param {AES} aes AESKEY for load data
     * @returns
     */
    loadMetadata(file, aes = null) {
        /* HANDLING FILE INFO */
        let metadata = {
            size: file.s || 0,
            createdTime: file.ts || 0,
            type: file.t,
            isDir: !!file.t,
            owner: file.u,
        };
        const parts = file.k.split(":");
        const key = crypto_2.base64.decrypt(parts[parts.length - 1]);
        metadata.key = aes ? aes.decrypt.ecb(key) : this.client.state.KEY_AES.decrypt.ecb(key);
        if (file.a) {
            const properties = properties_1.default.decrypt(file.a, key);
            metadata = Object.assign(Object.assign({}, metadata), { properties });
        }
        return metadata;
    }
    /**
     * Gets download url from node
     * @param param0
     * @returns
     */
    /**
     * Get - gets a file data by name or nodeid
     * @param {Object}
     * @returns {Schema$File}
     */
    get({ nodeId, name, parent }) {
        return nodeId ?
            searchByNode(this.data, nodeId) :
            parent ?
                searchByName(this.data.filter((e) => e.parent === parent), name) :
                searchByName(this.data, name);
    }
    /**
     * Gets data from file, customizable with responseType oprion
     * @param {Object}
     * @returns {AxiosResponse["data"]}
     */
    geData({ nodeId, options, responseType, }) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const file = this.get({ nodeId });
            responseType || (responseType = "stream");
            options || (options = {
                ssl: 0,
                config: {
                    responseType,
                },
            });
            const { ssl, config } = options;
            const { g } = yield this.api.request({
                a: "g",
                g: 1,
                n: nodeId,
                ssl: ssl || 0,
            });
            let response;
            try {
                response = yield this.api.axios.get(g, config);
            }
            catch (error) {
                reject(error);
            }
            if ((config === null || config === void 0 ? void 0 : config.responseType) === "stream" || responseType === "stream") {
                const stream = new stream_1.PassThrough();
                const descrypter = crypto_2.createDecrypterStream(file.key);
                response.data.pipe(descrypter).pipe(stream);
                resolve(stream);
            }
            else {
                console.log("isnot stream");
                resolve(response.data);
            }
        }));
    }
    /*   private getDownloadData {
  
    } */
    /**
     * Get the thumbnail buffer
     * @param {nodeId} node Id handle file
     * @returns {Promise}
    */
    getThumbnail({ nodeId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = this.get({ nodeId });
            const thumbId2 = file.thumbs.split("/")[1].split("*")[1];
            const { p: thumbUrl } = yield this.api.request({
                a: "ufa",
                fah: thumbId2,
                r: 1,
                ssl: 1,
            });
            const hash = crypto_2.base64.decrypt(thumbId2);
            const url = thumbUrl + "/0";
            const headers = {
                "Origin": "https://mega.nz",
                "User-Agent": "Mozilla/ 5.0(Linux; Android 10; SM - M115F) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 88.0.4324.152 Mobile Safari / 537.36",
                "Accept": "*/*",
                "Referer": "https://mega.nz/",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "es-ES,es;q=0.9",
                "Connection": "keep-alive",
                "Content-Length": "8",
                "sec-ch-ua": `" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"`,
                "sec-ch-ua-mobile": "?0",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site",
                "Content-Type": "application/octet-stream",
            };
            try {
                const { data } = yield axios_1.default({
                    url,
                    method: "POST",
                    data: hash,
                    responseType: "arraybuffer",
                    headers,
                });
                const aes = crypto_2.getCipher(file.key);
                const thumb = aes.decrypt.cbc(data.slice(12, data.length));
                return Promise.resolve(thumb);
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    /**
     *
     * @param param0
     * @returns
     */
    getThumbnails(nodes) {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const files = nodes.map((e) => {
                const file = this.get({ nodeId: e });
                const thumbId = file.thumbs.split("/")[1].split("*")[1];
                const hash = crypto_2.base64.decrypt(thumbId);
                return Object.assign(Object.assign({}, file), { thumbId,
                    hash });
            });
            const request = files.map((e) => {
                return ({
                    a: "ufa",
                    fah: e.thumbId,
                    r: 1,
                    ssl: 1,
                });
            });
            console.log(request);
            const data = yield this.api.custom({
                data: request,
                config: {
                    method: "POST",
                },
            });
            console.log(data);
            try {
                for (var _b = __asyncValues(data.entries()), _c; _c = yield _b.next(), !_c.done;) {
                    const [index, { p }] = _c.value;
                    console.log(index);
                    const url = p + "/0";
                    console.log(url);
                    const headers = {
                        "Origin": "https://mega.nz",
                        "User-Agent": "Mozilla/ 5.0(Linux; Android 10; SM - M115F) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 88.0.4324.152 Mobile Safari / 537.36",
                        "Accept": "*/*",
                        "Referer": "https://mega.nz/",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Accept-Language": "es-ES,es;q=0.9",
                        "Connection": "keep-alive",
                        "Content-Length": "8",
                        "sec-ch-ua": `" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"`,
                        "sec-ch-ua-mobile": "?0",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "cross-site",
                        "Content-Type": "application/octet-stream",
                    };
                    const { data } = yield axios_1.default({
                        url,
                        method: "POST",
                        data: files[index].hash,
                        responseType: "arraybuffer",
                        headers,
                    });
                    const aes = crypto_2.getCipher(files[index].key);
                    const thumbBuffer = aes.decrypt.cbc(data.slice(12, data.length));
                    files[index].thumbBuffer = thumbBuffer;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return Promise.resolve(files);
        });
    }
    /**
     * List files by nodeId
     * @param {Object}
     * @returns {Schema$File[]}
     */
    list({ folderId, onlyFolders }) {
        // eslint-disable-next-line require-jsdoc
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
    }
    getByPath({ path }) {
        // PATH LIKE personal/2019/fabruary
        const routes = path.split("/");
        let currentFile;
        routes.forEach((route) => {
            currentFile = this.list({
                folderId: (currentFile === null || currentFile === void 0 ? void 0 : currentFile.nodeId) || this.client.state.ID_ROOT_FOLDER,
            })
                .find((e) => e.properties.name === route);
        });
        if (!currentFile)
            Promise.reject(new Error("DONT MATCH THIS MATH"));
        return Promise.resolve(currentFile);
    }
    /**
     * Creates new directorie in mount
     * @param {Object} options
     * @returns {Promise}
     */
    dir(options) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const { name, parent, parentName, properties, } = options;
            const t = parent || (yield this.get({ name: parentName })).parent || this.ID_ROOT_FOLDER;
            const key = crypto_1.randomBytes(16);
            const node = [{
                    h: "xxxxxxxx",
                    t: 1,
                    a: crypto_2.base64.encrypt(crypto_2.getCipher(key).encrypt.cbc(properties_1.default.pack(Object.assign({ n: name }, properties)))),
                    k: crypto_2.base64.encrypt(this.client.state.KEY_AES.encrypt.ecb(key)),
                }];
            const response = yield this.api.request({
                a: "p",
                t,
                n: node,
            });
            const file = this.compose(response.f[0]);
            resolve(file);
        }));
    }
    /**
     * Creates directory recursively
     * @example rdir("asd/daw/faadcs")
     * @param {Object}
     * @returns {void}
     */
    rdir({ path, parent }) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var e_3, _a;
            const dirs = path.split("/");
            if (!parent)
                parent = this.ID_ROOT_FOLDER;
            try {
                for (var dirs_1 = __asyncValues(dirs), dirs_1_1; dirs_1_1 = yield dirs_1.next(), !dirs_1_1.done;) {
                    const dirname = dirs_1_1.value;
                    const handler = this.get({ name: dirname });
                    if (handler) {
                        parent = handler.nodeId;
                        continue;
                    }
                    const folder = yield this.dir({
                        name: dirname,
                        parent,
                    });
                    parent = folder.nodeId;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (dirs_1_1 && !dirs_1_1.done && (_a = dirs_1.return)) yield _a.call(dirs_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            resolve();
        }));
    }
    search(text) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const files = [];
            for (const filesId in this.data) {
                const { name, nodeId, createdTime, key, downloadId } = this.data[filesId];
                if (!name)
                    continue;
                if (name.includes(text)) {
                    files.push({
                        name,
                        nodeId,
                        createdTime,
                        key,
                        dl: downloadId || false,
                    });
                }
            }
            if (files.length === 0)
                resolve(false);
            resolve(files);
        }));
    }
    // OK
    exists(name) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            for (const filesId in this.data) {
                if (!this.data[filesId].name)
                    continue;
                if (this.data[filesId].name.includes(name)) {
                    resolve(true);
                }
            }
            resolve(false);
        }));
    }
    isDir(nodeId) {
        const { isDir } = this.data.find((e) => e.nodeId === nodeId);
        return isDir;
    }
    /**
     * Deletes a file permanently or move to trash bin
     * @param {Object} params
     * @returns {Promise}
     */
    delete({ nodeId, permanent }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (permanent) {
                try {
                    yield this.api.request({
                        a: "d",
                        n: nodeId,
                    });
                    return Promise.resolve();
                }
                catch (error) {
                    return Promise.reject(error);
                }
            }
            try {
                yield this.move({
                    nodeId,
                    target: this.ID_TRASH,
                });
                return Promise.resolve();
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    // OK
    move({ nodeId, target }) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.api.request({
                    a: "m",
                    n: nodeId,
                    t: target,
                });
            }
            catch (err) {
                reject(err);
            }
            resolve();
        }));
    }
    // OK
    update({ name, nodeId, properties, }) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const file = yield this.get({
                name,
                nodeId,
            });
            const { tags } = properties;
            try {
                // uniquify array tags if exists
                tags && (properties.tags = lodash_1.uniq(file.properties.tags.concat(tags)));
                const newProperties = Object.assign(file.properties, properties);
                const unparsed = properties_1.default.unparse(newProperties);
                const packed = properties_1.default.pack(unparsed);
                crypto_2.getCipher(file.key).encrypt.cbc(packed);
                // making request
                yield this.api.request({
                    a: "a",
                    n: file.nodeId,
                    at: crypto_2.base64.encrypt(packed),
                });
                resolve();
            }
            catch (err) {
                reject(err);
            }
        }));
    }
    shortcut({ name, nodeId }, { parent, props }) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            /* onclick redirects to folder */
            const fileSource = yield this.get({
                name,
                nodeId,
            });
            yield this.get({ name: props });
            let uid = fileSource.properties.uid;
            const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            if (!(regex.test(uid)) || !uid) {
                console.log("generating new uid, matched is not valid or dont exists");
                uid = uuid_1.v4();
                yield this.update({
                    nodeId: fileSource.nodeId,
                    properties: { uid },
                });
            }
            const key = crypto_1.randomBytes(16);
            const properties = Object.assign({ n: props.name || fileSource.name, target: { uid } }, props);
            const resp = yield this.api.request({
                a: "p",
                t: parent || this.ID_ROOT_FOLDER,
                n: [
                    {
                        h: "xxxxxxxx",
                        t: 1,
                        a: crypto_2.base64.encrypt(crypto_2.getCipher(key).encrypt.cbc(properties_1.default.pack(properties))),
                        k: crypto_2.base64.encrypt(this.KEY_AES.encrypt.ecb(key)),
                    },
                ],
            });
            this.compose(resp.f[0]);
            resolve();
        }));
    }
    /**
     * Exports a file or folder by nodeId
     * @param {{ name, nodeId }} params
     * @returns {Promise<string>} url
     */
    export({ nodeId }) {
        return __awaiter(this, void 0, void 0, function* () {
            let shareKey;
            try {
                const file = yield this.get({
                    nodeId,
                });
                if (file.isDir) {
                    shareKey = crypto_1.randomBytes(16);
                    this.shareKeys[file.nodeId] = shareKey;
                    const cr = makeCryptoRequest(this, file);
                    const params = {
                        a: "s2",
                        n: file.nodeId,
                        s: [{
                                u: "EXP",
                                r: 0,
                            }],
                        ok: crypto_2.base64.encrypt(this.KEY_AES.encrypt.ecb(Buffer.from(shareKey))),
                        ha: crypto_2.base64.encrypt(this.KEY_AES.encrypt.ecb(Buffer.from(file.nodeId + file.nodeId))),
                        cr,
                    };
                    yield this.api.request(params);
                }
                const id = yield this.api.request({
                    a: "l",
                    n: file.nodeId,
                });
                const url = `https://mega.nz/${file.isDir ? "folder" : "file"}/${id}#${crypto_2.base64.encrypt(shareKey || file.key)}`;
                return Promise.resolve(url);
            }
            catch (error) {
                Promise.reject(error);
            }
        });
    }
    loadAttributes({ isDir, downloadId, key }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const req = isDir ? {
                    a: "f",
                    c: 1,
                    ca: 1,
                    r: 1,
                } : {
                    a: "g",
                    p: downloadId,
                };
                const response = yield this.api.custom({
                    data: req,
                    params: {
                        n: downloadId,
                    },
                });
                if (isDir) {
                    const nodes = response.f;
                    const rootFolder = nodes.find((node) => node.k && node.h === node.k.split(":")[0]);
                    const aes = key ? new crypto_2.AES(key) : null;
                    const folder = yield properties_1.default.loadMetadata(rootFolder, aes);
                    const filesSource = [Object.assign(Object.assign({}, folder), { downloadId })];
                    for (const file of nodes) {
                        if (file === rootFolder)
                            continue;
                        const childFile = properties_1.default.loadMetadata(file, aes);
                        childFile.downloadId = downloadId;
                        filesSource.push(childFile);
                    }
                    resolve(filesSource);
                }
                else {
                    const properties = properties_1.default.decrypt(response.at, key);
                    resolve({
                        size: response.s,
                        key,
                        isDir: false,
                        properties,
                    });
                }
            }));
        });
    }
}
exports.default = Files;
function selfAndChildren(file, files) {
    // eslint-disable-next-line max-len
    return [file].concat(files.list(file.nodeId).map((e) => e.isDir ? selfAndChildren(e, files) : e)).reduce((arr, el) => arr.concat(el), []);
}
function getShares(shareKeys, node) {
    const handle = node.nodeId;
    const parent = node.parent;
    const shares = [];
    if (shareKeys[handle]) {
        shares.push(handle);
    }
    return parent ?
        shares.concat(getShares(shareKeys, parent)) :
        shares;
}
function makeCryptoRequest(files, sources, shares) {
    const shareKeys = files.shareKeys;
    if (!Array.isArray(sources)) {
        sources = selfAndChildren(sources, files);
    }
    console.log(files.shareKeys);
    if (!shares) {
        shares = sources
            .map((source) => getShares(shareKeys, source))
            .reduce((arr, el) => arr.concat(el))
            .filter((el, index, arr) => index === arr.indexOf(el));
    }
    const cryptoRequest = [
        shares,
        sources.map((node) => node.nodeId),
        [],
    ];
    // TODO: optimize - keep track of pre-existing/sent keys, only send new ones
    for (let i = shares.length; i--;) {
        const aes = new crypto_2.AES(shareKeys[shares[i]]);
        console.log(shareKeys[shares[i]]);
        for (let j = sources.length; j--;) {
            console.log(sources[j]);
            const fileKey = Buffer.from(sources[j].key);
            if (fileKey && (fileKey.length === 32 || fileKey.length === 16)) {
                cryptoRequest[2].push(i, j, crypto_2.base64.encrypt(aes.encrypt.ecb(fileKey)));
            }
        }
    }
    return cryptoRequest;
}
function searchByName(data, name) {
    return data.find((e) => { var _a; return name === ((_a = e === null || e === void 0 ? void 0 : e.properties) === null || _a === void 0 ? void 0 : _a.name); });
}
function searchByNode(data, nodeId) {
    return data.find((e) => nodeId === e.nodeId);
}
function config(thumbUrl, hash, config, arg3) {
    throw new Error("Function not implemented.");
}
