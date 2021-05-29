"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.key = exports.deriveKeys = exports.mergeKeyMac = exports.unmergeKeyMac = exports.getCipher = exports.prepare = void 0;
const crypto_1 = __importStar(require("crypto"));
const _1 = require("./");
const BYTES_V1_LOGIN = [147, 196, 103, 227, 125, 176, 199, 164, 209, 190, 63, 129, 1, 82, 203, 86];
class prepare {
    static v1(pass, email) {
        let i;
        let j;
        let r;
        let passwordKey = Buffer.from(BYTES_V1_LOGIN);
        for (r = 65536; r--;) {
            for (j = 0; j < pass.length; j += 16) {
                const key = Buffer.alloc(16);
                for (i = 0; i < 16; i += 4) {
                    if (i + j < pass.length) {
                        pass.copy(key, i, i + j, i + j + 4);
                    }
                }
                passwordKey = crypto_1.default.createCipheriv('aes-128-ecb', key, Buffer.alloc(0))
                    .setAutoPadding(false)
                    .update(passwordKey);
            }
        }
        const userHash = new _1.AES(passwordKey).encrypt.stringhash(Buffer.from(email));
        return [passwordKey, userHash];
    }
    /**
     * Prepare key version 2
     * @param {Buffer} password
     * @param {string} salt
     * @returns password key and user hash []
     */
    static v2(password, s) {
        if (!(s instanceof Buffer))
            s = Buffer.from(s, 'base64');
        const iterations = 100000;
        const digest = 'sha512';
        const deriveKey = crypto_1.default.pbkdf2Sync(password, s, iterations, 32, digest);
        return [deriveKey.slice(0, 16), deriveKey.slice(16), deriveKey];
    }
}
exports.prepare = prepare;
/**
 * Unmerge keyMac from key then slice and use as key, creates instance AES
 * @param {Buffer} key
 * @returns {AES}
 */
function getCipher(key) {
    return new _1.AES(unmergeKeyMac(key).slice(0, 16));
}
exports.getCipher = getCipher;
/* KEY MAC VERIFICATION */
function unmergeKeyMac(key) {
    const newKey = Buffer.alloc(32);
    if (typeof key === "string")
        key = Buffer.from(key);
    key.copy(newKey);
    for (let i = 0; i < 16; i++) {
        newKey.writeUInt8(newKey.readUInt8(i) ^ newKey.readUInt8(16 + i), i);
    }
    return newKey;
}
exports.unmergeKeyMac = unmergeKeyMac;
function mergeKeyMac(key, mac) {
    const newKey = Buffer.alloc(32);
    key.copy(newKey);
    mac.copy(newKey, 24);
    for (let i = 0; i < 16; i++) {
        newKey.writeUInt8(newKey.readUInt8(i) ^ newKey.readUInt8(16 + i), i);
    }
    return newKey;
}
exports.mergeKeyMac = mergeKeyMac;
/**
 * Derive client random bytes, userHash, encrypted master key, key_aes
 * @param password
 * @param masterKey
 * @returns {[ randomBytes, encryptedKey, userHash, aes]}
 */
function deriveKeys(password, masterKey) {
    const crv = crypto_1.randomBytes(16);
    const salt = _1.createSalt(crv);
    const [passwordKey, hashUser] = exports.key.prepare.v2(Buffer.from(password, "utf8"), salt);
    const KEY_AES = new _1.AES(passwordKey);
    const hak = crypto_1.createHash("sha256")
        .update(hashUser)
        .digest()
        .subarray(0, 16);
    return {
        crv,
        k: KEY_AES.encrypt.ecb(masterKey),
        hak,
        aes: KEY_AES,
    };
}
exports.deriveKeys = deriveKeys;
exports.key = {
    mergeMac: mergeKeyMac,
    unmergeMac: unmergeKeyMac,
    prepare: prepare,
};
