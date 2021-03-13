
import { d64, formatKey, AES, getCipher } from "../crypto";
import { Schema$File, Options$LoadMetadata, Schema$Properties } from "../types";
import Api from "../api";
import mime from "mime-types"


export default class Properties {
    aes: AES;
    api: Api;

    /**
     * Load metadata from logged cloudDruve
     * @param param
     * @param aes 
     */
    static loadMetadata({ a, s, ts, t, k, u }: Options$LoadMetadata, aes: AES) {
        /* HANDLING FILE INFO */
        let metadata: Schema$File = {
            size: s || 0,
            createdTime: ts || 0,
            type: t,
            isDir: !!t,
            owner: u,
        };

        let parts = k.split(":");
        let key = formatKey(parts[parts.length - 1]);
        /* DECRYPTING KEY WITH AES */
        metadata.key = aes.decryptECB(key);
        if (a) {
            let properties = Properties.decrypt(a, key);
            metadata = { ...metadata, properties }
        }
        return metadata;
    }

    static decrypt(attrsEnc, key): Schema$Properties {
        let decAttrs = getCipher(key).decryptCBC(d64(attrsEnc));
        let unpackAttrs = Properties.unpack(decAttrs);
        if (unpackAttrs) {
            return Properties.parse(unpackAttrs);
        }
    }

    static parse(attrs): Schema$Properties{
        let { n, lbl, fav, folderColorRgb, target, videoMediaMetadata, ...props } = attrs;
        let properties = {
            name: n,
            label: LABEL_NAMES[lbl || 0],
            starred: !!fav,
            folderColorRgb: folderColorRgb || "white",
            ...props,
        };
        target && (properties.target = target)
        properties.mimeType = target ? "application/shortcut" : mime.lookup(n)
        videoMediaMetadata && (properties.videoMediaMetadata = JSON.parse(videoMediaMetadata))
       
       
        return properties
    }

    static unpack(attrs) {
        let end = 0;
        while (end < attrs.length && attrs.readUInt8(end)) end++;
        attrs = attrs.slice(0, end).toString();
        return JSON.parse(attrs.substr(4));
    }

    static unparse(attrs: Schema$Properties) {
        let { name, label, starred, folderColorRgb, mimeType,...props } = attrs
        return {
            n: name,
            lbl: label,
            fav: starred ? 1 : 0,
            ...props
        }
    }
    static pack(attrs) {
        let at = Buffer.from(`MEGA${JSON.stringify(attrs)}`);
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

