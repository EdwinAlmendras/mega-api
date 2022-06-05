/// <reference types="node" />
import { Transform } from "stream";
import { AES, CTR } from "./";
/**
 *
 * @param {Buffer} key its buffer
 * @return encrypter
 */
export declare function createEncrypterStream(key: Buffer, start?: number): MegaEncrypt;
export declare function megaEncrypt(key: any, { start }?: {
    start?: number;
}): any;
export declare class MegaEncrypt extends Transform {
    aes: AES;
    ctr: CTR;
    key: Buffer;
    constructor({ key, start }: {
        key: any;
        start: any;
    });
    _transform(chunk: Buffer, encoding: string, cb: () => void): void;
}
export declare class MegaDecrypt extends Transform {
    aes: AES;
    ctr: CTR;
    constructor({ key }: {
        key: any;
    });
    _transform(chunk: Buffer, encoding: string, cb: () => void): void;
}
export declare function createDecrypterStream(key: Buffer): MegaDecrypt;
export declare function megaDecrypt(key: any, options?: {
    disableVerification: boolean;
    start: number;
}): Transform;
