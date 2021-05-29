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
/* eslint-disable require-jsdoc */
/* eslint-disable no-async-promise-executor */
const crypto_1 = require("crypto");
const properties_1 = __importDefault(require("./properties"));
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
                const auth = this.KEY_AES.encrypt.ecb(Buffer.from(handler + handler, "utf8"));
                console.log(share, auth, handler);
                if (crypto_2.constantTimeCompare(crypto_2.base64.decrypt(share.ha), auth)) {
                    shares[handler] = this.KEY_AES.decrypt.ecb(crypto_2.base64.decrypt(share.k));
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
    /*
    https://gfs270n075.userstorage.mega.co.nz/dl/Yp-H9qmmVgPHKwJe6p0SCR-05g-YZsIaltDB-nITbFlGrYj3dQtMXAIpPgRDdPcHkz6w6TW_caJZJN-P31WLUpkU0a0KLEIisUUVV_o9SsGjjDLdXfLYaQ/0-121832
  
    https://gfs270n080.userstorage.mega.co.nz/ul/bLGqPVtfD48PhAJVJ79WubAfmXrJ58NPulkYWUyTV3uT_NZV8P1bYtEy6dXlaagrt0l7FJm4NtTmfwYwQqvF8A/0?c=YMHzpw_K4YHxQ826
    first uplaod
  
  thumbnail preview
    [{"a":"ufa","s":6416,"ssl":1},{"a":"ufa","s":53504,"ssl":1},{"a":"ping"}]
  
  
    0: {,…}
  p: "https://gfs270n861.userstorage.mega.co.nz/OgS-QwtYiVKHngfB2B6RuopFq2pP8W9Sc_cA68yLpzGSpSvnW7kenkhW25P4oBaex73B6g"
  1: {,…}
  p: "https://gfs270n896.userstorage.mega.co.nz/6OICka10omb1LQfT6IDpJ9m2fV4lNW8mI5QX3VIxS5lvMgYzsvycmVn07Me8jsSZzGzkdA"
  2: -2
  
    POST THE RECEIVE THE URLS FOR UPLOAD THUMB AND PREV
    https://gfs270n861.userstorage.mega.co.nz/OgS-QwtYiVKHngfB2B6RuopFq2pP8W9Sc_cA68yLpzGSpSvnW7kenkhW25P4oBaex73B6g ADD 0
    https://gfs270n861.userstorage.mega.co.nz/OgS-QwtYiVKHngfB2B6RuopFq2pP8W9Sc_cA68yLpzGSpSvnW7kenkhW25P4oBaex73B6g/0
  
    ADD 1 https://gfs270n896.userstorage.mega.co.nz/6OICka10omb1LQfT6IDpJ9m2fV4lNW8mI5QX3VIxS5lvMgYzsvycmVn07Me8jsSZzGzkdA/1
  
  
    0: {a: "p", t: "3WIFyQ7R", n: [{t: 0, h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB",…}],…}
  a: "p"
  i: "bOw2uhtJjh"
  n: [{t: 0, h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB",…}]
  0: {t: 0, h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB",…}
  a: "KMwLcFzyeiLkrTYPUMQi0N7G2igGr2vljN6cWZIEL9OOi7nd7MwRwxh-E8Dbkq7sLR_QAKlmuNaqVkvvy13Ai-4XWAIkbErKVy0u14BpcE0"
  fa: false
  h: "DFpjFKYf1I4MJUoETsyflihopVBhzh03WGHgesFbrSNjb0wB"
  k: "5EThrZvP5HhAKZBRCPrDhsah7pDwWOeWX31vxTrwd5M"
  t: 0
  t: "3WIFyQ7R" */
    /**
     * Gets data from file, customizable with responseType oprion
     * @param {Object}
     * @returns {AxiosResponse["data"]}
     */
    getData({ nodeId, options, responseType, }) {
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
                    k: crypto_2.base64.encrypt(this.KEY_AES.encrypt.ecb(key)),
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
    rdir({ folderPath, parent }) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var e_2, _a;
            const dirs = folderPath.split("/");
            if (!parent)
                parent = this.ID_ROOT_FOLDER;
            try {
                for (var dirs_1 = __asyncValues(dirs), dirs_1_1; dirs_1_1 = yield dirs_1.next(), !dirs_1_1.done;) {
                    const dirname = dirs_1_1.value;
                    const { nodeId } = this.get({ name: dirname });
                    if (nodeId) {
                        parent = nodeId;
                        continue;
                    }
                    const folder = yield this.dir({
                        name: dirname,
                        parent,
                    });
                    parent = folder.nodeId;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (dirs_1_1 && !dirs_1_1.done && (_a = dirs_1.return)) yield _a.call(dirs_1);
                }
                finally { if (e_2) throw e_2.error; }
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
    /*
  
  IN PROGRESSS...
    async import({ nodeId, url }: { nodeId?: string; url: string }) {
      const self = this;
      function prepareRequest(source: Schema$File, ph = false) {
        const cipher = getCipher(source.key);
        const packedProperties = Properties.pack(source.properties);
        const publicHandle = source.downloadId;
        const req: any = {
          h: Array.isArray(publicHandle) ? publicHandle[1] : publicHandle,
          t: source.isDir ? 1 : 0,
          a: base64.encrypt(cipher.encrypt.CBC(packedProperties)),
          k: base64.encrypt(self.KEY_AES.encrypt.ECB(source.key)),
        };
        ph && (req.h = req.ph);
        return req;
      }
      const urlData = Url.parse(url);
      const source = await this.loadAttributes(urlData);
      console.log(urlData);
      const request: any = urlData.isDir ? {
        a: "p",
        t: nodeId || this.ID_ROOT_FOLDER,
        n: source.map((file: Schema$File) => prepareRequest(file)),
        sm: 1,
        v: 3,
      } : {
        a: "p",
        t: nodeId || this.ID_ROOT_FOLDER,
        n: prepareRequest(source, true),
      };
  
      if (this.shareKeys && this.shareKeys.length) {
        request.cr = makeCryptoRequest(this, source[0]);
      }
  
  
      console.log(request);
      await this.api.request(request);
    } */
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
                const response = yield this.api.custom({ data: req,
                    params: { n: downloadId } });
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
