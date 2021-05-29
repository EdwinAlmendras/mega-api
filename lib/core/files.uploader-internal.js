"use strict";
/* import axios, { AxiosRequestConfig } from "axios";
import { AES, base64, createEncrypterStream, MegaEncrypt } from "../crypto";
import { Writable, WritableOptions } from "stream";
import { SSL, Uplaod$Params } from "types";
import { MegaClient } from "./";
import Properties from "./properties";
import { Readable } from "node:stream";
import { ERRORS } from "./constants";
export class UploaderInternal {
  constructor(private client: MegaClient) { }
  public async upload(params: Uplaod$Params): Promise<void> {
    const { url, properties, options } = params;
    const { key } = options;
    const { data, headers }: { data?: Readable, headers: AxiosRequestConfig["headers"] } = await this.client.api.axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    const size = headers["content-length"];
    const uploadUrl = await this.getUploadUrl({
      a: 'u',
      ssl: options?.ssl || 0,
      s: size,
      ms: 0,
      r: 0,
      e: 0,
      v: 2,
    });
    const encrypter = createEncrypterStream(options.key, { start: 0 });
    const uploader = new MegaUploadHandler({ url: uploadUrl, size });

    uploader.on("error", (error) => {
      // something wrong uplaoding into request
       console.log(error, "error is ")
      data.destroy(error);
      Promise.reject(error);
    });
    uploader.on("hash", async (hash: Buffer) => {
      console.log("hash is ", hash);
      const cipher = new AES(key);
      const params: Request$UploadFinish = {
        a: "p",
        t: this.client.state.ID_ROOT_FOLDER,
        n: [{
          a: base64.encrypt(cipher.encrypt.ecb(Properties.pack(properties))),
          // fa: string; // "0*lAUvN1dBIJ0/1*3JipjRQzzNQ"
          h: base64.encrypt(hash), // hash;
          k: base64.encrypt(cipher.encrypt.ecb(key)),
          t: 0,
        }],
      };
      const { f: file } = await this.client.api.request(params);
      this.client.files.compose(file);
      console.log("file", file);
      Promise.resolve(file);
    });

    data.pipe(encrypter).pipe(uploader);
  }
  private async getUploadUrl(params: RequestUrlFile | RequestUrlThumbs): Promise<string> {
    try {
      const response = await this.client.api.request(params);
      return Promise.resolve(response.p);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }
}
export type Action$RequestUrl = "u" | "ufa"
export type VersionAccount = 1 | 2
export interface RequestUrlFile {
  a: Action$RequestUrl,
  ssl: SSL,
  s: number,
  ms: number,
  r: number,
  e: number,
  v: VersionAccount,
}
export interface RequestUrlThumbs {
  a: Action$RequestUrl;
  ssl: SSL;
  s: number
}
export class MegaUploadHandler extends Writable {
  encrypter: MegaEncrypt;
  position = 0;
  initialChunkSize = 15844;
  currentChunkSize = this.initialChunkSize;
  constructor(private options: { url: string; size: number }, private config?: WritableOptions) {
    super(config);
  }
  async _write(chunk: Buffer, encoding: BufferEncoding, cb: (error?: Error | null) => void): Promise<void> {
    try {
      console.log(`upploadin in current url ${`${this.options.url}/${this.position}`}`);
      const { data: hash, headers, request } = await axios({
        method: "POST",
        data: chunk,
        url: `${this.options.url}/${this.position}`,
      });
      console.log(headers, request);
      console.log("hash", hash);
      if (Number(hash) < 0) {
        console.log("IS A BIG ERROR")
        this.emit("error", {
          "server_error": ERRORS[hash],
          "is_http_error": true,
          "url": `${this.options.url}/${this.position}`,
          "action": "uploading",
          "current_chunk_upload_size": chunk.length,
        });
      } else {
        this.emit("hash", hash);
      }
      this.position = Math.min(this.currentChunkSize, this.options.size - this.position);
      this.currentChunkSize += this.position;
      cb();
    } catch (error) {
      this.emit("error", error);
    }
  }
}
export interface Request$UploadFinish {
  a: "p";
  t: string;
  n: [{
    a: string;
    fa?: string; // "0*lAUvN1dBIJ0/1*3JipjRQzzNQ"
    h: string; // hash;
    k: string;
    t: number;
  }]
}
 */
