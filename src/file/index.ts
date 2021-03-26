
import { randomBytes } from "crypto"
import { GenericObject, Schema$File, Schema$Properties, Schmea$ApiFile } from "../types";
import Api from "../api";
import Properties from "./properties";
import axios from "axios";
import { EventEmitter, PassThrough } from "stream"
import { promisify } from "util"
const pump = promisify(require('pump'))
import { e64, formatKey, AES, getCipher, createDecrypterStream, constantTimeCompare, d64 } from "../crypto";
import { parse } from "url";
import { v4 } from "uuid";
import { uniq } from "lodash"
import { Params$Get } from "../types";

let KEY_CACHE = {}

export default class Files extends EventEmitter {


    ID_ROOT_FOLDER: string;
    ID_TRASH: string;
    ID_INBOX: string;
    KEY_AES: AES

    shareKeys: GenericObject; //{ BUffer}
    data: any[]
    api: Api

    user: string;
    name: string


    constructor(context) {
        super()
        Object.assign(this, context)
    }

    public fetch() {
        return new Promise(async (resolve, reject) => {
            this.data = [];
            let { ok, f }: { ok: { h: string; ha: String; k: String; }[], f: Schmea$ApiFile[] } = await this.api.request({ a: "f", c: 1 });

            this.shareKeys = ok.reduce((shares, share) => {
                const handler = share.h
                const auth = this.KEY_AES.encryptECB(Buffer.from(handler + handler, "utf8"))
                console.log(share, auth, handler)

                if (constantTimeCompare(formatKey(share.ha), auth)) {
                    shares[handler] = this.KEY_AES.decryptECB(formatKey(share.k))
                }
                return shares
            }, {})

            for await (const file of f) {
                this.compose(file);
            }
            resolve(this.data);
        });
    }
    private compose(f) {
        if (!this.data.find((e) => e.nodeId === f.h)) {
            let file: any = this.parse(f);
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
    private parse(f) {
        let metadata: Schema$File = {
            nodeId: f.h,
            createdTime: f.ts,
            type: f.t,
            isDir: !!f.t,
            parent: f.p,
        };

        /* IF FILE HAS KEY */
        if (f.k) {

            let KEY_AES = this.KEY_AES
            const idKeyPairs = f.k.split('/')
            for (let idKeyPair of idKeyPairs) {
                const id = idKeyPair.split(':')[0]
                if (id === this.user) {
                    f.k = idKeyPair
                    break
                }
                const shareKey = this.shareKeys[id]
                if (shareKey) {
                    f.k = idKeyPair
                    KEY_AES = KEY_CACHE[id]
                    if (!KEY_AES) {
                        KEY_AES = KEY_CACHE[id] = new AES(shareKey)
                    }
                    break
                }
            }

            Object.assign(metadata, this.loadMetadata(f, KEY_AES));
            return metadata;
        }
        return metadata;
    }
    private loadMetadata(file, aes = null) {
        /* HANDLING FILE INFO */
        let metadata: Schema$File = {
            size: file.s || 0,
            createdTime: file.ts || 0,
            type: file.t,
            isDir: !!file.t,
            owner: file.u,
        };

        let parts = file.k.split(":");
        let key = formatKey(parts[parts.length - 1]);
        metadata.key = aes ? aes.decryptECB(key) : this.KEY_AES.decryptECB(key)
        if (file.a) {
            let properties = Properties.decrypt(file.a, key);
            metadata = { ...metadata, properties }
        }
        return metadata;
    }


    // OK
    public get({ nodeId, name, stream, parent }: Params$Get, options?: any): Promise<any> {
        return new Promise(async (resolve) => {
            let file: Schema$File
            if (nodeId) {
                file = searchByNode(this.data, nodeId);
            } else if (name) {
                file = parent
                    ? searchByName(this.data.filter((e) => e.parent === parent), name)
                    : searchByName(this.data, name)
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
                })
                let stream = new PassThrough()
                await pump(await axios.get(resp.g, { responseType: "stream" }), createDecrypterStream(file.key), stream)
                resolve(stream)
            }

            resolve(file)

        })

    }

    // pOK
    public list({ folderId, onlyFolders }: { folderId?: string; onlyFolders?: Boolean }): Schema$File[] {

        function filterReducer(file) {
            if (onlyFolders) {
                if (file.parent === folderId && file.isDir) return true
            }
            else {
                return file.parent === folderId
            }
        }

        return this.data.filter(filterReducer)
    }

    // OK
    public dir(options: {
        name: string;
        parent: string;
        parentName?: string;
        properties?: Schema$Properties
    }): Promise<Schema$File> {
        return new Promise(async (resolve) => {

            let {
                name,
                parent,
                parentName,
                properties
            } = options


            let t: string = parent || (await this.get({ name: parentName })).parent || this.ID_ROOT_FOLDER

            let key = randomBytes(16);

            let node = [{
                h: "xxxxxxxx",
                t: 1,
                a: e64(getCipher(key).encryptCBC(Properties.pack({ n: name, ...properties }))),
                k: e64(this.KEY_AES.encryptECB(key)),
            }]


            let response = await this.api.request({
                a: "p",
                t,
                n: node,
            });
            let file = this.compose(response.f[0]);
            resolve(file)
        })
    }

    public rdir({ folderPath, parent }): Promise<void> {
        return new Promise(async (resolve) => {
            let dirs = folderPath.split("/");
            if (!parent) parent = this.ID_ROOT_FOLDER;
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
    public search(text: string): Promise<Schema$File[] | Boolean> {
        return new Promise(async (resolve) => {
            let files = [];
            for (const filesId in this.data) {
                let { name, nodeId, timestamp, key, downloadId } = this.data[filesId];
                if (!name) continue;
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
            if (files.length === 0) resolve(false);
            resolve(files);
        });
    }
    //OK
    public exists(name: string): Promise<Boolean> {
        return new Promise(async (resolve) => {
            for (const filesId in this.data) {
                if (!this.data[filesId].name) continue;
                if (this.data[filesId].name.includes(name)) {
                    resolve(this.data[filesId].nodeId);
                }
            }
            resolve(false);
        });
    }
    //ok
    public isDir(nodeId) {
        let { isDir } = this.data.find((e) => e.nodeId === nodeId);
        return isDir;
    }
    //OK
    public delete({ nodeId, permanent }): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (permanent) {
                    await this.api.request({ a: "d", n: nodeId });
                } else {
                    await this.move({ nodeId, target: this.ID_TRASH });
                }
            } catch (err) {
                reject(err);
            }

            resolve();
        });
    }
    //OK
    public move({ nodeId, target }): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.api.request({ a: "m", n: nodeId, t: target });
            } catch (err) {
                reject(err);
            }
            resolve();
        });
    }
    //OK
    public update({
        name,
        nodeId,
        properties,
    }: {
        name?: string;
        nodeId?: string;
        properties?: any;
    }): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let file = await this.get({ name, nodeId });
            let { tags } = properties
            try {

                // uniquify array tags if exists
                tags && (properties.tags = uniq(file.properties.tags.concat(tags)))

                let newProperties = Object.assign(file.properties, properties)
                let unparsed = Properties.unparse(newProperties)
                let packed = Properties.pack(unparsed);
                getCipher(file.key).encryptCBC(packed);

                // making request
                await this.api.request({ a: "a", n: file.nodeId, at: e64(packed) });


                resolve()
            } catch (err) {
                reject(err)
            }
        });
    }
    public shortcut({ name, nodeId }: { name?: string; nodeId?: string }, { parent, props }: any): Promise<void> {
        return new Promise(async (resolve) => {
            /* onclick redirects to folder */
            let fileSource: Schema$File = await this.get({ name, nodeId })
            await this.get({ name: props })

            let uid = fileSource.properties.uid;
            let regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
            if (!(regex.test(uid)) || !uid) {
                console.log("generating new uid, matched is not valid or dont exists")
                uid = v4()
                this.emit("action", "ADDING UID TO FILE SOURCE")
                await this.update({ nodeId: fileSource.nodeId, properties: { uid } })
            }

            let key = randomBytes(16);

            let properties = {
                n: props.name || fileSource.name,
                target: { uid },
                ...props
            }

            this.emit("action", "SAVING UID IN TARGET SHORTCUT")

            let resp = await this.api.request({
                a: "p",
                t: parent || this.ID_ROOT_FOLDER,
                n: [
                    {
                        h: "xxxxxxxx",
                        t: 1,
                        a: e64(getCipher(key).encryptCBC(Properties.pack(properties))),
                        k: e64(this.KEY_AES.encryptECB(key)),
                    },
                ],
            });
            this.compose(resp.f[0]);
            resolve()
        })
    }
    find({ path }) {

    }
    //OK
    public export({ name, nodeId }) {
        return new Promise(async (resolve) => {
            let shareKey: Buffer
            let file = await this.get({ name, nodeId });
            /*    if (isDir) {
                   this.shareFolder(options, cb)
                 } */
            if (file.isDir) {
                shareKey = randomBytes(16)
                this.shareKeys[file.nodeId] = shareKey
                const cr = makeCryptoRequest(this, file)
                const params = {
                    a: 's2',
                    n: file.nodeId,
                    s: [{ u: 'EXP', r: 0 }],
                    ok: e64(this.KEY_AES.encryptECB(Buffer.from(shareKey))),
                    ha: e64(this.KEY_AES.encryptECB(Buffer.from(file.nodeId + file.nodeId))),
                    cr
                }

                await this.api.request(params)
            }
            let id = await this.api.request({ a: 'l', n: file.nodeId })
            let url = `https://mega.nz/${file.isDir ? 'folder' : 'file'}/${id}#${e64(shareKey || file.key)}`
            console.log(url)
            resolve(url)
        })
    }
    public unexport({ name, nodeId }) {
        return new Promise(async (resolve) => {
        })
    }
    async import({ nodeId, url }: { nodeId?: string; url: string }) {

        let self = this
        function prepareRequest(source: Schema$File, ph: Boolean = false) {
            let cipher = getCipher(source.key)
            let packedProperties = Properties.pack(source.properties)
            let publicHandle = source.downloadId
            let req: any = {
                h: Array.isArray(publicHandle) ? publicHandle[1] : publicHandle,
                t: source.isDir ? 1 : 0,
                a: e64(cipher.encryptCBC(packedProperties)),
                k: e64(self.KEY_AES.encryptECB(source.key))
            }
            ph && (req.h = req.ph)
            return req
        }
        let urlData = Url.parse(url)
        let source = await this.loadAttributes(urlData)
        console.log(urlData)
        const request: any = urlData.isDir ? {
            a: 'p',
            t: nodeId || this.ID_ROOT_FOLDER,
            n: source.map((file: Schema$File) => prepareRequest(file)),
            sm: 1,
            v: 3
        } : {
            a: 'p',
            t: nodeId || this.ID_ROOT_FOLDER,
            n: prepareRequest(source, true)
        }

        if (this.shareKeys && this.shareKeys.length) {
            request.cr = makeCryptoRequest(this, source[0]);
        }


        console.log(request)
        await this.api.request(request)
    }
    async loadAttributes({ isDir, downloadId, file, key }): Promise<any> {

        return new Promise(async (resolve, reject) => {
            const req = isDir ? {
                a: 'f',
                c: 1,
                ca: 1,
                r: 1,
            } : {
                a: 'g',
                p: downloadId
            }

            let response = await this.api.customRequest(req, { n: downloadId })
            if (isDir) {
                let nodes = response.f
                let rootFolder = nodes.find(node => node.k && node.h === node.k.split(':')[0])
                let aes = key ? new AES(key) : null
                let folder = await Properties.loadMetadata(rootFolder, aes)
                let filesSource: Schema$File[] = [{ ...folder, downloadId }]
                for (let file of nodes) {
                    if (file === rootFolder) continue
                    let childFile = Properties.loadMetadata(file, aes)
                    childFile.downloadId = downloadId
                    filesSource.push(childFile)
                }
                resolve(filesSource)

            } else {
                let properties = Properties.decrypt(response.at, key)

                resolve({
                    size: response.s,
                    key,
                    isDir: false,
                    properties
                })
            }
        })


    }
}


function makeCryptoRequest(files, sources, shares?: any) {
    function selfAndChildren(file, files) {
        return [file].concat(files.list(file.nodeId).map((e) => e.isDir ? selfAndChildren(e, files) : e)).reduce((arr, el) => arr.concat(el), [])

    }
    function getShares(shareKeys, node) {
        const handle = node.nodeId
        const parent = node.parent
        const shares = []

        if (shareKeys[handle]) {
            shares.push(handle)
        }

        return parent
            ? shares.concat(getShares(shareKeys, parent))
            : shares
    }
    const shareKeys = files.shareKeys

    if (!Array.isArray(sources)) {
        sources = selfAndChildren(sources, files)
    }


    console.log(files.shareKeys)

    if (!shares) {
        shares = sources
            .map(source => getShares(shareKeys, source))
            .reduce((arr, el) => arr.concat(el))
            .filter((el, index, arr) => index === arr.indexOf(el))
    }
    const cryptoRequest = [
        shares,
        sources.map(node => node.nodeId),
        []
    ]

    // TODO: optimize - keep track of pre-existing/sent keys, only send new ones
    for (let i = shares.length; i--;) {
        const aes = new AES(shareKeys[shares[i]])
        console.log(shareKeys[shares[i]])

        for (let j = sources.length; j--;) {
            console.log(sources[j])
            const fileKey = Buffer.from(sources[j].key)

            if (fileKey && (fileKey.length === 32 || fileKey.length === 16)) {
                cryptoRequest[2].push(i, j, e64(aes.encryptECB(fileKey)))
            }
        }
    }

    return cryptoRequest
}

class Url {
    static parse(url) {
        url = parse(url);
        if (url.path.match(/\/(file|folder)\//) !== null) {
            // new format
            let [key, file] = url.hash.substr(1).split("/file/");
            let downloadId = url.path.substring(
                url.path.lastIndexOf("/") + 1,
                url.path.length + 1
            );

            let isDir = url.path.indexOf("/folder/") >= 0;
            console.log(key, "from static url")
            return { key: d64(key), file, downloadId, isDir };
        } else {
            // old format
            let [isDir, downloadId, key, file] = url.hash.split("!");
            return { key, file, downloadId, isDir };
        }
    }
}

function searchByName(data: Schema$File[], name: string): Schema$File {
    return data.find(e => name === e?.properties?.name)
}

function searchByNode(data: Schema$File[], nodeId: string): Schema$File {
    return data.find(e => nodeId === e.nodeId)
}




class DarkFiles extends Files {
    constructor(context) {
        super(context)
    }

    /* 
        tags(nodeId: string, tags: string[]){
            return new Promise(async(resolve)=>{
    
                let properties = {
                    tags: 
                }
                this.update({nodeId, })
            })
        } */
}