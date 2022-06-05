/* eslint-disable valid-jsdoc */
import {Transform} from "stream";
import {mergeKeyMac, AES, CTR, getCipher, MAC} from "./";
import pumpify from "pumpify"
/**
 *
 * @param {Buffer} key its buffer
 * @return encrypter
 */
export function createEncrypterStream(key: Buffer, start = 0): MegaEncrypt {
  start = !start && 0;
  const megaEncrypter = new MegaEncrypt({key,
    start});
  megaEncrypter.on("end", () => {
    const mac = megaEncrypter.ctr.condensedMac();
    megaEncrypter.key = mergeKeyMac(key, mac);
  });
  // megaEncrypter = combine(b2s(randomBytes(16)), megaEncrypter);
  return megaEncrypter;
}

export function megaEncrypt (key, {start}: {start?: number} = {}) {
  start||= 0
  if (start !== 0) throw Error('Encryption cannot start midstream otherwise MAC verification will fail.')

  if (!(key instanceof Buffer)) {
    key = Buffer.from(key)
  }

  console.log({key})

  let stream: any = new Transform({
    transform (chunk, encoding, callback) {
      mac.update(chunk)
      const data = ctr.encrypt(chunk)
      callback(null, Buffer.from(data))
    },
    flush (callback) {
      stream.mac = mac.condense()
      stream.key = mergeKeyMac(key, stream.mac)
      callback()
    }
  })

  if (key.length !== 24) throw Error('Wrong key length. Key must be 192bit.')

  const aes = new AES(key.slice(0, 16))
  const ctr = new CTR(aes, key.slice(16), start)
  const mac = new MAC(aes, key.slice(16))

  //stream = pumpify(chunkSizeSafe(16), stream)
  return stream
}



export class MegaEncrypt extends Transform {
  aes: AES;
  ctr: CTR;
  key: Buffer
  constructor({key, start}) {
    super();
    this.aes = new AES(key.slice(0, 16)); //new AES(key.slice(0, 16));
    this.ctr = new CTR(this.aes, key.slice(16), 0/* start */);
  }
  _transform(chunk: Buffer, encoding: string, cb: () => void): void {
    const chunked = this.ctr.encrypt(chunk);
    this.push(chunked);
    cb();
  }
}


export class MegaDecrypt extends Transform {
  aes: AES;
  ctr: CTR;
  constructor({key}) {
    super();
    this.aes = getCipher(key);
    this.ctr = new CTR(this.aes, key.slice(16), 0);
  }
  _transform(chunk: Buffer, encoding: string, cb: () => void): void {
    this.push(this.ctr.decrypt(chunk));
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

export function megaDecrypt (key, options = { disableVerification: true, start: 0}) {
  const start = options.start || 0
  if (start !== 0) options.disableVerification = true
  if (start % 16 !== 0) throw Error('start argument of megaDecrypt must be a multiple of 16')

  const aes = getCipher(key)
  const ctr = new CTR(aes, key.slice(16), start)
  /* const mac = !options.disableVerification && new MAC(aes, key.slice(16)) */

  let stream = new Transform({
    transform (chunk, encoding, callback) {
      const data = ctr.decrypt(chunk)
     /*  if (mac) mac.update(data) */
      callback(null, Buffer.from(data))
    },
    flush (callback) {
      /* if (mac) stream.mac = mac.condense() */
      /* if (!options.disableVerification && !stream.mac.equals(key.slice(24))) {
        callback(Error('MAC verification failed'))
        return
      } */
      callback()
    }
  })

  stream = pumpify(chunkSizeSafe(16), stream)
  return stream
}


function chunkSizeSafe (size) {
  let last

  return new Transform({
    transform (chunk, encoding, callback) {
      if (last) chunk = Buffer.concat([last, chunk])

      const end = Math.floor(chunk.length / size) * size
      if (!end) {
        last = last ? Buffer.concat([last, chunk]) : chunk
      } else if (chunk.length > end) {
        last = chunk.slice(end)
        this.push(chunk.slice(0, end))
      } else {
        last = undefined
        this.push(chunk)
      }
      callback()
    },
    flush (callback) {
      if (last) this.push(last)
      callback()
    }
  })
}