/// <reference types="node" />
export * from './aes';
export * from './key';
export * from './rsa';
export * from './stream';
export declare function encryptBase64(buffer: Buffer): string;
export declare function decryptBase64(data: string): Buffer;
export declare const base64: {
    encrypt: typeof encryptBase64;
    decrypt: typeof decryptBase64;
};
/**
 * Create random salt for user from random bytes
 * @param {Buffer} bytes
 * @returns {salt}
 */
export declare function createSalt(bytes: Buffer): Buffer;
export declare function constantTimeCompare(bufferA: Buffer, bufferB: Buffer): boolean;
