"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTR = exports.AES = exports.AES$Decrypt = exports.AES$Encrypt = exports.MAC = void 0;
// @ts-ignore
// @ts-nocheck
const crypto_1 = __importDefault(require("crypto"));
// MEGA's MAC implementation is similar to ECBC-MAC
// but because it encrypts the MAC twice it's weird,
// also implementing it natively is slower.
class MAC {
    constructor(aes, nonce) {
        this.key = aes.encrypt.key;
        this.nonce = nonce.slice(0, 8);
        this.macCipher = crypto_1.default.createCipheriv('aes-128-ecb', this.key, Buffer.alloc(0));
        this.posNext = this.increment = 131072; // 2**17
        this.pos = 0;
        this.macs = [];
        this.mac = Buffer.alloc(16);
        this.nonce.copy(this.mac, 0);
        this.nonce.copy(this.mac, 8);
    }
    condense() {
        if (this.mac) {
            this.macs.push(this.mac);
            this.mac = undefined;
        }
        let mac = Buffer.alloc(16, 0);
        for (const item of this.macs) {
            for (let j = 0; j < 16; j++)
                mac[j] ^= item[j];
            mac = this.macCipher.update(mac);
        }
        const macBuffer = Buffer.allocUnsafe(8);
        macBuffer.writeInt32BE(mac.readInt32BE(0) ^ mac.readInt32BE(4), 0);
        macBuffer.writeInt32BE(mac.readInt32BE(8) ^ mac.readInt32BE(12), 4);
        return macBuffer;
    }
    update(buffer) {
        for (let i = 0; i < buffer.length; i += 16) {
            for (let j = 0; j < 16; j++)
                this.mac[j] ^= buffer[i + j];
            this.mac = this.macCipher.update(this.mac);
            this.checkBounding();
        }
    }
    checkBounding() {
        this.pos += 16;
        if (this.pos >= this.posNext) {
            this.macs.push(Buffer.from(this.mac));
            this.nonce.copy(this.mac, 0);
            this.nonce.copy(this.mac, 8);
            if (this.increment < 1048576) {
                this.increment += 131072;
            }
            this.posNext += this.increment;
        }
    }
}
exports.MAC = MAC;
class AES$Encrypt {
    constructor(key = key) {
        this.key = key;
    }
    cbc(buffer) {
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto_1.default.createCipheriv('aes-128-cbc', this.key, iv)
            .setAutoPadding(false);
        const result = Buffer.concat([cipher.update(buffer), cipher.final()]);
        result.copy(buffer);
        return result;
    }
    ecb(buffer) {
        const cipher = crypto_1.default.createCipheriv('aes-128-ecb', this.key, Buffer.alloc(0))
            .setAutoPadding(false);
        const result = cipher.update(buffer);
        result.copy(buffer);
        return result;
    }
    stringhash(buffer) {
        const h32 = [0, 0, 0, 0];
        for (let i = 0; i < buffer.length; i += 4) {
            if (buffer.length - i < 4) {
                const len = buffer.length - i;
                h32[i / 4 & 3] ^= buffer.readIntBE(i, len) << (4 - len) * 8;
            }
            else {
                h32[i / 4 & 3] ^= buffer.readInt32BE(i);
            }
        }
        let hash = Buffer.allocUnsafe(16);
        for (let i = 0; i < 4; i++) {
            hash.writeInt32BE(h32[i], i * 4);
        }
        const cipher = crypto_1.default.createCipheriv('aes-128-ecb', this.key, Buffer.alloc(0));
        for (let i = 16384; i--;)
            hash = cipher.update(hash);
        const result = Buffer.allocUnsafe(8);
        hash.copy(result, 0, 0, 4);
        hash.copy(result, 4, 8, 12);
        return result;
    }
}
exports.AES$Encrypt = AES$Encrypt;
class AES$Decrypt {
    constructor(key = key) {
        this.key = key;
    }
    cbc(buffer) {
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto_1.default.createDecipheriv('aes-128-cbc', this.key, iv)
            .setAutoPadding(false);
        const result = Buffer.concat([decipher.update(buffer), decipher.final()]);
        result.copy(buffer);
        return result;
    }
    ecb(buffer) {
        const decipher = crypto_1.default.createDecipheriv('aes-128-ecb', this.key, Buffer.alloc(0))
            .setAutoPadding(false);
        const result = decipher.update(buffer);
        result.copy(buffer);
        return result;
    }
}
exports.AES$Decrypt = AES$Decrypt;
class AES {
    constructor(key) {
        this.encrypt = new AES$Encrypt(key);
        this.decrypt = new AES$Decrypt(key);
    }
    encryptCBC(at) {
        throw new Error("Method not implemented.");
    }
}
exports.AES = AES;
class CTR {
    constructor(aes, nonce, start = 0) {
        this.key = aes.encrypt.key;
        this.nonce = nonce.slice(0, 8);
        const iv = Buffer.alloc(16);
        this.nonce.copy(iv, 0);
        if (start !== 0) {
            this.incrementCTRBuffer(iv, start / 16);
        }
        // create ciphers on demand
        this.encrypt = (buffer) => {
            this.encryptCipher = crypto_1.default.createCipheriv('aes-128-ctr', this.key, iv);
            this.encrypt = this._encrypt;
            return this.encrypt(buffer);
        };
        this.decrypt = (buffer) => {
            this.decryptCipher = crypto_1.default.createDecipheriv('aes-128-ctr', this.key, iv);
            this.decrypt = this._decrypt;
            return this.decrypt(buffer);
        };
        // MEGA's MAC implementation is... strange
        this.macCipher = crypto_1.default.createCipheriv('aes-128-ecb', this.key, Buffer.alloc(0));
        this.posNext = this.increment = 131072; // 2**17
        this.pos = 0;
        this.macs = [];
        this.mac = Buffer.alloc(16);
        this.nonce.copy(this.mac, 0);
        this.nonce.copy(this.mac, 8);
    }
    condensedMac() {
        if (this.mac) {
            this.macs.push(this.mac);
            this.mac = undefined;
        }
        let mac = Buffer.alloc(16, 0);
        for (let item of this.macs) {
            for (let j = 0; j < 16; j++)
                mac[j] ^= item[j];
            mac = this.macCipher.update(mac);
        }
        const macBuffer = Buffer.allocUnsafe(8);
        macBuffer.writeInt32BE(mac.readInt32BE(0) ^ mac.readInt32BE(4), 0);
        macBuffer.writeInt32BE(mac.readInt32BE(8) ^ mac.readInt32BE(12), 4);
        return macBuffer;
    }
    _encrypt(buffer) {
        this.encryptCipher.update(buffer).copy(buffer);
        for (let i = 0; i < buffer.length; i += 16) {
            for (let j = 0; j < 16; j++)
                this.mac[j] ^= buffer[i + j];
            this.mac = this.macCipher.update(this.mac);
            this.checkMacBounding();
        }
        return buffer;
    }
    _decrypt(buffer) {
        this.decryptCipher.update(buffer).copy(buffer);
        for (let i = 0; i < buffer.length; i += 16) {
            for (let j = 0; j < 16; j++)
                this.mac[j] ^= buffer[i + j];
            this.mac = this.macCipher.update(this.mac);
            this.checkMacBounding();
        }
        return buffer;
    }
    checkMacBounding() {
        this.pos += 16;
        if (this.pos >= this.posNext) {
            this.macs.push(Buffer.from(this.mac));
            this.nonce.copy(this.mac, 0);
            this.nonce.copy(this.mac, 8);
            if (this.increment < 1048576) {
                this.increment += 131072;
            }
            this.posNext += this.increment;
        }
    }
    // From https://github.com/jrnewell/crypto-aes-ctr/blob/77156490fcf32870215680c8db035c01390144b2/lib/index.js#L4-L18
    incrementCTRBuffer(buf, cnt) {
        const len = buf.length;
        let i = len - 1;
        let mod;
        while (cnt !== 0) {
            mod = (cnt + buf[i]) % 256;
            cnt = Math.floor((cnt + buf[i]) / 256);
            buf[i] = mod;
            i -= 1;
            if (i < 0) {
                i = len - 1;
            }
        }
    }
}
exports.CTR = CTR;
