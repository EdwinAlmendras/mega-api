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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaDecrypt = exports.createDecrypterStream = exports.MegaEncrypt = exports.createEncrypterStream = void 0;
const crypto_1 = require("crypto");
const stream_1 = require("stream");
//import combine from "stream-combiner";
//import { b2s } from "../utils/util";
const _1 = require("./");
// @ts-nocheck 
/*
CREATE ENCRYPTER STREAM WITH KEY
*/
function createEncrypterStream(key, { start }) {
    start = !start && 0;
    key = !key && crypto_1.randomBytes(24);
    key = typeof key === "string" && _1.formatKey(key);
    let megaEncrypter = new MegaEncrypt({ key, start });
    megaEncrypter.on("end", () => {
        const mac = megaEncrypter.ctr.condensedMac();
        megaEncrypter.key = _1.mergeKeyMac(key, mac);
    });
    //megaEncrypter = combine(b2s(randomBytes(16)), megaEncrypter);
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
        this.push(this.ctr.encrypt(chunk));
        cb();
    }
}
exports.MegaEncrypt = MegaEncrypt;
/*
CREATE ENCRYPTER STREAM WITH KEY
*/
function createDecrypterStream(key) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        let megaDecrypter = new MegaDecrypt({ key });
        /*   megaDecrypter.on("end", () => {
            const mac = megaDecrypter.ctr.condensedMac();
            if (!mac.equals(key.slice(24)) && !disableVerification) {
              reject("MAC verification failed");
            }
          }); */
        // megaDecrypter = combine(b2s(randomBytes(16)), megaDecrypter);
        resolve(megaDecrypter);
    }));
}
exports.createDecrypterStream = createDecrypterStream;
class MegaDecrypt extends stream_1.Transform {
    constructor({ key }) {
        super();
        this.aes = _1.getCipher(key);
        this.ctr = new _1.CTR(this.aes, key.slice(16), 0);
    }
    _transform(chunk, encoding, cb) {
        this.push(this.ctr.decrypt(chunk));
        cb();
    }
}
exports.MegaDecrypt = MegaDecrypt;
