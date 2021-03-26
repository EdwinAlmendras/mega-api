/// <reference types="node" />
export * from './aes';
export * from './key';
export * from './rsa';
export * from './stream';
import { AES } from "./aes";
export declare function formatKey(key: any): Buffer;
export declare function e64(buffer: any): any;
export declare function d64(s: any): Buffer;
export declare function createSalt(randomBytes: any): any;
export declare function deriveKeys(password: any, masterKey: any): {
    hak: Buffer;
    crv: Buffer;
    k: Buffer;
    aes: AES;
};
export declare function constantTimeCompare(bufferA: any, bufferB: any): boolean;
