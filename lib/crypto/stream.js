"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaDecrypt = exports.createDecrypterStream = exports.MegaEncrypt = exports.createEncrypterStream = void 0;
/* eslint-disable valid-jsdoc */
const stream_1 = require("stream");
// import combine from "stream-combiner";
// import { b2s } from "../utils/util";
const _1 = require("./");
/**
 *
 * @param {Buffer} key its buffer
 * @param {Object} param1 sdasd
 * @return encrypter
 */
function createEncrypterStream(key, { start }) {
    start = !start && 0;
    const megaEncrypter = new MegaEncrypt({ key,
        start });
    megaEncrypter.on("end", () => {
        const mac = megaEncrypter.ctr.condensedMac();
        megaEncrypter.key = _1.mergeKeyMac(key, mac);
    });
    // megaEncrypter = combine(b2s(randomBytes(16)), megaEncrypter);
    return megaEncrypter;
}
exports.createEncrypterStream = createEncrypterStream;
class MegaEncrypt extends stream_1.Transform {
    constructor({ key, start }) {
        super();
        this.aes = new _1.AES(key.slice(0, 16));
        this.ctr = new _1.CTR(this.aes, key.slice(16), start);
    }
    _transform(chunk, encoding, cb) {
        const chunked = this.ctr.encrypt(chunk);
        this.push(chunked);
        cb();
    }
}
exports.MegaEncrypt = MegaEncrypt;
/*
CREATE ENCRYPTER STREAM WITH KEY
*/
function createDecrypterStream(key) {
    const megaDecrypter = new MegaDecrypt({ key });
    console.log(key, "key from func");
    /*   megaDecrypter.on("end", () => {
        const mac = megaDecrypter.ctr.condensedMac();
        if (!mac.equals(key.slice(24)) && !disableVerification) {
          reject("MAC verification failed");
        }
      }); */
    // megaDecrypter = combine(b2s(randomBytes(16)), megaDecrypter);
    return (megaDecrypter);
}
exports.createDecrypterStream = createDecrypterStream;
class MegaDecrypt extends stream_1.Transform {
    constructor({ key }) {
        super();
        console.log(key, "kedecrypty");
        this.aes = _1.getCipher(key);
        this.ctr = new _1.CTR(this.aes, key.slice(16), 0);
    }
    _transform(chunk, encoding, cb) {
        console.log(chunk);
        this.push(this.ctr.decrypt(chunk));
        cb();
    }
}
exports.MegaDecrypt = MegaDecrypt;
