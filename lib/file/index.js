"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const properties_1 = __importDefault(require("./properties"));
const axios_1 = __importDefault(require("axios"));
const stream_1 = require("stream");
const util_1 = require("util");
const pump = util_1.promisify(require('pump'));
const crypto_2 = require("../crypto");
const url_1 = require("url");
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
let KEY_CACHE = {};
class Files extends stream_1.EventEmitter {
    constructor(context) {
        super();
        Object.assign(this, context);
    }
    fetch() {
        return new Promise(async (resolve, reject) => {
            this.data = [];
            let { ok, f } = await this.api.request({ a: "f", c: 1 });
            this.shareKeys = ok.reduce((shares, share) => {
                const handler = share.h;
                const auth = this.KEY_AES.encryptECB(Buffer.from(handler + handler, "utf8"));
                console.log(share, auth, handler);
                if (crypto_2.constantTimeCompare(crypto_2.formatKey(share.ha), auth)) {
                    shares[handler] = this.KEY_AES.decryptECB(crypto_2.formatKey(share.k));
                }
                return shares;
            }, {});
            for await (const file of f) {
                this.compose(file);
            }
            resolve(this.data);
        });
    }
    compose(f) {
        if (!this.data.find((e) => e.nodeId === f.h)) {
            let file = this.parse(f);
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
        return this.data.find((e) => e.nodeId === f.h);
    }
    parse(f) {
        let metadata = {
            nodeId: f.h,
            createdTime: f.ts,
            type: f.t,
            isDir: !!f.t,
            parent: f.p,
        };
        /* IF FILE HAS KEY */
        if (f.k) {
            let KEY_AES = this.KEY_AES;
            const idKeyPairs = f.k.split('/');
            for (let idKeyPair of idKeyPairs) {
                const id = idKeyPair.split(':')[0];
                if (id === this.user) {
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
    loadMetadata(file, aes = null) {
        /* HANDLING FILE INFO */
        let metadata = {
            size: file.s || 0,
            createdTime: file.ts || 0,
            type: file.t,
            isDir: !!file.t,
            owner: file.u,
        };
        let parts = file.k.split(":");
        let key = crypto_2.formatKey(parts[parts.length - 1]);
        metadata.key = aes ? aes.decryptECB(key) : this.KEY_AES.decryptECB(key);
        if (file.a) {
            let properties = properties_1.default.decrypt(file.a, key);
            metadata = { ...metadata, properties };
        }
        return metadata;
    }
    // OK
    get({ nodeId, name, stream, parent }, options) {
        return new Promise(async (resolve) => {
            let file;
            if (nodeId) {
                file = searchByNode(this.data, nodeId);
            }
            else if (name) {
                file = parent
                    ? searchByName(this.data.filter((e) => e.parent === parent), name)
                    : searchByName(this.data, name);
            }
            else {
                file = searchByNode(this.data, this.ID_ROOT_FOLDER);
            }
            if (stream) {
                let resp = await this.api.request({
                    a: 'g',
                    g: 1,
                    n: file.nodeId,
                    ssl: (process.env.IS_BROWSER_BUILD || options.ssl) ? 2 : 0
                });
                let stream = new stream_1.PassThrough();
                await pump(await axios_1.default.get(resp.g, { responseType: "stream" }), crypto_2.createDecrypterStream(file.key), stream);
                resolve(stream);
            }
            resolve(file);
        });
    }
    // pOK
    list({ folderId, onlyFolders }) {
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
    // OK
    dir(options) {
        return new Promise(async (resolve) => {
            let { name, parent, parentName, properties } = options;
            let t = parent || (await this.get({ name: parentName })).parent || this.ID_ROOT_FOLDER;
            let key = crypto_1.randomBytes(16);
            let node = [{
                    h: "xxxxxxxx",
                    t: 1,
                    a: crypto_2.e64(crypto_2.getCipher(key).encryptCBC(properties_1.default.pack({ n: name, ...properties }))),
                    k: crypto_2.e64(this.KEY_AES.encryptECB(key)),
                }];
            let response = await this.api.request({
                a: "p",
                t,
                n: node,
            });
            let file = this.compose(response.f[0]);
            resolve(file);
        });
    }
    rdir({ folderPath, parent }) {
        return new Promise(async (resolve) => {
            let dirs = folderPath.split("/");
            if (!parent)
                parent = this.ID_ROOT_FOLDER;
            for await (let dirname of dirs) {
                let nodeId = await this.exists(dirname);
                if (nodeId) {
                    parent = nodeId;
                    continue;
                }
                let folder = await this.dir({ name: dirname, parent });
                parent = folder.nodeId;
            }
            resolve();
        });
    }
    // OK
    search(text) {
        return new Promise(async (resolve) => {
            let files = [];
            for (const filesId in this.data) {
                let { name, nodeId, timestamp, key, downloadId } = this.data[filesId];
                if (!name)
                    continue;
                if (name.includes(text)) {
                    files.push({
                        name,
                        nodeId,
                        createdAt: timestamp,
                        key,
                        dl: downloadId || false,
                    });
                }
            }
            if (files.length === 0)
                resolve(false);
            resolve(files);
        });
    }
    //OK
    exists(name) {
        return new Promise(async (resolve) => {
            for (const filesId in this.data) {
                if (!this.data[filesId].name)
                    continue;
                if (this.data[filesId].name.includes(name)) {
                    resolve(this.data[filesId].nodeId);
                }
            }
            resolve(false);
        });
    }
    //ok
    isDir(nodeId) {
        let { isDir } = this.data.find((e) => e.nodeId === nodeId);
        return isDir;
    }
    //OK
    delete({ nodeId, permanent }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (permanent) {
                    await this.api.request({ a: "d", n: nodeId });
                }
                else {
                    await this.move({ nodeId, target: this.ID_TRASH });
                }
            }
            catch (err) {
                reject(err);
            }
            resolve();
        });
    }
    //OK
    move({ nodeId, target }) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.api.request({ a: "m", n: nodeId, t: target });
            }
            catch (err) {
                reject(err);
            }
            resolve();
        });
    }
    //OK
    update({ name, nodeId, properties, }) {
        return new Promise(async (resolve, reject) => {
            let file = await this.get({ name, nodeId });
            let { tags } = properties;
            try {
                // uniquify array tags if exists
                tags && (properties.tags = lodash_1.uniq(file.properties.tags.concat(tags)));
                let newProperties = Object.assign(file.properties, properties);
                let unparsed = properties_1.default.unparse(newProperties);
                let packed = properties_1.default.pack(unparsed);
                crypto_2.getCipher(file.key).encryptCBC(packed);
                // making request
                await this.api.request({ a: "a", n: file.nodeId, at: crypto_2.e64(packed) });
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    shortcut({ name, nodeId }, { parent, props }) {
        return new Promise(async (resolve) => {
            /* onclick redirects to folder */
            let fileSource = await this.get({ name, nodeId });
            await this.get({ name: props });
            let uid = fileSource.properties.uid;
            let regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
            if (!(regex.test(uid)) || !uid) {
                console.log("generating new uid, matched is not valid or dont exists");
                uid = uuid_1.v4();
                this.emit("action", "ADDING UID TO FILE SOURCE");
                await this.update({ nodeId: fileSource.nodeId, properties: { uid } });
            }
            let key = crypto_1.randomBytes(16);
            let properties = {
                n: props.name || fileSource.name,
                target: { uid },
                ...props
            };
            this.emit("action", "SAVING UID IN TARGET SHORTCUT");
            let resp = await this.api.request({
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
            });
            this.compose(resp.f[0]);
            resolve();
        });
    }
    find({ path }) {
    }
    //OK
    export({ name, nodeId }) {
        return new Promise(async (resolve) => {
            let shareKey;
            let file = await this.get({ name, nodeId });
            /*    if (isDir) {
                   this.shareFolder(options, cb)
                 } */
            if (file.isDir) {
                shareKey = crypto_1.randomBytes(16);
                this.shareKeys[file.nodeId] = shareKey;
                const cr = makeCryptoRequest(this, file);
                const params = {
                    a: 's2',
                    n: file.nodeId,
                    s: [{ u: 'EXP', r: 0 }],
                    ok: crypto_2.e64(this.KEY_AES.encryptECB(Buffer.from(shareKey))),
                    ha: crypto_2.e64(this.KEY_AES.encryptECB(Buffer.from(file.nodeId + file.nodeId))),
                    cr
                };
                await this.api.request(params);
            }
            let id = await this.api.request({ a: 'l', n: file.nodeId });
            let url = `https://mega.nz/${file.isDir ? 'folder' : 'file'}/${id}#${crypto_2.e64(shareKey || file.key)}`;
            console.log(url);
            resolve(url);
        });
    }
    unexport({ name, nodeId }) {
        return new Promise(async (resolve) => {
        });
    }
    async import({ nodeId, url }) {
        let self = this;
        function prepareRequest(source, ph = false) {
            let cipher = crypto_2.getCipher(source.key);
            let packedProperties = properties_1.default.pack(source.properties);
            let publicHandle = source.downloadId;
            let req = {
                h: Array.isArray(publicHandle) ? publicHandle[1] : publicHandle,
                t: source.isDir ? 1 : 0,
                a: crypto_2.e64(cipher.encryptCBC(packedProperties)),
                k: crypto_2.e64(self.KEY_AES.encryptECB(source.key))
            };
            ph && (req.h = req.ph);
            return req;
        }
        let urlData = Url.parse(url);
        let source = await this.loadAttributes(urlData);
        console.log(urlData);
        const request = urlData.isDir ? {
            a: 'p',
            t: nodeId || this.ID_ROOT_FOLDER,
            n: source.map((file) => prepareRequest(file)),
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
        await this.api.request(request);
    }
    async loadAttributes({ isDir, downloadId, file, key }) {
        return new Promise(async (resolve, reject) => {
            const req = isDir ? {
                a: 'f',
                c: 1,
                ca: 1,
                r: 1,
            } : {
                a: 'g',
                p: downloadId
            };
            let response = await this.api.customRequest(req, { n: downloadId });
            if (isDir) {
                let nodes = response.f;
                let rootFolder = nodes.find(node => node.k && node.h === node.k.split(':')[0]);
                let aes = key ? new crypto_2.AES(key) : null;
                let folder = await properties_1.default.loadMetadata(rootFolder, aes);
                let filesSource = [{ ...folder, downloadId }];
                for (let file of nodes) {
                    if (file === rootFolder)
                        continue;
                    let childFile = properties_1.default.loadMetadata(file, aes);
                    childFile.downloadId = downloadId;
                    filesSource.push(childFile);
                }
                resolve(filesSource);
            }
            else {
                let properties = properties_1.default.decrypt(response.at, key);
                resolve({
                    size: response.s,
                    key,
                    isDir: false,
                    properties
                });
            }
        });
    }
}
exports.default = Files;
function makeCryptoRequest(files, sources, shares) {
    function selfAndChildren(file, files) {
        return [file].concat(files.list(file.nodeId).map((e) => e.isDir ? selfAndChildren(e, files) : e)).reduce((arr, el) => arr.concat(el), []);
    }
    function getShares(shareKeys, node) {
        const handle = node.nodeId;
        const parent = node.parent;
        const shares = [];
        if (shareKeys[handle]) {
            shares.push(handle);
        }
        return parent
            ? shares.concat(getShares(shareKeys, parent))
            : shares;
    }
    const shareKeys = files.shareKeys;
    if (!Array.isArray(sources)) {
        sources = selfAndChildren(sources, files);
    }
    console.log(files.shareKeys);
    if (!shares) {
        shares = sources
            .map(source => getShares(shareKeys, source))
            .reduce((arr, el) => arr.concat(el))
            .filter((el, index, arr) => index === arr.indexOf(el));
    }
    const cryptoRequest = [
        shares,
        sources.map(node => node.nodeId),
        []
    ];
    // TODO: optimize - keep track of pre-existing/sent keys, only send new ones
    for (let i = shares.length; i--;) {
        const aes = new crypto_2.AES(shareKeys[shares[i]]);
        console.log(shareKeys[shares[i]]);
        for (let j = sources.length; j--;) {
            console.log(sources[j]);
            const fileKey = Buffer.from(sources[j].key);
            if (fileKey && (fileKey.length === 32 || fileKey.length === 16)) {
                cryptoRequest[2].push(i, j, crypto_2.e64(aes.encryptECB(fileKey)));
            }
        }
    }
    return cryptoRequest;
}
class Url {
    static parse(url) {
        url = url_1.parse(url);
        if (url.path.match(/\/(file|folder)\//) !== null) {
            // new format
            let [key, file] = url.hash.substr(1).split("/file/");
            let downloadId = url.path.substring(url.path.lastIndexOf("/") + 1, url.path.length + 1);
            let isDir = url.path.indexOf("/folder/") >= 0;
            console.log(key, "from static url");
            return { key: crypto_2.d64(key), file, downloadId, isDir };
        }
        else {
            // old format
            let [isDir, downloadId, key, file] = url.hash.split("!");
            return { key, file, downloadId, isDir };
        }
    }
}
function searchByName(data, name) {
    return data.find(e => name === e?.properties?.name);
}
function searchByNode(data, nodeId) {
    return data.find(e => nodeId === e.nodeId);
}
class DarkFiles extends Files {
    constructor(context) {
        super(context);
    }
}
