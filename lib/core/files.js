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
const crypto_1 = require("crypto");
const properties_1 = __importDefault(require("./properties"));
const axios_1 = __importDefault(require("axios"));
const events_1 = __importDefault(require("events"));
const crypto_2 = require("../crypto");
const helpers_1 = require("../helpers");
const KEY_CACHE = {};
const TYPE_FILE_DATA = ["file", "thumbnail", "preview"];
const FOLDERS = {
    ROOT: 2,
    TRASH: 3,
    INBOX: 4,
};
/**
 * Main class files for every purpose file
 */
class Files extends events_1.default {
    constructor(client) {
        super();
        this.client = client;
        this.folderIds = { root: "", trash: "", inbox: "" };
        this.data = [];
        this.KEY_AES = this.client.state.KEY_AES;
        this.api = this.client.api;
    }
    fetch() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let response;
            try {
                response = yield this.client.api.request({
                    a: "f",
                    c: 1,
                });
            }
            catch (error) {
                return Promise.reject(error);
            }
            const { f } = response;
            this.shareKeys = response.ok.reduce((shares, share) => {
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
            console.log("findish");
            return Promise.resolve(this.data);
        });
    }
    /**
     * Compose - compons file decrypting and mounting in this.data object
     * @param {Object} f
     * @returns {void}
     */
    compose(f) {
        const fileExists = this.data.find((e) => (e === null || e === void 0 ? void 0 : e.nodeId) === f.h);
        if (!fileExists) {
            const file = this.parse(f);
            switch (f.t) {
                case FOLDERS.ROOT:
                    this.folderIds.root = this.client.state.ID_ROOT_FOLDER = f["h"];
                    file.name = "Cloud Drive";
                    file.nodeId = f["h"];
                    break;
                case FOLDERS.TRASH:
                    this.folderIds.trash = this.client.state.ID_TRASH = f["h"];
                    file.name = "Rubbish Bin";
                    file.nodeId = f["h"];
                    break;
                case FOLDERS.INBOX:
                    this.folderIds.inbox = this.client.state.ID_FOLDER_INBOX = f["h"];
                    file.name = "Inbox";
                    file.nodeId = f["h"];
                    break;
                default:
                    break;
            }
            this.data.push(file);
            return file;
        }
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
     * Get - gets a file data by name or nodeid
     * @param {Object}
     * @returns {Schema$File}
     */
    get({ nodeId, name, parent }) {
        if (nodeId) {
            if (parent) {
                searchByName(this.data.filter((e) => e.parent === parent), name);
            }
            return searchByNode(this.data, nodeId);
        }
        else if (name) {
            return searchByName(this.data, name);
        }
    }
    /**
     * Gets data from file, customizable with responseType oprion
     * @param {Object}
     * @returns {AxiosResponse["data"]}
     */
    getSource({ nodeId, config, useSSL, range, url }) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = this.get({ nodeId });
            const defaultConfigAxios = { responseType: "stream" };
            const configAxios = config || defaultConfigAxios;
            let downloadUrl = url;
            if (!url) {
                console.log("dont found url");
                // Made request of the file
                const response = yield this.api.request({
                    a: "g",
                    g: 1,
                    n: nodeId,
                    ssl: useSSL ? 1 : 0,
                });
                downloadUrl = response.g;
            }
            const startRange = (range === null || range === void 0 ? void 0 : range.start) || 0;
            const endRange = (range === null || range === void 0 ? void 0 : range.end) || String(file.size);
            const urlRange = `${downloadUrl}/${startRange}-${endRange}`;
            const { data, status, headers } = yield this.api.axios.get(urlRange, { responseType: "stream" });
            if (configAxios.responseType === "stream") {
                const decryptStream = crypto_2.megaDecrypt(file.key);
                const descrypter = crypto_2.createDecrypterStream(file.key);
                data.pipe(descrypter);
                return Promise.resolve({ data: descrypter, url: downloadUrl });
            }
            else {
                // TODO PENDIG DECRUPTING BUFFER OR ANY OTHER DATA
                return Promise.resolve({ data, url: downloadUrl });
            }
        });
    }
    getThumbs({ nodes, previewType }) {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const previewTypes = {
                thumbnail: 1,
                preview: 0,
            };
            const getThumbsIds = (file) => file.thumbs.split("/")[1].split("*");
            const files = nodes.map((nodeId) => this.get({ nodeId }));
            const type = previewTypes[previewType];
            const requestData = files.map((file) => {
                console.log(getThumbsIds(file));
                return {
                    a: "ufa",
                    fah: getThumbsIds(file)[1],
                    r: 1,
                    ssl: 0,
                };
            });
            console.log(requestData);
            const response = yield this.api.custom({ data: requestData });
            let thumbs = [];
            try {
                for (var _b = __asyncValues(response.entries()), _c; _c = yield _b.next(), !_c.done;) {
                    const [index, item] = _c.value;
                    console.log(item);
                    const url = `${item.p}/${type}`;
                    const file = files[index];
                    const hash = crypto_2.base64.decrypt(getThumbsIds(file)[1]);
                    const { data } = yield axios_1.default({
                        url,
                        method: "POST",
                        data: hash,
                        responseType: "arraybuffer",
                        headers: helpers_1.headers.requestThummbnail,
                    });
                    const aes = crypto_2.getCipher(file.key);
                    const dataNormalized = data.slice(12, data.length);
                    const bufferThumb = aes.decrypt.cbc(dataNormalized);
                    thumbs.push({
                        nodeId: file.nodeId,
                        data: bufferThumb,
                    });
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return Promise.resolve(thumbs);
        });
    }
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
            try {
                const { data } = yield axios_1.default({
                    url,
                    method: "POST",
                    data: hash,
                    responseType: "arraybuffer",
                    headers: helpers_1.headers.requestThummbnail,
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
            }).find((e) => e.properties.name === route);
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
    makedir(options) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const { name, parent, parentName, properties } = options;
            const t = parent || (yield this.get({ name: parentName })).parent || this.client.state.ID_ROOT_FOLDER;
            const key = crypto_1.randomBytes(16);
            const node = [
                {
                    h: "xxxxxxxx",
                    t: 1,
                    a: crypto_2.base64.encrypt(crypto_2.getCipher(key).encrypt.cbc(properties_1.default.pack(Object.assign({ n: name }, properties)))),
                    k: crypto_2.base64.encrypt(this.client.state.KEY_AES.encrypt.ecb(key)),
                },
            ];
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
                parent = this.client.state.ID_ROOT_FOLDER;
            try {
                for (var dirs_1 = __asyncValues(dirs), dirs_1_1; dirs_1_1 = yield dirs_1.next(), !dirs_1_1.done;) {
                    const dirname = dirs_1_1.value;
                    const handler = this.get({ name: dirname });
                    if (handler) {
                        parent = handler.nodeId;
                        continue;
                    }
                    const folder = yield this.makedir({
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
            return null;
        return files;
    }
    // OK
    exists(name) {
        for (const filesId in this.data) {
            if (!this.data[filesId].name)
                continue;
            if (this.data[filesId].name.includes(name)) {
                return true;
            }
        }
        return false;
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
                    target: this.client.state.ID_TRASH,
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
    update({ nodeId, properties }) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = this.get({ nodeId });
            try {
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
                return Promise.resolve();
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
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
                        s: [
                            {
                                u: "EXP",
                                r: 0,
                            },
                        ],
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
                const req = isDir
                    ? {
                        a: "f",
                        c: 1,
                        ca: 1,
                        r: 1,
                    }
                    : {
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
                    const nodes = response[0].f;
                    const rootFolder = nodes.find((node) => node.k && node.h === node.k.split(":")[0]);
                    const aes = key ? new crypto_2.AES(key) : null;
                    const folder = yield properties_1.default.loadMetadata(rootFolder, aes);
                    const filesSource = [
                        Object.assign(Object.assign({}, folder), { downloadId }),
                    ];
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
                    const properties = properties_1.default.decrypt(response[0].at, key);
                    resolve({
                        size: response[0].s,
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
    return [file].concat(files.list(file.nodeId).map((e) => (e.isDir ? selfAndChildren(e, files) : e))).reduce((arr, el) => arr.concat(el), []);
}
function getShares(shareKeys, node) {
    const handle = node.nodeId;
    const parent = node.parent;
    const shares = [];
    if (shareKeys[handle]) {
        shares.push(handle);
    }
    return parent ? shares.concat(getShares(shareKeys, parent)) : shares;
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
    const cryptoRequest = [shares, sources.map((node) => node.nodeId), []];
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
