
export * from './aes';
export * from './key';
export * from './rsa';
export * from './stream';
import { createHash } from 'crypto';
// URL Safe Base64 encode/decode
export function encryptBase64(buffer: Buffer): string {
  if (typeof buffer === "string") buffer = Buffer.from(buffer, "utf8");
  return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
}

export function decryptBase64(data: string): Buffer {
  if(typeof data === "string"){
    data = data
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/,/g, "");
  }
  else {
    return data
  }
  return Buffer.from(data, "base64");
}

export const base64 = {
  encrypt: encryptBase64,
  decrypt: decryptBase64,
};


/**
 * Create random salt for user from random bytes
 * @param {Buffer} bytes
 * @returns {salt}
 */
export function createSalt(bytes: Buffer): Buffer {
  let mega = "mega.nz";
  const maxLength = 200; // 200 chars for 'mega.nz' + padding
  const hashLength = maxLength + bytes.length; // 216 bytes
  for (let i = mega.length; i < maxLength; i++) {
    mega += "P";
  }
  const megaBytes = Buffer.from(mega);
  const byteconcat = new Uint8Array(hashLength);
  byteconcat.set(megaBytes);
  byteconcat.set(bytes, maxLength);
  return createHash("sha256").update(byteconcat).digest();
}


export function constantTimeCompare(bufferA: Buffer, bufferB: Buffer): boolean {
  if (bufferA.length !== bufferB.length) return false;
  const len = bufferA.length;
  let result = 0;
  for (let i = 0; i < len; i++) {
    result |= bufferA[i] ^ bufferB[i];
  }
  return result === 0;
}
