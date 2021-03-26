"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeKeyMac = exports.unmergeKeyMac = exports.getCipher = exports.prepareKeyV2 = exports.prepareKey = void 0;
// @ts-ignore
const crypto_1 = __importDefault(require("crypto"));
const _1 = require("./");
// convert user-supplied password array
function prepareKey(password) {
    console.log(password, "password");
    let i, j, r;
    let pkey = Buffer.from([147, 196, 103, 227, 125, 176, 199, 164, 209, 190, 63, 129, 1, 82, 203, 86]);
    for (r = 65536; r--;) {
        for (j = 0; j < password.length; j += 16) {
            const key = Buffer.alloc(16);
            for (i = 0; i < 16; i += 4) {
                if (i + j < password.length) {
                    password.copy(key, i, i + j, i + j + 4);
                }
            }
            pkey = crypto_1.default.createCipheriv('aes-128-ecb', key, Buffer.alloc(0))
                .setAutoPadding(false)
                .update(pkey);
        }
    }
    return pkey;
}
exports.prepareKey = prepareKey;
// The same function but for version 2 accounts
function prepareKeyV2(password, s) {
    if (!(s instanceof Buffer))
        s = Buffer.from(s, 'base64');
    const iterations = 100000;
    const digest = 'sha512';
    return crypto_1.default.pbkdf2Sync(password, s, iterations, 32, digest);
}
exports.prepareKeyV2 = prepareKeyV2;
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
