"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTR = exports.AES = void 0;
var crypto_1 = __importDefault(require("crypto"));
var AES = /** @class */ (function () {
    function AES(key) {
        this.key = key;
    }
    AES.prototype.encryptCBC = function (buffer) {
        var iv = Buffer.alloc(16, 0);
        var cipher = crypto_1.default.createCipheriv('aes-128-cbc', this.key, iv)
            .setAutoPadding(false);
        var result = Buffer.concat([cipher.update(buffer), cipher.final()]);
        result.copy(buffer);
        return result;
    };
    AES.prototype.decryptCBC = function (buffer) {
        var iv = Buffer.alloc(16, 0);
        var decipher = crypto_1.default.createDecipheriv('aes-128-cbc', this.key, iv)
            .setAutoPadding(false);
        var result = Buffer.concat([decipher.update(buffer), decipher.final()]);
        result.copy(buffer);
        return result;
    };
    AES.prototype.stringhash = function (buffer) {
        var h32 = [0, 0, 0, 0];
        for (var i = 0; i < buffer.length; i += 4) {
            if (buffer.length - i < 4) {
                var len = buffer.length - i;
                h32[i / 4 & 3] ^= buffer.readIntBE(i, len) << (4 - len) * 8;
            }
            else {
                h32[i / 4 & 3] ^= buffer.readInt32BE(i);
            }
        }
        var hash = Buffer.allocUnsafe(16);
        for (var i = 0; i < 4; i++) {
            hash.writeInt32BE(h32[i], i * 4, true);
        }
        var cipher = crypto_1.default.createCipheriv('aes-128-ecb', this.key, Buffer.alloc(0));
        for (var i = 16384; i--;)
            hash = cipher.update(hash);
        var result = Buffer.allocUnsafe(8);
        hash.copy(result, 0, 0, 4);
        hash.copy(result, 4, 8, 12);
        return result;
    };
    AES.prototype.encryptECB = function (buffer) {
        var cipher = crypto_1.default.createCipheriv('aes-128-ecb', this.key, Buffer.alloc(0))
            .setAutoPadding(false);
        var result = cipher.update(buffer);
        result.copy(buffer);
        return result;
    };
    AES.prototype.decryptECB = function (buffer) {
        var decipher = crypto_1.default.createDecipheriv('aes-128-ecb', this.key, Buffer.alloc(0))
            .setAutoPadding(false);
        var result = decipher.update(buffer);
        result.copy(buffer);
        return result;
    };
    return AES;
}());
exports.AES = AES;
var CTR = /** @class */ (function () {
    function CTR(aes, nonce, start) {
        var _this = this;
        if (start === void 0) { start = 0; }
        this.key = aes.key;
        this.nonce = nonce.slice(0, 8);
        var iv = Buffer.alloc(16);
        this.nonce.copy(iv, 0);
        if (start !== 0) {
            this.incrementCTRBuffer(iv, start / 16);
        }
        // create ciphers on demand
        this.encrypt = function (buffer) {
            _this.encryptCipher = crypto_1.default.createCipheriv('aes-128-ctr', _this.key, iv);
            _this.encrypt = _this._encrypt;
            return _this.encrypt(buffer);
        };
        this.decrypt = function (buffer) {
            _this.decryptCipher = crypto_1.default.createDecipheriv('aes-128-ctr', _this.key, iv);
            _this.decrypt = _this._decrypt;
            return _this.decrypt(buffer);
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
    CTR.prototype.condensedMac = function () {
        if (this.mac) {
            this.macs.push(this.mac);
            this.mac = undefined;
        }
        var mac = Buffer.alloc(16, 0);
        for (var _i = 0, _a = this.macs; _i < _a.length; _i++) {
            var item = _a[_i];
            for (var j = 0; j < 16; j++)
                mac[j] ^= item[j];
            mac = this.macCipher.update(mac);
        }
        var macBuffer = Buffer.allocUnsafe(8);
        macBuffer.writeInt32BE(mac.readInt32BE(0) ^ mac.readInt32BE(4), 0);
        macBuffer.writeInt32BE(mac.readInt32BE(8) ^ mac.readInt32BE(12), 4);
        return macBuffer;
    };
    CTR.prototype._encrypt = function (buffer) {
        for (var i = 0; i < buffer.length; i += 16) {
            for (var j = 0; j < 16; j++)
                this.mac[j] ^= buffer[i + j];
            this.mac = this.macCipher.update(this.mac);
            this.checkMacBounding();
        }
        return this.encryptCipher.update(buffer).copy(buffer);
    };
    CTR.prototype._decrypt = function (buffer) {
        this.decryptCipher.update(buffer).copy(buffer);
        for (var i = 0; i < buffer.length; i += 16) {
            for (var j = 0; j < 16; j++)
                this.mac[j] ^= buffer[i + j];
            this.mac = this.macCipher.update(this.mac);
            this.checkMacBounding();
        }
        return buffer;
    };
    CTR.prototype.checkMacBounding = function () {
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
    };
    // From https://github.com/jrnewell/crypto-aes-ctr/blob/77156490fcf32870215680c8db035c01390144b2/lib/index.js#L4-L18
    CTR.prototype.incrementCTRBuffer = function (buf, cnt) {
        var len = buf.length;
        var i = len - 1;
        var mod;
        while (cnt !== 0) {
            mod = (cnt + buf[i]) % 256;
            cnt = Math.floor((cnt + buf[i]) / 256);
            buf[i] = mod;
            i -= 1;
            if (i < 0) {
                i = len - 1;
            }
        }
    };
    return CTR;
}());
exports.CTR = CTR;
