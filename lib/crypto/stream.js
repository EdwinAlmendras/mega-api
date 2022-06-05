"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.megaDecrypt = exports.createDecrypterStream = exports.MegaDecrypt = exports.MegaEncrypt = exports.megaEncrypt = exports.createEncrypterStream = void 0;
/* eslint-disable valid-jsdoc */
const stream_1 = require("stream");
const _1 = require("./");
const pumpify_1 = __importDefault(require("pumpify"));
/**
 *
 * @param {Buffer} key its buffer
 * @return encrypter
 */
function createEncrypterStream(key, start = 0) {
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
function megaEncrypt(key, { start } = {}) {
    start || (start = 0);
    if (start !== 0)
        throw Error('Encryption cannot start midstream otherwise MAC verification will fail.');
    if (!(key instanceof Buffer)) {
        key = Buffer.from(key);
    }
    console.log({ key });
    let stream = new stream_1.Transform({
        transform(chunk, encoding, callback) {
            mac.update(chunk);
            const data = ctr.encrypt(chunk);
            callback(null, Buffer.from(data));
        },
        flush(callback) {
            stream.mac = mac.condense();
            stream.key = _1.mergeKeyMac(key, stream.mac);
            callback();
        }
    });
    if (key.length !== 24)
        throw Error('Wrong key length. Key must be 192bit.');
    const aes = new _1.AES(key.slice(0, 16));
    const ctr = new _1.CTR(aes, key.slice(16), start);
    const mac = new _1.MAC(aes, key.slice(16));
    //stream = pumpify(chunkSizeSafe(16), stream)
    return stream;
}
exports.megaEncrypt = megaEncrypt;
class MegaEncrypt extends stream_1.Transform {
    constructor({ key, start }) {
        super();
        this.aes = new _1.AES(key.slice(0, 16)); //new AES(key.slice(0, 16));
        this.ctr = new _1.CTR(this.aes, key.slice(16), 0 /* start */);
    }
    _transform(chunk, encoding, cb) {
        const chunked = this.ctr.encrypt(chunk);
        this.push(chunked);
        cb();
    }
}
exports.MegaEncrypt = MegaEncrypt;
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
/*
CREATE ENCRYPTER STREAM WITH KEY
*/
function createDecrypterStream(key) {
    const megaDecrypter = new MegaDecrypt({ key });
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
function megaDecrypt(key, options = { disableVerification: true, start: 0 }) {
    const start = options.start || 0;
    if (start !== 0)
        options.disableVerification = true;
    if (start % 16 !== 0)
        throw Error('start argument of megaDecrypt must be a multiple of 16');
    const aes = _1.getCipher(key);
    const ctr = new _1.CTR(aes, key.slice(16), start);
    /* const mac = !options.disableVerification && new MAC(aes, key.slice(16)) */
    let stream = new stream_1.Transform({
        transform(chunk, encoding, callback) {
            const data = ctr.decrypt(chunk);
            /*  if (mac) mac.update(data) */
            callback(null, Buffer.from(data));
        },
        flush(callback) {
            /* if (mac) stream.mac = mac.condense() */
            /* if (!options.disableVerification && !stream.mac.equals(key.slice(24))) {
              callback(Error('MAC verification failed'))
              return
            } */
            callback();
        }
    });
    stream = pumpify_1.default(chunkSizeSafe(16), stream);
    return stream;
}
exports.megaDecrypt = megaDecrypt;
function chunkSizeSafe(size) {
    let last;
    return new stream_1.Transform({
        transform(chunk, encoding, callback) {
            if (last)
                chunk = Buffer.concat([last, chunk]);
            const end = Math.floor(chunk.length / size) * size;
            if (!end) {
                last = last ? Buffer.concat([last, chunk]) : chunk;
            }
            else if (chunk.length > end) {
                last = chunk.slice(end);
                this.push(chunk.slice(0, end));
            }
            else {
                last = undefined;
                this.push(chunk);
            }
            callback();
        },
        flush(callback) {
            if (last)
                this.push(last);
            callback();
        }
    });
}
