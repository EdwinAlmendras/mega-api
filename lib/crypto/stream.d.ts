/// <reference types="node" />
import { Transform } from "stream";
import { AES, CTR } from "./";
export declare function createEncrypterStream(key: any, { start }: {
    start: any;
}): MegaEncrypt;
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
export declare function createDecrypterStream(key: Buffer): any;
export declare class MegaDecrypt extends Transform {
    aes: AES;
    ctr: CTR;
    constructor({ key }: {
        key: any;
    });
    _transform(chunk: Buffer, encoding: string, cb: () => void): void;
}
