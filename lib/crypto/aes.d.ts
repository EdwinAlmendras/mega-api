/// <reference types="node" />
export declare class MAC {
    constructor(aes: any, nonce: any);
    condense(): Buffer;
    update(buffer: any): void;
    checkBounding(): void;
}
export declare class AES$Encrypt {
    key: any;
    constructor(key?: any);
    cbc(buffer: Buffer): Buffer;
    ecb(buffer: Buffer): Buffer;
    stringhash(buffer: Buffer): Buffer;
}
export declare class AES$Decrypt {
    key: any;
    constructor(key?: any);
    cbc(buffer: Buffer): Buffer;
    ecb(buffer: Buffer): Buffer;
}
export declare class AES {
    encryptCBC(at: any): void;
    encrypt: AES$Encrypt;
    decrypt: AES$Decrypt;
    key: Buffer;
    constructor(key: Buffer);
}
export declare class CTR {
    encrypt: any;
    decrypt: any;
    constructor(aes: any, nonce: any, start?: number);
    condensedMac(): Buffer;
    _encrypt(buffer: any): any;
    _decrypt(buffer: any): any;
    checkMacBounding(): void;
    incrementCTRBuffer(buf: any, cnt: any): void;
}
