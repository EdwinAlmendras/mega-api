
import { base64, AES, getCipher } from "../crypto";
import { Schema$File, Options$LoadMetadata, Schema$Properties, GenericObject } from "../types";
import { MegaApiClient } from "./api";
import mime from "mime-types";


export default class Properties {
  aes: AES;
  api: MegaApiClient;

  /**
   * Load metadata from logged cloudDruve
   * @param param
   * @param aes
   */
  static loadMetadata(meta: Options$LoadMetadata, aes: AES): Schema$File {
    const { a: attributes, s, ts, t, k, u } = meta;
    let metadata: Schema$File = {
      size: s || 0,
      createdTime: ts || 0,
      type: Number(t),
      isDir: !!t,
      owner: u,
    };

    const parts: string[] = k.split(":"); // KEY LOOKS LIKE THIS nwIJksom:IWnmdo8JkoaJJklNJ
    const key = base64.decrypt(parts[parts.length - 1]);
    metadata.key = aes.decrypt.ecb(key);
    if (attributes) {
      const properties = Properties.decrypt(attributes, key);
      metadata = {
        ...metadata,
        properties,
      };
    }
    return metadata;
  }

  static decrypt(attrsEnc: string, key: Buffer): Schema$Properties {
    const decAttrs = getCipher(key).decrypt.cbc(base64.decrypt(attrsEnc));
    const unpackAttrs = Properties.unpack(decAttrs);
    if (unpackAttrs) {
      return Properties.parse(unpackAttrs);
    }
  }


  static parse(attrs): Schema$Properties {
    const { n, lbl, fav, folderColorRgb, target, videoMediaMetadata, ...props } = attrs;
    const properties = {
      name: n,
      label: LABEL_NAMES[lbl || 0],
      starred: !!fav,
      folderColorRgb: folderColorRgb || "white",
      mimeType: mime.lookup(n),
      ...props,
    };
    return properties;
  }

  
  static unpack(attrs: Buffer): JSON | Error {
    let end = 0;
    while (end < attrs.length && attrs.readUInt8(end)) end++;
    const attrsParsed = attrs.slice(0, end).toString();
    try {
      return JSON.parse(attrsParsed.substr(4));
    } catch (error) {
      return new Error("Somithing wrong parsing JSON, tried with " + attrs);
    }
  }

  static encrypt(properties: GenericObject, key: Buffer):Buffer {
    const unparsed = this.unparse(properties)
    console.log(unparsed, "unparsed")
    const packed = this.pack(unparsed);
    console.log(packed)
    const encProperties = getCipher(key).encrypt.cbc(packed);
    console.log(encProperties)
    return encProperties
  }
  static unparse(attrs: Schema$Properties): GenericObject {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, label, starred, folderColorRgb, mimeType, ...props } = attrs;
    return {
      n: name,
      lbl: label,
      fav: starred ? 1 : 0,
      ...props,
    };
  }
  /**
   * Compacts a object unparsed { n: "awsome.pdf", label: "green"} to --> "MEGA{"name":"awesome.pdf"...}" --> Buffer
   * @param { GenericObject } attrs
   * @returns { Buffer } packed buffer
   */
  static pack(attrs: GenericObject): Buffer {
    const at = Buffer.from(`MEGA${JSON.stringify(attrs)}`);
    console.log(at)
    const ret = Buffer.alloc(Math.ceil(at.length / 16) * 16);
    at.copy(ret);
    return ret;
  }
}

const LABEL_NAMES = [
  "",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "grey",
];

