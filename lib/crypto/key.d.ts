/// <reference types="node" />
import { AES } from "./";
export declare function prepareKey(password: Buffer): Buffer;
export declare function prepareKeyV2(password: Buffer, s: any): Buffer;
export declare function getCipher(key: any): AES;
export declare function unmergeKeyMac(key: Buffer): Buffer;
export declare function mergeKeyMac(key: Buffer, mac: any): Buffer;
