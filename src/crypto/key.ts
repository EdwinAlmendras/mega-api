import crypto, { createHash, randomBytes } from 'crypto';
import { AES, createSalt } from "./";

const BYTES_V1_LOGIN = [147, 196, 103, 227, 125, 176, 199, 164, 209, 190, 63, 129, 1, 82, 203, 86];


export class prepare {
  public static v1(pass: Buffer, email: string): Buffer[] {
    let i: number; let j: number; let r: number;
    let passwordKey = Buffer.from(BYTES_V1_LOGIN);
    for (r = 65536; r--;) {
      for (j = 0; j < pass.length; j += 16) {
        const key = Buffer.alloc(16);

        for (i = 0; i < 16; i += 4) {
          if (i + j < pass.length) {
            pass.copy(key, i, i + j, i + j + 4);
          }
        }

        passwordKey = crypto.createCipheriv('aes-128-ecb', key, Buffer.alloc(0))
            .setAutoPadding(false)
            .update(passwordKey);
      }
    }

    const userHash = new AES(passwordKey).encrypt.stringhash(Buffer.from(email));

    return [passwordKey, userHash];
  }
  /**
   * Prepare key version 2
   * @param {Buffer} password
   * @param {string} salt
   * @returns password key and user hash []
   */
  public static v2(password: Buffer, s: string | Buffer): Buffer[] {
    if (!(s instanceof Buffer)) s = Buffer.from(s, 'base64');
    const iterations = 100000;
    const digest = 'sha512';
    const deriveKey = crypto.pbkdf2Sync(password, s, iterations, 32, digest);
    return [deriveKey.slice(0, 16), deriveKey.slice(16), deriveKey];
  }
}

/**
 * Unmerge keyMac from key then slice and use as key, creates instance AES
 * @param {Buffer} key
 * @returns {AES}
 */
export function getCipher(key: Buffer): AES {
  return new AES(unmergeKeyMac(key).slice(0, 16));
}
/* KEY MAC VERIFICATION */
export function unmergeKeyMac(key: Buffer): Buffer {
  const newKey = Buffer.alloc(32);
  if (typeof key === "string") key = Buffer.from(key);
  key.copy(newKey);
  for (let i = 0; i < 16; i++) {
    newKey.writeUInt8(newKey.readUInt8(i) ^ newKey.readUInt8(16 + i), i);
  }
  return newKey;
}

export function mergeKeyMac(key: Buffer, mac: Buffer): Buffer {
  const newKey = Buffer.alloc(32);
  key.copy(newKey);
  mac.copy(newKey, 24);

  for (let i = 0; i < 16; i++) {
    newKey.writeUInt8(newKey.readUInt8(i) ^ newKey.readUInt8(16 + i), i);
  }

  return newKey;
}

/**
 * Derive client random bytes, userHash, encrypted master key, key_aes
 * @param password
 * @param masterKey
 * @returns {[ randomBytes, encryptedKey, userHash, aes]}
 */
export function deriveKeys(password: string, masterKey: Buffer): { hak: Buffer; crv: Buffer, k: Buffer, aes: AES} {
  const crv = randomBytes(16);
  const salt = createSalt(crv);
  const [passwordKey, hashUser] = key.prepare.v2(Buffer.from(password, "utf8"), salt);
  const KEY_AES = new AES(passwordKey);
  const hak = createHash("sha256")
      .update(hashUser)
      .digest()
      .subarray(0, 16);


  return {
    crv,
    k: KEY_AES.encrypt.ecb(masterKey),
    hak,
    aes: KEY_AES,
  };
}
export const key = {
  mergeMac: mergeKeyMac,
  unmergeMac: unmergeKeyMac,
  prepare: prepare,
};
