/* eslint-disable valid-jsdoc */
import {randomBytes} from "crypto";
import {Transform} from "stream";
// import combine from "stream-combiner";
// import { b2s } from "../utils/util";
import {formatKey, mergeKeyMac, AES, CTR, getCipher} from "./";

/**
 *
 * @param {Buffer} key its buffer
 * @param {Object} param1 sdasd
 * @return encrypter
 */
export function createEncrypterStream(key: Buffer, {start}:
{ start?: number}): MegaEncrypt {
  start = !start && 0;
  key = !key && randomBytes(24);
  key = typeof key === "string" && formatKey(key);
  const megaEncrypter = new MegaEncrypt({key, start});
  megaEncrypter.on("end", () => {
    const mac = megaEncrypter.ctr.condensedMac();
    megaEncrypter.key = mergeKeyMac(key, mac);
  });
  // megaEncrypter = combine(b2s(randomBytes(16)), megaEncrypter);
  return megaEncrypter;
}

export class MegaEncrypt extends Transform {
  aes: AES;
  ctr: CTR;
  key: Buffer
  constructor({key, start}) {
    super();
    this.aes = new AES(key.slice(0, 16));
    this.ctr = new CTR(this.aes, key.slice(16), start);
  }
  _transform(chunk: Buffer, encoding: string, cb: () => void) {
    this.push(this.ctr.encrypt(chunk));
    cb();
  }
}

/*
CREATE ENCRYPTER STREAM WITH KEY
*/
export function createDecrypterStream(key: Buffer): MegaDecrypt {
  const megaDecrypter = new MegaDecrypt({key});
  /*   megaDecrypter.on("end", () => {
      const mac = megaDecrypter.ctr.condensedMac();
      if (!mac.equals(key.slice(24)) && !disableVerification) {
        reject("MAC verification failed");
      }
    }); */
  // megaDecrypter = combine(b2s(randomBytes(16)), megaDecrypter);
  return (megaDecrypter);
}

export class MegaDecrypt extends Transform {
  aes: AES;
  ctr: CTR;
  constructor({key}) {
    super();
    this.aes = getCipher(key);
    this.ctr = new CTR(this.aes, key.slice(16), 0);
  }
  _transform(chunk: Buffer, encoding: string, cb: () => void) {
    this.push(this.ctr.decrypt(chunk));
    cb();
  }
}
