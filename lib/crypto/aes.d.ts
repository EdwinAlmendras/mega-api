/// <reference types="node" />
export declare class AES {
    constructor(key: any);
    encryptCBC(buffer: any): Buffer;
    decryptCBC(buffer: any): Buffer;
    stringhash(buffer: any): Buffer;
    encryptECB(buffer: any): Buffer;
    decryptECB(buffer: any): Buffer;
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
