/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const globalState={}; const bs=28; const bx2=1<<bs; const bm=bx2-1; const bd=bs>>1; const bdm=(1<<bd)-1; const log2=Math.log(2); function zeros(t: number) {
  const b=[]; for (;t-- >0;)b[t]=0; return b;
} function zclip(t: string | any[]) {
  let b=t.length; if (t[b-1]) return t; for (;b>1&&0===t[b-1];)b--; return t.slice(0, b);
} function nbits(t: number) {
  let b: number; let e=1; return 0!=(b=t>>>16)&&(t=b, e+=16), 0!=(b=t>>8)&&(t=b, e+=8), 0!=(b=t>>4)&&(t=b, e+=4), 0!=(b=t>>2)&&(t=b, e+=2), 0!=(b=t>>1)&&(t=b, e+=1), e;
} function badd(t: string | any[], b: string | any[]) {
  const e=t.length; const o=b.length; if (e<o) return badd(b, t); const n=[]; let r=0; let l=0; for (;l<o; l++)r+=t[l]+b[l], n[l]=r&bm, r>>>=bs; for (;l<e; l++)r+=t[l], n[l]=r&bm, r>>>=bs; return r&&(n[l]=r), n;
} function bsub(t: string | any[], b: string | any[]) {
  const e=t.length; const o=b.length; if (o>e) return []; if (o===e) {
    if (b[o-1]>t[o-1]) return []; if (1===o) return [t[0]-b[0]];
  } const n=[]; let r: number; let l=0; for (r=0; r<o; r++)l+=t[r]-b[r], n[r]=l&bm, l>>=bs; for (;r<e; r++)l+=t[r], n[r]=l&bm, l>>=bs; return l?[]:zclip(n);
} function ip(t: any[], b: number, e: number, o: number, n: number) {
  const r=e&bdm; const l=e>>bd; const u=o&bdm; const f=o>>bd; const i=l*u+f*r; const m=r*u+((i&bdm)<<bd)+t[b]+n; return t[b]=m&bm, n=l*f+(i>>bd)+(m>>bs);
} function bsqr(t: string | any[]) {
  let b: number; let e: number; const o=t.length; const n=zeros(2*o); let r=0; for (b=0; b<o; b++) {
    for (r=ip(n, 2*b, t[b], t[b], 0), e=b+1; e<o; e++)r=ip(n, b+e, 2*t[e], t[b], r); n[b+o]=r;
  } return zclip(n);
} function bmul(t: string | any[], b: string | any[]) {
  let e: number; let o: number; let n: number; const r=t.length; const l=b.length; const u=zeros(r+l-1); for (o=0; o<l; o++) {
    for (e=0, n=0; n<r; n++)e=ip(u, o+n, t[n], b[o], e); u[o+r]=e;
  } return zclip(u);
} function toppart(t: number[], b: number, e: number) {
  let o=0; for (;b>=0&&e-- >0;)o=o*bx2+t[b--]; return o;
} function bdiv(t: string | any[], b: string | any[]) {
  let e: string | any[]; let o: any[]; let n: number; let r: any; let l: number; let u=t.length-1; const f=b.length-1; let i=u-f; if (u<f||u===f&&(t[u]<b[u]||u>0&&t[u]===b[u]&&t[u-1]<b[u-1])) return globalState.q=[0], globalState.mod=t, globalState; if (u===f&&toppart(t, f, 2)/toppart(b, f, 2)<4) {
    for (e=t.concat(), n=0; 0!==(r=bsub(e, b)).length;)e=r, n++; return globalState.q=[n], globalState.mod=e, globalState;
  } let m: any; const c=Math.floor(Math.log(b[f])/log2)+1; const d=bs-c; if (e=t.concat(), o=b.concat(), d) {
    for (l=f; l>0; l--)o[l]=o[l]<<d&bm|o[l-1]>>c; for (o[0]=o[0]<<d&bm, e[u]&bm<<c&bm&&(e[++u]=0, i++), l=u; l>0; l--)e[l]=e[l]<<d&bm|e[l-1]>>c; e[0]=e[0]<<d&bm;
  } const s=zeros(i+1); let g=zeros(i).concat(o); for (;0!==(m=bsub(e, g)).length;)s[i]++, e=m; let a: number; const h=o[f]; const p=toppart(o, f, 2); for (l=u; l>f; l--) {
    a=l-f-1, l>=e.length?s[a]=1:e[l]===h?s[a]=bm:s[a]=Math.floor(toppart(e, l, 2)/h); const t=toppart(e, l, 3); for (;s[a]*p>t;)s[a]--; g=g.slice(1), 0===(m=bsub(e, bmul([s[a]], g))).length&&(s[a]--, m=bsub(e, bmul([s[a]], g))), e=m;
  } if (d) {
    for (l=0; l<e.length-1; l++)e[l]=e[l]>>d|e[l+1]<<c&bm; e[e.length-1]>>=d;
  } return globalState.q=zclip(s), globalState.mod=zclip(e), globalState;
} function simplemod(t: string | any[], b: number) {
  let e: number; let o=0; for (let n=t.length-1; n>=0; n--)o=(((e=t[n])&bdm)+((o=((e>>bd)+(o<<bd))%b)<<bd))%b; return o;
} function bmod(t: string | any[], b: string | any[]) {
  if (1===b.length) {
    if (1===t.length) return [t[0]%b[0]]; if (b[0]<bdm) return [simplemod(t, b[0])];
  } return bdiv(t, b).mod;
} function bmod2(t: string | any[], b: string | any[], e: any[]) {
  const o=t.length-(b.length<<1); if (o>0) return bmod2(t.slice(0, o).concat(bmod2(t.slice(o), b, e)), b, e); let n: any; const r=b.length+1; const l=b.length-1; const u=bmul(t.slice(l), e).slice(r); const f=t.slice(0, r); const i=bmul(u, b).slice(0, r); let m=bsub(f, i); 0===m.length&&(f[r]=1, m=bsub(f, i)); for (let t=0; 0!==(n=bsub(m, b)).length; t++) if (m=n, t>=3) return bmod2(m, b, e); return m;
} function bmodexp(t: string | any[], b: string | any[], e: string | any[]) {
  let o=t.concat(); let n=b.length-1; let r=2*e.length; let l=zeros(r+1); for (l[r]=1, l=bdiv(l, e).q, r=nbits(b[n])-2; n>=0; n--) {
    for (;r>=0; r-=1)o=bmod2(bsqr(o), e, l), b[n]&1<<r&&(o=bmod2(bmul(o, t), e, l)); r=bs-1;
  } return o;
} function RSAdecrypt(t: number | number[], b: any, e: any, o: any, n: any) {
  const r=bmodexp(bmod(t, e), bmod(b, bsub(e, [1])), e); const l=bmodexp(bmod(t, o), bmod(b, bsub(o, [1])), o); let u=bsub(l, r); return badd(bmul(u=0===u.length?bsub(o, u=bmod(bmul(u=bsub(r, l), n), o)):bmod(bmul(u, n), o), e), r);
} function mpi2b(t: string) {
  let b: number; let e=1; const o=[0]; let n=0; let r=256; let l=t.length; if (l<2) return 0; const u=8*(l-2); const f=256*t.charCodeAt(0)+t.charCodeAt(1); if (f>u||f<u-8) return 0; for (let f=0; f<u; f++)(r<<=1)>255&&(r=1, b=t.charCodeAt(--l)), e>bm&&(e=1, o[++n]=0), b&r&&(o[n]|=e), e<<=1; return o;
} function b2s(t: string | any[]) {
  let b: number; let e=1; let o=0; const n=[0]; let r=1; let l=0; const u=t.length*bs; let f=""; for (b=0; b<u; b++)t[o]&e&&(n[l]|=r), (r<<=1)>255&&(r=1, n[++l]=0), (e<<=1)>bm&&(e=1, o++); for (;l>=0&&0===n[l];)l--; for (b=0; b<=l; b++)f=String.fromCharCode(n[b])+f; return f;
}

/**
 * cryptoDecodePrivKey
 * @public
 * @argv privk Buffer Private key
 * @return Private Key
 * @source https://github.com/meganz/webclient/blob/542d98ec61340b1e4fbf0dae0ae457c1bc5d49aa/js/crypto.js#L1448
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function cryptoDecodePrivKey(privk: any) {
  const pubkey = [];

  // decompose private key
  for (let i = 0; i < 4; i++) {
    const l = ((privk[0] * 256 + privk[1] + 7) >> 3) + 2;
    pubkey[i] = mpi2b(privk.toString('binary').substr(0, l));
    if (typeof pubkey[i] === 'number') {
      if (i !== 4 || privk.length >= 16) return false;
      break;
    }
    privk = privk.slice(l);
  }

  return pubkey;
}

import { randomBytes } from "crypto";


function rsaUnpack(buf: number[]) {
  const type = "private";
  const field = {};
  const size = {};
  let offset = {
    private: buf[1] & 0x80 ? buf[1] - 0x80 + 5 : 7,
    public: buf[1] & 0x80 ? buf[1] - 0x80 + 2 : 2,
  }[type];

  function read() {
    let s = buf.readUInt8(offset + 1);

    if (s & 0x80) {
      const n = s - 0x80;
      s = buf[[
        'readUInt8', 'readUInt16BE',
      ][n - 1]](offset + 2);
      offset += n;
    }

    offset += 2;

    const b = buf.slice(offset, offset + s);
    offset += s;
    return b;
  }

  field.modulus = read();

  field.bits = (field.modulus.length - 1) * 8 + Math.ceil(
      Math.log(field.modulus[0] + 1) / Math.log(2),
  );
  field.publicExponent = parseInt(read().toString('hex'), 16);

  if (type === 'private') {
    field.privateExponent = read();
    field.prime1 = read();
    field.prime2 = read();
    field.exponent1 = read();
    field.exponent2 = read();
    field.coefficient = read();
  }

  return field;
}
export function convertPrivk2JWK(privk: any) {
  const key = rsaUnpack(privk);
  const type = "private";

  // The public portion is always present
  const r = Object.assign({kty: 'RSA'}, {
    n: key.modulus,
    e: key.publicExponent,
  });

  // Add private
  if (type === 'private') {
    Object.assign(r, {
      d: key.privateExponent,
      p: key.prime1,
      q: key.prime2,
      dp: key.exponent1,
      dq: key.exponent2,
      qi: key.coefficient,
    });
  }


  const privkArrayBuffer = [];
  for (const key in r) {
    privkArrayBuffer.push(r[key]);
  }

  return privkArrayBuffer;
}
export function encodePrivk(privk: string[]) {
  const plen = privk[3].length * 8;
  const qlen = privk[4].length * 8;
  const dlen = privk[2].length * 8;
  const ulen = privk[7].length * 8;

  let t = String.fromCharCode(qlen / 256) + String.fromCharCode(qlen % 256) + privk[4]
      + String.fromCharCode(plen / 256) + String.fromCharCode(plen % 256) + privk[3]
      + String.fromCharCode(dlen / 256) + String.fromCharCode(dlen % 256) + privk[2]
      + String.fromCharCode(ulen / 256) + String.fromCharCode(ulen % 256) + privk[7];

  while (t.length & 15) t += String.fromCharCode(randomBytes(32));

  return t;
}

/* export function encodePubk(pubkey: string[]) {
  const mlen = pubkey[0].length * 8;
  const elen = pubkey[1].length * 8;

  return String.fromCharCode(mlen / 256) + String.fromCharCode(mlen % 256) + pubkey[0]
  + String.fromCharCode(elen / 256) + String.fromCharCode(elen % 256) + pubkey[1];
}
 */
/**
 * cryptoRsaDecrypt
 * @public
 * @argv ciphertext Buffer
 * @argv privkey Private Key
 * @return Buffer Decrypted plaintext
 * @source https://github.com/meganz/webclient/blob/4d95863d2cdbfb7652d16acdff8bae4b64056549/js/crypto.js#L1468
 */
export function cryptoRsaDecrypt(ciphertext: { toString: (arg0: string) => any; }, privkey: boolean | any[]) {
  const integerCiphertext = mpi2b(ciphertext.toString('binary'));
  const plaintext = b2s(RSAdecrypt(integerCiphertext, privkey[2], privkey[0], privkey[1], privkey[3]));
  return Buffer.from(plaintext, 'binary');
}

