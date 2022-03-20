"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constantTimeCompare = exports.createSalt = exports.base64 = exports.decryptBase64 = exports.encryptBase64 = void 0;
__exportStar(require("./aes"), exports);
__exportStar(require("./key"), exports);
__exportStar(require("./rsa"), exports);
__exportStar(require("./stream"), exports);
const crypto_1 = require("crypto");
// URL Safe Base64 encode/decode
function encryptBase64(buffer) {
    if (typeof buffer === "string")
        buffer = Buffer.from(buffer, "utf8");
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
exports.encryptBase64 = encryptBase64;
function decryptBase64(data) {
    if (typeof data === "string") {
        data = data
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .replace(/,/g, "");
    }
    else {
        return data;
    }
    return Buffer.from(data, "base64");
}
exports.decryptBase64 = decryptBase64;
exports.base64 = {
    encrypt: encryptBase64,
    decrypt: decryptBase64,
};
/**
 * Create random salt for user from random bytes
 * @param {Buffer} bytes
 * @returns {salt}
 */
function createSalt(bytes) {
    let mega = "mega.nz";
    const maxLength = 200; // 200 chars for 'mega.nz' + padding
    const hashLength = maxLength + bytes.length; // 216 bytes
    for (let i = mega.length; i < maxLength; i++) {
        mega += "P";
    }
    const megaBytes = Buffer.from(mega);
    const byteconcat = new Uint8Array(hashLength);
    byteconcat.set(megaBytes);
    byteconcat.set(bytes, maxLength);
    return crypto_1.createHash("sha256").update(byteconcat).digest();
}
exports.createSalt = createSalt;
function constantTimeCompare(bufferA, bufferB) {
    if (bufferA.length !== bufferB.length)
        return false;
    const len = bufferA.length;
    let result = 0;
    for (let i = 0; i < len; i++) {
        result |= bufferA[i] ^ bufferB[i];
    }
    return result === 0;
}
exports.constantTimeCompare = constantTimeCompare;
