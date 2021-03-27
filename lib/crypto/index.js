"use strict";
// @ts-nocheck
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
exports.constantTimeCompare = exports.deriveKeys = exports.createSalt = exports.d64 = exports.e64 = exports.formatKey = void 0;
__exportStar(require("./aes"), exports);
__exportStar(require("./key"), exports);
__exportStar(require("./rsa"), exports);
__exportStar(require("./stream"), exports);
var aes_1 = require("./aes");
function formatKey(key) {
    return typeof key === "string" ? d64(key) : key;
}
exports.formatKey = formatKey;
// URL Safe Base64 encode/decode
function e64(buffer) {
    if (typeof buffer === "string")
        buffer = Buffer.from(buffer, "utf8");
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
exports.e64 = e64;
function d64(s) {
    s = s.replace(/\-/g, "+").replace(/_/g, "/").replace(/,/g, "");
    return Buffer.from(s, "base64");
}
exports.d64 = d64;
function createSalt(randomBytes) {
    var String = "mega.nz";
    var StringMaxLength = 200; // 200 chars for 'mega.nz' + padding
    var HashInputLength = StringMaxLength + randomBytes.length; // 216 bytes
    for (var i = String.length; i < StringMaxLength; i++) {
        String += "P";
    }
    var StringBytes = Buffer.from(String);
    var byteconcat = new Uint8Array(HashInputLength);
    byteconcat.set(StringBytes);
    byteconcat.set(randomBytes, StringMaxLength);
    var Bytes = createHash("sha256").update(byteconcat).digest();
    return Bytes;
}
exports.createSalt = createSalt;
function deriveKeys(password, masterKey) {
    var crv = randomBytes(16);
    var salt = createSalt(crv);
    var deriveKey = prepareKeyV2(Buffer.from(password, "utf8"), salt);
    var passwordKey = deriveKey.subarray(0, 16);
    var hashAuthKey = deriveKey.slice(16, 32);
    var KEY_AES = new aes_1.AES(passwordKey);
    hak = createHash("sha256")
        .update(hashAuthKey)
        .digest()
        .subarray(0, 16);
    return {
        crv: crv,
        k: KEY_AES.encryptECB(masterKey),
        hak: hak,
        aes: KEY_AES
    };
}
exports.deriveKeys = deriveKeys;
function constantTimeCompare(bufferA, bufferB) {
    if (bufferA.length !== bufferB.length)
        return false;
    var len = bufferA.length;
    var result = 0;
    for (var i = 0; i < len; i++) {
        result |= bufferA[i] ^ bufferB[i];
    }
    return result === 0;
}
exports.constantTimeCompare = constantTimeCompare;
