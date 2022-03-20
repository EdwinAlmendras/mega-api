/// <reference types="node" />
import { AES } from "./";
export declare class prepare {
    static v1(pass: Buffer, email: string): {
        userHash: Buffer;
        passwordKey: Buffer;
    };
    /**
     * Prepare key version 2
     * @param {Buffer} password
     * @param {string} salt
     * @returns password key and user hash []
     */
    static v2(password: Buffer, salt: string | Buffer): {
        userHash: Buffer;
        passwordKey: Buffer;
    };
}
/**
 * Unmerge keyMac from key then slice and use as key, creates instance AES
 * @param {Buffer} key
 * @returns {AES}
 */
export declare function getCipher(key: Buffer): AES;
export declare function unmergeKeyMac(key: Buffer): Buffer;
export declare function mergeKeyMac(key: Buffer, mac: Buffer): Buffer;
/**
 * Derive client random bytes, userHash, encrypted master key, key_aes
 * @param password
 * @param masterKey
 * @returns {[ randomBytes, encryptedKey, userHash, aes]}
 */
export declare function deriveKeys(password: string, masterKey: Buffer): {
    hak: Buffer;
    crv: Buffer;
    k: Buffer;
    aes: AES;
};
export declare const key: {
    mergeMac: typeof mergeKeyMac;
    unmergeMac: typeof unmergeKeyMac;
    prepare: typeof prepare;
};
