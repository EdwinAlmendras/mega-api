// @ts-nocheck

export * from './aes';
export * from './key';
export * from './rsa';
export * from './stream';

import { AES } from "./aes";

export function formatKey(key): Buffer {
return typeof key === "string" ? d64(key) : key;
}

// URL Safe Base64 encode/decode
export function e64(buffer) {
  if (typeof buffer === "string") buffer = Buffer.from(buffer, "utf8");
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function d64(s) {
  s = s.replace(/\-/g, "+").replace(/_/g, "/").replace(/,/g, "");
  return Buffer.from(s, "base64");
}


export function createSalt(randomBytes) {
  var String = "mega.nz";
  var StringMaxLength = 200; // 200 chars for 'mega.nz' + padding
  var HashInputLength = StringMaxLength + randomBytes.length; // 216 bytes
  for (var i = String.length; i < StringMaxLength; i++) {
    String += "P";
  }
  var StringBytes = Buffer.from(String);
  var byteconcat = new Uint8Array(HashInputLength);
  byteconcat.set(StringBytes);
  byteconcat.set(randomBytes, StringMaxLength);
  var Bytes = createHash("sha256").update(byteconcat).digest();
  return Bytes;
}


export function deriveKeys(password, masterKey): { hak: Buffer; crv: Buffer, k: Buffer, aes: AES}{


  let crv = randomBytes(16);
  let salt = createSalt(crv);
  let deriveKey = prepareKeyV2(Buffer.from(password, "utf8"), salt);
  let passwordKey = deriveKey.subarray(0, 16);
  let hashAuthKey = deriveKey.slice(16, 32);

  let KEY_AES = new AES(passwordKey);
  
  hak = createHash("sha256")
    .update(hashAuthKey)
    .digest()
    .subarray(0, 16);


    return {
crv,
k: KEY_AES.encryptECB(masterKey),
hak,
aes: KEY_AES
    }
}


export function constantTimeCompare(bufferA, bufferB) {
  if (bufferA.length !== bufferB.length) return false;

  const len = bufferA.length;
  let result = 0;

  for (let i = 0; i < len; i++) {
    result |= bufferA[i] ^ bufferB[i];
  }

  return result === 0;
}
