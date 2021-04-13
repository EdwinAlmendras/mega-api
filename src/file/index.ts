/* eslint-disable require-jsdoc */
/* eslint-disable no-async-promise-executor */
import tiktok, { Options as TikTokOptions } from "tiktok-scraper";
import { randomBytes } from "crypto";
import { GenericObject, Schema$File, Schema$Properties, Schmea$ApiFile } from "../types";
import Api from "../api";
import { s2b } from "../utils";
import Properties from "./properties";
import axios, { AxiosResponse } from "axios";
import { PassThrough } from "stream";
import * as megaCrypto from "../crypto";
import { parse } from "url";
import { v4 } from "uuid";
import { uniq } from "lodash";
import { Params$GetData } from "../types";
import EventEmitter from "events";
import path, { basename } from "path";
// import {pipeline} from "stream";
import { Readable } from "stream";
import { createWriteStream } from "fs";
import { Stream } from "node:stream";
const KEY_CACHE = {};
const hashes = [];
const { e64,
  formatKey,
  AES,
  getCipher,
  createDecrypterStream,
  constantTimeCompare,
  d64,
  createEncrypterStream } = megaCrypto;
const TYPE_FILE_DATA = ["file", "thumbnail", "preview"];


interface Params$Tiktok { user?: string; hashtag?: string; music?: string }
/**
 * Class uploader - return instance upload - for upload any into folder
 */
export class Uploader {
  api: Api
  FOLDER_ROOT: string
  // eslint-disable-next-line require-jsdoc
  constructor(context: { api: Api, FOLDER_ROOT: string }) {
    this.api = context.api;
    this.FOLDER_ROOT = context.FOLDER_ROOT;
  }

  /**
   * tiktok - upload every in mega account easy
   * @param {Object} param0
   * @param {Object} options
   */
  async tiktok({ user, hashtag, music }: Params$Tiktok, options: TikTokOptions): Promise<void> {
    let response: tiktok.Result;
    if (user) {
      response = await tiktok.user(user, options);
    } else if (hashtag) {
      response = await tiktok.hashtag(user, options);
    } else if (music) {
      response = await tiktok.user(user, options);
    }
    for await (const video of response.collector) {

    }
  }
}


/**
 * Main class files for every purpose file
 */
export default class Files extends EventEmitter {
  private ID_ROOT_FOLDER: string;
  private ID_TRASH: string;
  private ID_INBOX: string;
  private KEY_AES: AES;

  private shareKeys: GenericObject; // { BUffer}
  private data: Schema$File[]
  protected api: Api

  private readonly user: string;
  private readonly name: string


  /**
   * Constructor
   * @param {Object} context create a instance for Files
   */
  constructor(context: {
    KEY_AES: AES;
    user: string;
    name: string;
  }) {
    super();
    Object.assign(this, context);
  }

  /**
   * fetch fetch all mount files for user storage
   * @return {null}
   */
  public fetch(): Promise<Schema$File[]> {
    return new Promise(async (resolve, reject) => {
      this.data = [];

      let response: { ok: { h: string; ha: string; k: string; }[], f: Schmea$ApiFile[] };
      try {
        response = await this.api.request({
          a: "f",
          c: 1,
        });
      } catch (error) {
        reject(error);
      }
      const { ok, f } = response;

      this.shareKeys = ok.reduce((shares, share) => {
        const handler = share.h;
        const auth = this.KEY_AES.encryptECB(Buffer.from(handler + handler, "utf8"));
        console.log(share, auth, handler);

        if (constantTimeCompare(formatKey(share.ha), auth)) {
          shares[handler] = this.KEY_AES.decryptECB(formatKey(share.k));
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
  private compose(f) {
    if (!this.data.find((e) => e.nodeId === f.h)) {
      const file = this.parse(f);
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
        if (id === this.user) {
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
    const key = formatKey(parts[parts.length - 1]);
    metadata.key = aes ? aes.decryptECB(key) : this.KEY_AES.decryptECB(key);
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
  public get({ nodeId, name, parent }: { nodeId?: string; name?: string; parent?: string }): Schema$File {
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
   * Downloads files with nodeId to dest path
   * @param {Object}
   * @returns {string}
  */
  public donwload({ nodeId, filePath, options }:
    { nodeId: string; filePath?: string; options?: { silent: boolean; highWaterMark: number } }):
    Promise<string> {
    return new Promise(async (resolve, reject) => {
      options ||= {
        silent: true,
        highWaterMark: 128 * 1024,
      };

      const { highWaterMark, silent } = options;
      let progress = 0;
      const stream: Readable = await this.getData({ nodeId });
      const { properties, size } = this.get({ nodeId });
      const dirPath = path.join(__dirname, "..", "..", "downloads");
      filePath ||= `${dirPath}/${properties.name}`;
      const writable = createWriteStream(filePath, { highWaterMark });
      stream
          .pipe(writable)
          .on("end", () => {
            resolve(filePath);
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("data", (d) => {
            progress += d.length;
            if (process.stdout.isTTY) {
              if (!silent) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`Downloaded ${progress} bytes`);
              }
              this.emit("progress", {
                donwloaded: progress,
                totalSize: size,
                porcentageDownloaded: (progress * 100) / Number(size),
              });
            }
          });
    });
  }

  /**
   * Upload, uploads a file, url, path, stream
   * @param {Object} params
   * @returns {Schema$File}
   */
  public upload(params): Promise<Schema$File> {
    return new Promise(async (resolve, reject) => {
      let {
        path,
        stream,
        properties,
        name,
        url,
        targetId,
        key,
        thumbnail,
        preview,
        size,
        options,
      } = params;
      // eslint-disable-next-line prefer-promise-reject-errors
      if (!name && !properties && stream) Promise.reject("Filename is required for upload streams");
      if (!name && path) name = basename(path);
      if (!name && url) {
        name = (await axios.get(url)).headers["content-disposition"].split("filename=")[1];
      }
      properties ||= {
        name,
      };
      key ||= randomBytes(24);
      const encrypter = createEncrypterStream(key, { start: 0 });
      if (stream) {
      }
      const folder = this.get({ nodeId: targetId });
      const passtrougth = new PassThrough();
      stream.pipe(encrypter).pipe(passtrougth);
      const { hash, type } = await this._upload({
        stream: passtrougth,
        size,
        options,
        type: TYPE_FILE_DATA.indexOf("file"),
      });
      finalizeUpload(hash, type);

      // eslint-disable-next-line require-jsdoc
      async function finalizeUpload(hash, type) {
        const checkError = Number(hash.toString());
        if (checkError < 0) reject('Server returned error ' + checkError + ' while uploading');
        hashes[type] = hash;
        if (thumbnail && !hashes[TYPE_FILE_DATA.indexOf("thumbnail")]) return;
        if (preview && !hashes[TYPE_FILE_DATA.indexOf("preview")]) return;
        if (!hashes[TYPE_FILE_DATA.indexOf("file")]) return;
        const propertiesPacked = Properties.pack(properties);
        getCipher(key).encryptCBC(propertiesPacked);
        const storedKey = Buffer.from(key);
        const fileObject: any = {
          h: e64(hashes[0]),
          t: TYPE_FILE_DATA.indexOf["file"],
          a: e64(propertiesPacked),
          k: e64(this.KEY_AES.encryptECB(storedKey)),
        };
        if (hashes.length !== 1) fileObject.fa = hashes.slice(1).map((hash, index) => index + '*' + e64(hash)).filter((e) => e).join('/');
        const request: any = {
          a: 'p',
          t: folder.nodeId,
          n: [fileObject],
        };
        const shares = getShares(this.shareKeys, folder);
        if (shares.length > 0) {
          request.cr = makeCryptoRequest(this.storage, [{
            nodeId: fileObject.h,
            key: key,
          }], shares);
        }

        const response = await this.api.request(request);
        const file = this.compose(response.f[0]);
        this.emit('add', file);
        stream.emit('complete', file);
        resolve(file);
      }
    });
  }

  /**
   * Helper function upoad thumbnail file or preview
   * @param param0
   * @returns
   */
  protected _upload({ stream, size, options, type }:
    { stream: Stream; size: number; options?: any; type?: number
    }): Promise<{ hash: string; type: string}> {
    return new Promise(async(resolve, reject) => {
      const ssl = options.forceHttps ? 2 : 0;

      let { initialChunkSize, chunkSizeIncrement, maxChunkSize, maxConnections } = options;

      initialChunkSize ||= type === 0 ? 128 * 1024 : size;
      initialChunkSize ||= 128 * 1024;
      maxChunkSize ||= 1024 * 1024;
      maxConnections ||= 4;

      let currentChunkSize = initialChunkSize;
      let activeConnections = 0;
      let isReading = false;
      let position = 0;
      let remainingBuffer;
      let uploadBuffer; let chunkSize; let chunkPos;

      const urlRequqest: any = type === 0 ?
        {
          a: 'u',
          ssl,
          s: size,
          ms: 0,
          r: 0,
          e: 0,
          v: 2,
        } :
        {
          a: 'ufa',
          ssl,
          s: size,
        };

      if (options.handle) urlRequqest.h = options.handle;

      const response = await this.api.request(urlRequqest);
      const uploadURL = response.p;
      await handleChunk();

      // eslint-disable-next-line require-jsdoc
      async function handleChunk() {
        chunkSize = Math.min(currentChunkSize, size - position);
        uploadBuffer = Buffer.alloc(chunkSize);
        activeConnections++;
        if (currentChunkSize < maxChunkSize) currentChunkSize += chunkSizeIncrement;
        chunkPos = 0;

        if (remainingBuffer) {
          remainingBuffer.copy(uploadBuffer);
          chunkPos = Math.min(remainingBuffer.length, chunkSize);
          remainingBuffer = remainingBuffer.length > chunkSize ?
            remainingBuffer.slice(chunkSize) :
            null;
        }

        // It happens when the remaining buffer contains the entire chunk
        if (chunkPos === chunkSize) {
          sendChunk();
        } else {
          isReading = true;
        }
      }

      // eslint-disable-next-line require-jsdoc
      async function sendChunk() {
        let response;
        try {
          response = await this.api.axios({
            url: uploadURL + '/' + (type === 0 ? position : (type - 1)),
            method: "POST",
            data: uploadBuffer,
          });
        } catch (error) {
          reject(error);
        }

        const { headers, status } = response;

        if (status !== 200) stream.emit('error', Error('MEGA returned a ' + response.statusCode + ' status code'));
        uploadBuffer = null;
        position += chunkSize;

        console.log("data", response.data);

        const hash = response.data;

        if (hash.length > 0) {
          resolve(hash);
        } else if (position < size && !isReading) {
          handleChunk();
        }

        if (position < size && !isReading && activeConnections < maxConnections) {
          handleChunk();
        }
      }

      let sizeCheck = 0;
      stream.on('data', (data) => {
        sizeCheck += data.length;
        stream.emit('progress', {
          bytesLoaded: sizeCheck,
          bytesTotal: size,
        });
        data.copy(uploadBuffer, chunkPos);
        chunkPos += data.length;
        if (chunkPos >= chunkSize) {
          isReading = false;
          remainingBuffer = data.slice(data.length - (chunkPos - chunkSize));
          sendChunk();
        }
      });

      stream.on('end', () => {
        if (size && sizeCheck !== size) stream.emit('error', Error('Specified data size does not match: ' + size + ' !== ' + sizeCheck));
      });
    }));
  }

  protected async _uploadAttributes({ type, data, key, options }) {
    if (data.pipe === "function") data = await s2b(data);
    const len = data.length;
    const rest = Math.ceil(len / 16) * 16 - len;

    if (rest !== 0) {
      data = Buffer.concat([data, Buffer.alloc(rest)]);
    }

    const encrypter = opt.handle ?
      getCipher(key) :
      new AES(key.slice(0, 16));
    encrypter.encryptCBC(data);


    this._upload({
      stream: data,
      size: data.length,
      type,
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
        a: e64(getCipher(key).encryptCBC(Properties.pack({
          n: name,
          ...properties,
        }))),
        k: e64(this.KEY_AES.encryptECB(key)),
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
        const nodeId = await this.exists(dirname);
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
  public isDir(nodeId) {
    const { isDir } = this.data.find((e) => e.nodeId === nodeId);
    return isDir;
  }
  // OK
  public delete({ nodeId, permanent }): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (permanent) {
          await this.api.request({
            a: "d",
            n: nodeId,
          });
        } else {
          await this.move({
            nodeId,
            target: this.ID_TRASH,
          });
        }
      } catch (err) {
        reject(err);
      }

      resolve();
    });
  }
  // OK
  public move({ nodeId, target }): Promise<void> {
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
        getCipher(file.key).encryptCBC(packed);

        // making request
        await this.api.request({
          a: "a",
          n: file.nodeId,
          at: e64(packed),
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
            a: e64(getCipher(key).encryptCBC(Properties.pack(properties))),
            k: e64(this.KEY_AES.encryptECB(key)),
          },
        ],
      });
      this.compose(resp.f[0]);
      resolve();
    });
  }
  public export({ name, nodeId }) {
    return new Promise(async (resolve) => {
      let shareKey: Buffer;
      const file = await this.get({
        name,
        nodeId,
      });
      /*    if (isDir) {
                 this.shareFolder(options, cb)
               } */
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
          ok: e64(this.KEY_AES.encryptECB(Buffer.from(shareKey))),
          ha: e64(this.KEY_AES.encryptECB(Buffer.from(file.nodeId + file.nodeId))),
          cr,
        };

        await this.api.request(params);
      }
      const id = await this.api.request({
        a: "l",
        n: file.nodeId,
      });
      const url = `https://mega.nz/${file.isDir ? "folder" : "file"}/${id}#${e64(shareKey || file.key)}`;
      resolve(url);
    });
  }
  public unexport({ name, nodeId }) {
    return new Promise(async (resolve) => {
    });
  }
  async import({ nodeId, url }: { nodeId?: string; url: string }) {
    const self = this;
    function prepareRequest(source: Schema$File, ph = false) {
      const cipher = getCipher(source.key);
      const packedProperties = Properties.pack(source.properties);
      const publicHandle = source.downloadId;
      const req: any = {
        h: Array.isArray(publicHandle) ? publicHandle[1] : publicHandle,
        t: source.isDir ? 1 : 0,
        a: e64(cipher.encryptCBC(packedProperties)),
        k: e64(self.KEY_AES.encryptECB(source.key)),
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
  }
  async loadAttributes({ isDir, downloadId, file, key }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const req = isDir ? {
        a: "f",
        c: 1,
        ca: 1,
        r: 1,
      } : {
        a: "g",
        p: downloadId,
      };

      const response = await this.api.customRequest(req, { n: downloadId });
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
function makeCryptoRequest(files, sources, shares?: any) {
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
        cryptoRequest[2].push(i, j, e64(aes.encryptECB(fileKey)));
      }
    }
  }

  return cryptoRequest;
}

class Url {
  static parse(url) {
    url = parse(url);
    if (url.path.match(/\/(file|folder)\//) !== null) {
      // new format
      const [key, file] = url.hash.substr(1).split("/file/");
      const downloadId = url.path.substring(
          url.path.lastIndexOf("/") + 1,
          url.path.length + 1,
      );

      const isDir = url.path.indexOf("/folder/") >= 0;
      console.log(key, "from static url");
      return {
        key: d64(key),
        file,
        downloadId,
        isDir,
      };
    } else {
      // old format
      const [isDir, downloadId, key, file] = url.hash.split("!");
      return {
        key,
        file,
        downloadId,
        isDir,
      };
    }
  }
}

function searchByName(data: Schema$File[], name: string): Schema$File {
  return data.find((e) => name === e?.properties?.name);
}

function searchByNode(data: Schema$File[], nodeId: string): Schema$File {
  return data.find((e) => nodeId === e.nodeId);
}


/* class DarkFiles extends Files {
  constructor(context) {
    super(context);
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
} */


