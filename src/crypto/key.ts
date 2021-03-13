// @ts-ignore
import crypto from 'crypto'
import { AES } from "./"
// convert user-supplied password array
export function prepareKey (password: Buffer) {
  console.log(password, "password")
  let i, j, r
  let pkey = Buffer.from([147, 196, 103, 227, 125, 176, 199, 164, 209, 190, 63, 129, 1, 82, 203, 86])

  for (r = 65536; r--;) {
    for (j = 0; j < password.length; j += 16) {
      const key = Buffer.alloc(16)

      for (i = 0; i < 16; i += 4) {
        if (i + j < password.length) {
          password.copy(key, i, i + j, i + j + 4)
        }
      }

      pkey = crypto.createCipheriv('aes-128-ecb', key, Buffer.alloc(0))
        .setAutoPadding(false)
        .update(pkey)
    }
  }

  return pkey
}

// The same function but for version 2 accounts
export function prepareKeyV2 (password: Buffer, s) {
  if(!(s instanceof Buffer)) s = Buffer.from(s, 'base64')
  const iterations = 100000
  const digest = 'sha512'

 return  crypto.pbkdf2Sync(password, s, iterations, 32, digest)
}


export function getCipher(key) {
    return new AES(unmergeKeyMac(key).slice(0, 16));
  }


  /* KEY MAC VERIFICATION */
export function unmergeKeyMac(key: Buffer) {
    const newKey = Buffer.alloc(32);
    if (typeof key === "string") key = Buffer.from(key);
    key.copy(newKey);
  
    for (let i = 0; i < 16; i++) {
      newKey.writeUInt8(newKey.readUInt8(i) ^ newKey.readUInt8(16 + i), i);
    }
  
    return newKey;
  }
  
  export function mergeKeyMac(key: Buffer, mac) {
    const newKey = Buffer.alloc(32);
    key.copy(newKey);
    mac.copy(newKey, 24);
  
    for (let i = 0; i < 16; i++) {
      newKey.writeUInt8(newKey.readUInt8(i) ^ newKey.readUInt8(16 + i), i);
    }
  
    return newKey;
  }
  