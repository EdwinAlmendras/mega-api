/* eslint-disable require-jsdoc */
/* eslint-disable no-async-promise-executor */
import { randomBytes } from "crypto";
import { GenericObject, Schema$File, Schema$Properties } from "../types";
import { MegaClient } from "./";
import Properties from "./properties";
import { AxiosResponse } from "axios";
import { PassThrough } from "stream";
import { v4 } from "uuid";
import { uniq } from "lodash";
import { Params$GetData } from "../types";
import EventEmitter from "events";
// import {pipeline} from "stream";
import { MegaApiClient } from "./api";
const KEY_CACHE = {};
import { base64,
  AES,
  getCipher,
  createDecrypterStream,
  constantTimeCompare } from "../crypto";
// const TYPE_FILE_DATA = ["file", "thumbnail", "preview"];


interface Params$Tiktok { user?: string; hashtag?: string; music?: string }
/**
 * Class uploader - return instance upload - for upload any into folder
 */
export class Uploader {
  FOLDER_ROOT: string
  // eslint-disable-next-line require-jsdoc
  constructor(public client: MegaApiClient) {
  }

  /**
   * tiktok - upload every in mega account easy
   * @param {Object} param0
   * @param {Object} options
   */
/*   async tiktok({ user, hashtag, music }: Params$Tiktok, options: TikTokOptions): Promise<void> {
    let response: tiktok.Result;
    if (user) {
      response = await tiktok.user(user, options);
    } else if (hashtag) {
      response = await tiktok.hashtag(user, options);
    } else if (music) {
      response = await tiktok.user(user, options);
    }
    console.log(response);
    /*  for await (const {} of response.collector) {

    }
  } */
}


/**
 * Main class files for every purpose file
 */
export default class Files extends EventEmitter {
  public ID_ROOT_FOLDER: string;
  public ID_TRASH: string;
  public ID_INBOX: string;
  public shareKeys: GenericObject; // { BUffer}
  public data: Schema$File[];
  private KEY_AES: AES
  private api: MegaApiClient;
  constructor(private client: MegaClient) {
    super();
    this.KEY_AES = this.client.state.KEY_AES;
    this.api = this.client.api;
  }
  /**
   * fetch fetch all mount files for user storage
   * @return {null}
   */
  public fetch(): Promise<Schema$File[]> {
    return new Promise(async (resolve, reject) => {
      this.data = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: { ok: { h: string; ha: string; k: string; }[], f: any[] };
      try {
        response = await this.client.api.request({
          a: "f",
          c: 1,
        });
      } catch (error) {
        reject(error);
      }
      const { ok, f } = response;

      this.shareKeys = ok.reduce((shares, share) => {
        const handler = share.h;
        const auth = this.KEY_AES.encrypt.ecb(Buffer.from(handler + handler, "utf8"));
        console.log(share, auth, handler);

        if (constantTimeCompare(base64.decrypt(share.ha), auth)) {
          shares[handler] = this.KEY_AES.decrypt.ecb(base64.decrypt(share.k));
        }
        return shares;
      }, {});

      for await (const file of f) {
        this.compose(file);
      }
      resolve(this.data);
    });
  }

  /**
   * Compose - compons file decrypting and mounting in this.data object
   * @param {Object} f
   * @returns {void}
   */
  public compose(f) {
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
  private parse(f) {
    const metadata: Schema$File = {
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
            KEY_AES = KEY_CACHE[id] = new AES(shareKey);
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
  private loadMetadata(file, aes = null) {
    /* HANDLING FILE INFO */
    let metadata: Schema$File = {
      size: file.s || 0,
      createdTime: file.ts || 0,
      type: file.t,
      isDir: !!file.t,
      owner: file.u,
    };

    const parts = file.k.split(":");
    const key = base64.decrypt(parts[parts.length - 1]);
    metadata.key = aes ? aes.decrypt.ecb(key) : this.client.state.KEY_AES.decrypt.ecb(key);
    if (file.a) {
      const properties = Properties.decrypt(file.a, key);
      metadata = {
        ...metadata,
        properties,
      };
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
  public get({ nodeId, name, parent }: { nodeId?: string; name?: string; parent?: string }): Schema$File {
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
  public getData({
    nodeId,
    options,
    responseType,
  }: Params$GetData): Promise<AxiosResponse["data"]> {
    return new Promise(async (resolve, reject) => {
      const file = this.get({ nodeId });
      responseType ||= "stream";
      options ||= {
        ssl: 0,
        config: {
          responseType,
        },
      };
      const { ssl, config } = options;

      const { g }: { g: string } = await this.api.request({
        a: "g",
        g: 1,
        n: nodeId,
        ssl: ssl || 0,
      });

      let response: AxiosResponse;
      try {
        response = await this.api.axios.get(g, config);
      } catch (error) {
        reject(error);
      }

      if (config?.responseType === "stream" || responseType === "stream") {
        const stream = new PassThrough();
        const descrypter = createDecrypterStream(file.key);
        response.data.pipe(descrypter).pipe(stream);
        resolve(stream);
      } else {
        console.log("isnot stream");
        resolve(response.data);
      }
    });
  }


  /**
   * List files by nodeId
   * @param {Object}
   * @returns {Schema$File[]}
   */
  public list({ folderId, onlyFolders }: {
    folderId?: string;
    onlyFolders?: boolean
  }): Schema$File[] {
    // eslint-disable-next-line require-jsdoc
    function filterReducer(file) {
      if (onlyFolders) {
        if (file.parent === folderId && file.isDir) return true;
      } else {
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
  public dir(options: {
    name: string;
    parent: string;
    parentName?: string;
    properties?: Schema$Properties
  }): Promise<Schema$File> {
    return new Promise(async (resolve) => {
      const {
        name,
        parent,
        parentName,
        properties,
      } = options;

      const t: string = parent || (await this.get({ name: parentName })).parent || this.ID_ROOT_FOLDER;
      const key = randomBytes(16);
      const node = [{
        h: "xxxxxxxx",
        t: 1,
        a: base64.encrypt(getCipher(key).encrypt.cbc(Properties.pack({
          n: name,
          ...properties,
        }))),
        k: base64.encrypt(this.KEY_AES.encrypt.ecb(key)),
      }];


      const response = await this.api.request({
        a: "p",
        t,
        n: node,
      });
      const file = this.compose(response.f[0]);
      resolve(file);
    });
  }


  /**
   * Creates directory recursively
   * @example rdir("asd/daw/faadcs")
   * @param {Object}
   * @returns {void}
   */
  public rdir({ folderPath, parent }: { folderPath?: string; parent?: string }): Promise<void> {
    return new Promise(async (resolve) => {
      const dirs = folderPath.split("/");
      if (!parent) parent = this.ID_ROOT_FOLDER;
      for await (const dirname of dirs) {
        const { nodeId} = this.get({ name: dirname});
        if (nodeId) {
          parent = nodeId;
          continue;
        }
        const folder = await this.dir({
          name: dirname,
          parent,
        });
        parent = folder.nodeId;
      }

      resolve();
    });
  }

  public search(text: string): Promise<Schema$File[] | boolean> {
    return new Promise(async (resolve) => {
      const files = [];
      for (const filesId in this.data) {
        const { name, nodeId, createdTime, key, downloadId } = this.data[filesId];
        if (!name) continue;
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
      if (files.length === 0) resolve(false);
      resolve(files);
    });
  }
  // OK
  public exists(name: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      for (const filesId in this.data) {
        if (!this.data[filesId].name) continue;
        if (this.data[filesId].name.includes(name)) {
          resolve(true);
        }
      }
      resolve(false);
    });
  }
  public isDir(nodeId: string): boolean {
    const { isDir } = this.data.find((e) => e.nodeId === nodeId);
    return isDir;
  }
  /**
   * Deletes a file permanently or move to trash bin
   * @param {Object} params
   * @returns {Promise}
   */
  public async delete({ nodeId, permanent }: { nodeId: string; permanent?: boolean}): Promise<void> {
    if (permanent) {
      try {
        await this.api.request({
          a: "d",
          n: nodeId,
        });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    try {
      await this.move({
        nodeId,
        target: this.ID_TRASH,
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // OK
  public move({ nodeId, target }: {
    nodeId: string;
    target: string;
  }): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.api.request({
          a: "m",
          n: nodeId,
          t: target,
        });
      } catch (err) {
        reject(err);
      }
      resolve();
    });
  }
  // OK
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
      const file = await this.get({
        name,
        nodeId,
      });
      const { tags } = properties;
      try {
        // uniquify array tags if exists
        tags && (properties.tags = uniq(file.properties.tags.concat(tags)));

        const newProperties = Object.assign(file.properties, properties);
        const unparsed = Properties.unparse(newProperties);
        const packed = Properties.pack(unparsed);
        getCipher(file.key).encrypt.cbc(packed);

        // making request
        await this.api.request({
          a: "a",
          n: file.nodeId,
          at: base64.encrypt(packed),
        });


        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
  public shortcut({ name, nodeId }: { name?: string; nodeId?: string }, { parent, props }: any): Promise<void> {
    return new Promise(async (resolve) => {
      /* onclick redirects to folder */
      const fileSource: Schema$File = await this.get({
        name,
        nodeId,
      });
      await this.get({ name: props });

      let uid = fileSource.properties.uid;
      const regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      if (!(regex.test(uid)) || !uid) {
        console.log("generating new uid, matched is not valid or dont exists");
        uid = v4();
        await this.update({
          nodeId: fileSource.nodeId,
          properties: { uid },
        });
      }

      const key = randomBytes(16);

      const properties = {
        n: props.name || fileSource.name,
        target: { uid },
        ...props,
      };

      const resp = await this.api.request({
        a: "p",
        t: parent || this.ID_ROOT_FOLDER,
        n: [
          {
            h: "xxxxxxxx",
            t: 1,
            a: base64.encrypt(getCipher(key).encrypt.cbc(Properties.pack(properties))),
            k: base64.encrypt(this.KEY_AES.encrypt.ecb(key)),
          },
        ],
      });
      this.compose(resp.f[0]);
      resolve();
    });
  }

  /**
   * Exports a file or folder by nodeId
   * @param {{ name, nodeId }} params
   * @returns {Promise<string>} url
   */
  public async export({ nodeId }: { nodeId: string}): Promise<string> {
    let shareKey: Buffer;
    try {
      const file = await this.get({
        nodeId,
      });

      if (file.isDir) {
        shareKey = randomBytes(16);
        this.shareKeys[file.nodeId] = shareKey;
        const cr = makeCryptoRequest(this, file);
        const params = {
          a: "s2",
          n: file.nodeId,
          s: [{
            u: "EXP",
            r: 0,
          }],
          ok: base64.encrypt(this.KEY_AES.encrypt.ecb(Buffer.from(shareKey))),
          ha: base64.encrypt(this.KEY_AES.encrypt.ecb(Buffer.from(file.nodeId + file.nodeId))),
          cr,
        };

        await this.api.request(params);
      }
      const id = await this.api.request({
        a: "l",
        n: file.nodeId,
      });

      const url = `https://mega.nz/${file.isDir ? "folder" : "file"}/${id}#${base64.encrypt(shareKey || file.key)}`;
      return Promise.resolve(url);
    } catch (error) {
      Promise.reject(error);
    }
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
  async loadAttributes({ isDir, downloadId, key }: GenericObject): Promise<GenericObject> {
    return new Promise(async (resolve) => {
      const req = isDir ? {
        a: "f",
        c: 1,
        ca: 1,
        r: 1,
      } : {
        a: "g",
        p: downloadId,
      };

      const response = await this.api.custom({data: req,
        params: { n:
          downloadId}});
      if (isDir) {
        const nodes = response.f;
        const rootFolder = nodes.find((node) => node.k && node.h === node.k.split(":")[0]);
        const aes = key ? new AES(key) : null;
        const folder = await Properties.loadMetadata(rootFolder, aes);
        const filesSource: Schema$File[] = [{
          ...folder,
          downloadId,
        }];
        for (const file of nodes) {
          if (file === rootFolder) continue;
          const childFile = Properties.loadMetadata(file, aes);
          childFile.downloadId = downloadId;
          filesSource.push(childFile);
        }
        resolve(filesSource);
      } else {
        const properties = Properties.decrypt(response.at, key);

        resolve({
          size: response.s,
          key,
          isDir: false,
          properties,
        });
      }
    });
  }
}

function selfAndChildren(file, files) {
  // eslint-disable-next-line max-len
  return [file].concat(files.list(file.nodeId).map((e) => e.isDir ? selfAndChildren(e, files) : e)).reduce((arr, el) => arr.concat(el), []);
}
function getShares(shareKeys: Files["shareKeys"], node: Schema$File) {
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
function makeCryptoRequest(files: Files, sources: any, shares?: string[]) {
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
    const aes = new AES(shareKeys[shares[i]]);
    console.log(shareKeys[shares[i]]);

    for (let j = sources.length; j--;) {
      console.log(sources[j]);
      const fileKey = Buffer.from(sources[j].key);

      if (fileKey && (fileKey.length === 32 || fileKey.length === 16)) {
        cryptoRequest[2].push(i, j, base64.encrypt(aes.encrypt.ecb(fileKey)));
      }
    }
  }

  return cryptoRequest;
}

function searchByName(data: Schema$File[], name: string): Schema$File {
  return data.find((e) => name === e?.properties?.name);
}

function searchByNode(data: Schema$File[], nodeId: string): Schema$File {
  return data.find((e) => nodeId === e.nodeId);
}
