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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaUploadHandler = exports.UploaderInternal = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("../crypto");
const stream_1 = require("stream");
const properties_1 = __importDefault(require("./properties"));
const constants_1 = require("./constants");
class UploaderInternal {
    constructor(client) {
        this.client = client;
    }
    upload(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { url, properties, options } = params;
            const { key } = options;
            const { data, headers } = yield this.client.api.axios({
                method: "GET",
                url,
                responseType: "stream",
            });
            const size = headers["content-length"];
            const uploadUrl = yield this.getUploadUrl({
                a: 'u',
                ssl: (options === null || options === void 0 ? void 0 : options.ssl) || 0,
                s: size,
                ms: 0,
                r: 0,
                e: 0,
                v: 2,
            });
            const encrypter = crypto_1.createEncrypterStream(options.key, { start: 0 });
            const uploader = new MegaUploadHandler({ url: uploadUrl, size });
            uploader.on("error", (error) => {
                // something wrong uplaoding into request
                console.log(error, "error is ");
                data.destroy(error);
                Promise.reject(error);
            });
            uploader.on("hash", (hash) => __awaiter(this, void 0, void 0, function* () {
                console.log("hash is ", hash);
                const cipher = new crypto_1.AES(key);
                const params = {
                    a: "p",
                    t: this.client.state.ID_ROOT_FOLDER,
                    n: [{
                            a: crypto_1.base64.encrypt(cipher.encrypt.ecb(properties_1.default.pack(properties))),
                            // fa: string; // "0*lAUvN1dBIJ0/1*3JipjRQzzNQ"
                            h: crypto_1.base64.encrypt(hash),
                            k: crypto_1.base64.encrypt(cipher.encrypt.ecb(key)),
                            t: 0,
                        }],
                };
                const { f: file } = yield this.client.api.request(params);
                this.client.files.compose(file);
                console.log("file", file);
                Promise.resolve(file);
            }));
            data.pipe(encrypter).pipe(uploader);
        });
    }
    getUploadUrl(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.api.request(params);
                return Promise.resolve(response.p);
            }
            catch (error) {
                return Promise.reject(new Error(error));
            }
        });
    }
}
exports.UploaderInternal = UploaderInternal;
class MegaUploadHandler extends stream_1.Writable {
    constructor(options, config) {
        super(config);
        this.options = options;
        this.config = config;
        this.position = 0;
        this.initialChunkSize = 15844;
        this.currentChunkSize = this.initialChunkSize;
    }
    _write(chunk, encoding, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`upploadin in current url ${`${this.options.url}/${this.position}`}`);
                const { data: hash, headers, request } = yield axios_1.default({
                    method: "POST",
                    data: chunk,
                    url: `${this.options.url}/${this.position}`,
                });
                console.log(headers, request);
                console.log("hash", hash);
                if (Number(hash) < 0) {
                    console.log("IS A BIG ERROR");
                    this.emit("error", {
                        "server_error": constants_1.ERRORS[hash],
                        "is_http_error": true,
                        "url": `${this.options.url}/${this.position}`,
                        "action": "uploading",
                        "current_chunk_upload_size": chunk.length,
                    });
                }
                else {
                    this.emit("hash", hash);
                }
                this.position = Math.min(this.currentChunkSize, this.options.size - this.position);
                this.currentChunkSize += this.position;
                cb();
            }
            catch (error) {
                this.emit("error", error);
            }
        });
    }
}
exports.MegaUploadHandler = MegaUploadHandler;
