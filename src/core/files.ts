import { randomBytes } from "crypto";
import {
  GenericObject,
  Schema$File,
  Schema$Properties,
  Params$GetData,
} from "../types";
import * as Types from "../types";
import { MegaClient } from "./";
import Properties from "./properties";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { PassThrough } from "stream";
import { v4 } from "uuid";
import { uniq } from "lodash";
import EventEmitter from "events";
import { MegaApiClient } from "./api";
import {
  base64,
  AES,
  getCipher,
  createDecrypterStream,
  constantTimeCompare,
} from "../crypto";
import { headers } from "../helpers";

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
export default class Files extends EventEmitter {
  public folderIds: {
    root: string;
    trash: string;
    inbox: string;
  } = { root: "", trash: "", inbox: ""};
  public shareKeys: GenericObject; // { BUffer}
  public data: Schema$File[] = [];
  private KEY_AES: AES;
  private api: MegaApiClient;
  constructor(protected client: MegaClient) {
    super();
    this.KEY_AES = this.client.state.KEY_AES;
    this.api = this.client.api;
  }
  public async fetch(): Promise<Schema$File[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: { ok: { h: string; ha: string; k: string }[]; f: any[] };

    try {
      response = await this.client.api.request({
        a: "f",
        c: 1,
      });
    } catch (error) {
      return Promise.reject(error);
    }

    const { f } = response;

    this.shareKeys = response.ok.reduce((shares, share) => {
      const handler = share.h;
      const auth = this.client.state.KEY_AES.encrypt.ecb(
        Buffer.from(handler + handler, "utf8")
      );
      // console.log(share, auth, handler);
      if (constantTimeCompare(base64.decrypt(share.ha), auth)) {
        shares[handler] = this.client.state.KEY_AES.decrypt.ecb(
          base64.decrypt(share.k)
        );
      }
      return shares;
    }, {});

    for await (const file of f) {
      this.compose(file);
    
    }
console.log("findish")
    return Promise.resolve(this.data);
  }

  /**
   * Compose - compons file decrypting and mounting in this.data object
   * @param {Object} f
   * @returns {void}
   */
  public compose(f): Schema$File {
    const fileExists = this.data.find((e) => e?.nodeId === f.h);
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
      return file
      
    }
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

    // Adding thumbnails links '835:1*1Kp8_ha2_fU/835:0*dxCWLWRUSXI"
    if (f.fa) metadata.thumbs = f.fa;
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
    metadata.key = aes
      ? aes.decrypt.ecb(key)
      : this.client.state.KEY_AES.decrypt.ecb(key);
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
   * Get - gets a file data by name or nodeid
   * @param {Object}
   * @returns {Schema$File}
   */
  public get({ nodeId, name, parent }: Types.Params$Get): Schema$File {
    if (nodeId) {
      if (parent) {
        searchByName(
          this.data.filter((e) => e.parent === parent),
          name
        );
      }
      return searchByNode(this.data, nodeId);
    } else if (name) {
      return searchByName(this.data, name);
    }
  }
  /**
   * Gets data from file, customizable with responseType oprion
   * @param {Object}
   * @returns {AxiosResponse["data"]}
   */
  public async getSource({
    nodeId,
    config,
    useSSL,
    range,
    url,
  }: Params$GetData): Promise<AxiosResponse["data"]> {
    const file = this.get({ nodeId });
    const defaultConfigAxios: AxiosRequestConfig = { responseType: "stream" };
    const configAxios = config || defaultConfigAxios;

    let downloadUrl;
    if (!url) {
      console.log("dont found url")
      // Made request of the file
      const response = await this.api.request({
        a: "g",
        g: 1,
        n: nodeId,
        ssl: useSSL ? 1 : 0,
      });
      downloadUrl = response.g;
    }

    const startRange = range?.start || 0;
    const endRange = range?.end || String(file.size);
    const urlRange = `${downloadUrl}/${startRange}-${endRange}`;

    let response: AxiosResponse;

    try {
      response = await this.api.axios.get(urlRange, configAxios);
    } catch (error) {
      return Promise.reject(error);
    }

    if (configAxios.responseType === "stream") {
      const stream = new PassThrough();

      const descrypter = createDecrypterStream(file.key);

      response.data.pipe(descrypter).pipe(stream);

      return Promise.resolve(stream);
    } else {
      // TODO PENDIG DECRUPTING BUFFER OR ANY OTHER DATA

      return Promise.resolve(response.data);
    }
  }

  public async getThumbs({
    nodes,
    previewType,
  }): Promise<{ nodeId: string; data: Buffer }[]> {
    const previewTypes = {
      thumbnail: 1,
      preview: 0,
    };

    const getThumbsIds = (file): [string, string] =>
      file.thumbs.split("/")[1].split("*");

    const files = nodes.map((nodeId) => this.get({ nodeId }));
    const type = previewTypes[previewType];

    const requestData = files.map((file) => {
      console.log(getThumbsIds(file))
      return {
        a: "ufa",
        fah: (getThumbsIds(file))[1],
        r: 1,
        ssl: 0,
      };
    });

    console.log(requestData)
    const response = await this.api.custom({ data: requestData });

    let thumbs = [];

    for await (const [index, item] of response.entries()) {
      console.log(item)
      const url = `${item.p}/${type}`;
      const file = files[index];
      const hash = base64.decrypt(getThumbsIds(file)[1]);

      const { data } = await axios({
        url,
        method: "POST",
        data: hash,
        responseType: "arraybuffer",
        headers: headers.requestThummbnail,
      });

      const aes = getCipher(file.key);
      const dataNormalized = data.slice(12, data.length);
      const bufferThumb = aes.decrypt.cbc(dataNormalized);
      thumbs.push({
        nodeId: file.nodeId,
        data: bufferThumb,
      });
    }

    return Promise.resolve(thumbs);
  }
  /**
   * Get the thumbnail buffer
   * @param {nodeId} node Id handle file
   * @returns {Promise}
   */
  public async getThumbnail({ nodeId }: { nodeId: string }): Promise<Buffer> {
    const file = this.get({ nodeId });

    const thumbId2 = file.thumbs.split("/")[1].split("*")[1];

    const { p: thumbUrl } = await this.api.request({
      a: "ufa",
      fah: thumbId2,
      r: 1,
      ssl: 1,
    });

    const hash = base64.decrypt(thumbId2);

    const url = thumbUrl + "/0";

    try {
      const { data } = await axios({
        url,
        method: "POST",
        data: hash,
        responseType: "arraybuffer",
        headers: headers.requestThummbnail,
      });

      const aes = getCipher(file.key);

      const thumb = aes.decrypt.cbc(data.slice(12, data.length));

      return Promise.resolve(thumb);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * List files by nodeId
   * @param {Object}
   * @returns {Schema$File[]}
   */
  public list({
    folderId,
    onlyFolders,
  }: {
    folderId?: string;
    onlyFolders?: boolean;
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

  public getByPath({ path }: { path: string }): Promise<Schema$File> {
    // PATH LIKE personal/2019/fabruary
    const routes = path.split("/");
    let currentFile;
    routes.forEach((route) => {
      currentFile = this.list({
        folderId: currentFile?.nodeId || this.client.state.ID_ROOT_FOLDER,
      }).find((e) => e.properties.name === route);
    });
    if (!currentFile) Promise.reject(new Error("DONT MATCH THIS MATH"));
    return Promise.resolve(currentFile);
  }
  /**
   * Creates new directorie in mount
   * @param {Object} options
   * @returns {Promise}
   */
  public makedir(options: {
    name: string;
    parent: string;
    parentName?: string;
    properties?: Schema$Properties;
  }): Promise<Schema$File> {
    return new Promise(async (resolve) => {
      const { name, parent, parentName, properties } = options;

      const t: string =
        parent ||
        (await this.get({ name: parentName })).parent ||
        this.client.state.ID_ROOT_FOLDER;
      const key = randomBytes(16);
      const node = [
        {
          h: "xxxxxxxx",
          t: 1,
          a: base64.encrypt(
            getCipher(key).encrypt.cbc(
              Properties.pack({
                n: name,
                ...properties,
              })
            )
          ),
          k: base64.encrypt(this.client.state.KEY_AES.encrypt.ecb(key)),
        },
      ];

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
  public rdir({
    path,
    parent,
  }: {
    path?: string;
    parent?: string;
  }): Promise<void> {
    return new Promise(async (resolve) => {
      const dirs = path.split("/");
      if (!parent) parent = this.client.state.ID_ROOT_FOLDER;
      for await (const dirname of dirs) {
        const handler = this.get({ name: dirname });
        if (handler) {
          parent = handler.nodeId;
          continue;
        }
        const folder = await this.makedir({
          name: dirname,
          parent,
        });
        parent = folder.nodeId;
      }
      resolve();
    });
  }

  public search(text: string): Schema$File[] {
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
    if (files.length === 0) return null;
    return files;
  }
  // OK
  public exists(name: string): boolean {
    for (const filesId in this.data) {
      if (!this.data[filesId].name) continue;
      if (this.data[filesId].name.includes(name)) {
        return true;
      }
    }
    return false;
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
  public async delete({
    nodeId,
    permanent,
  }: {
    nodeId: string;
    permanent?: boolean;
  }): Promise<void> {
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
        target: this.client.state.ID_TRASH,
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
  // OK
  public move({
    nodeId,
    target,
  }: {
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
  public async update({ nodeId, properties }: Types.Params$Update): Promise<void> {
    const file = this.get({ nodeId });
    try {
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

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Exports a file or folder by nodeId
   * @param {{ name, nodeId }} params
   * @returns {Promise<string>} url
   */
  public async export({ nodeId }: { nodeId: string }): Promise<string> {
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
          s: [
            {
              u: "EXP",
              r: 0,
            },
          ],
          ok: base64.encrypt(this.KEY_AES.encrypt.ecb(Buffer.from(shareKey))),
          ha: base64.encrypt(
            this.KEY_AES.encrypt.ecb(Buffer.from(file.nodeId + file.nodeId))
          ),
          cr,
        };

        await this.api.request(params);
      }
      const id = await this.api.request({
        a: "l",
        n: file.nodeId,
      });

      const url = `https://mega.nz/${
        file.isDir ? "folder" : "file"
      }/${id}#${base64.encrypt(shareKey || file.key)}`;
      return Promise.resolve(url);
    } catch (error) {
      Promise.reject(error);
    }
  }

  async loadAttributes({
    isDir,
    downloadId,
    key,
  }: GenericObject): Promise<GenericObject> {
    return new Promise(async (resolve) => {
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

      const response = await this.api.custom({
        data: req,
        params: {
          n: downloadId,
        },
      });
      if (isDir) {
        const nodes = response[0].f;
        const rootFolder = nodes.find(
          (node) => node.k && node.h === node.k.split(":")[0]
        );
        const aes = key ? new AES(key) : null;
        const folder = await Properties.loadMetadata(rootFolder, aes);
        const filesSource: Schema$File[] = [
          {
            ...folder,
            downloadId,
          },
        ];
        for (const file of nodes) {
          if (file === rootFolder) continue;
          const childFile = Properties.loadMetadata(file, aes);
          childFile.downloadId = downloadId;
          filesSource.push(childFile);
        }
        resolve(filesSource);
      } else {
        const properties = Properties.decrypt(response[0].at, key);

        resolve({
          size: response[0].s,
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
  return [file]
    .concat(
      files
        .list(file.nodeId)
        .map((e) => (e.isDir ? selfAndChildren(e, files) : e))
    )
    .reduce((arr, el) => arr.concat(el), []);
}
function getShares(shareKeys: Files["shareKeys"], node: Schema$File) {
  const handle = node.nodeId;
  const parent = node.parent;
  const shares = [];

  if (shareKeys[handle]) {
    shares.push(handle);
  }

  return parent ? shares.concat(getShares(shareKeys, parent as any)) : shares;
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
  const cryptoRequest = [shares, sources.map((node) => node.nodeId), []];

  // TODO: optimize - keep track of pre-existing/sent keys, only send new ones
  for (let i = shares.length; i--; ) {
    const aes = new AES(shareKeys[shares[i]]);
    console.log(shareKeys[shares[i]]);

    for (let j = sources.length; j--; ) {
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
