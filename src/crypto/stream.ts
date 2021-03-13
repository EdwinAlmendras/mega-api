import { randomBytes } from "crypto";

import { Transform } from "stream";
//import combine from "stream-combiner";
//import { b2s } from "../utils/util";
import { formatKey, mergeKeyMac, AES, CTR,getCipher} from "./"
// @ts-nocheck 

/* 
CREATE ENCRYPTER STREAM WITH KEY
*/
export function createEncrypterStream(key, { start }) {
    start = !start && 0;
    key = !key && randomBytes(24);
    key = typeof key === "string" && formatKey(key);
    let megaEncrypter = new MegaEncrypt({ key, start });
    megaEncrypter.on("end", () => {
      const mac = megaEncrypter.ctr.condensedMac();
      megaEncrypter.key = mergeKeyMac(key, mac);
    });
    //megaEncrypter = combine(b2s(randomBytes(16)), megaEncrypter);
    return megaEncrypter;
  }
  
  export class MegaEncrypt extends Transform {
    aes: AES;
    ctr: CTR;
    key: Buffer
    constructor({ key, start }) {
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
  export function createDecrypterStream(key: Buffer): any {
    return new Promise(async (resolve, reject) => {
      let megaDecrypter = new MegaDecrypt({ key});
    /*   megaDecrypter.on("end", () => {
        const mac = megaDecrypter.ctr.condensedMac();
        if (!mac.equals(key.slice(24)) && !disableVerification) {
          reject("MAC verification failed");
        }
      }); */
     // megaDecrypter = combine(b2s(randomBytes(16)), megaDecrypter);
      resolve(megaDecrypter);
    });
  }
  
  export class MegaDecrypt extends Transform {
    aes: AES;
    ctr: CTR;
    constructor({ key}) {
      super();
      this.aes = getCipher(key);
      this.ctr = new CTR(this.aes, key.slice(16), 0);
    }
    _transform(chunk: Buffer, encoding: string, cb: () => void) {
      this.push(this.ctr.decrypt(chunk));
      cb();
    }
  }
  