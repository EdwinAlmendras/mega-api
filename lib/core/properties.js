"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("../crypto");
const mime_types_1 = __importDefault(require("mime-types"));
class Properties {
    /**
     * Load metadata from logged cloudDruve
     * @param param
     * @param aes
     */
    static loadMetadata(meta, aes) {
        const { a: attributes, s, ts, t, k, u } = meta;
        let metadata = {
            size: s || 0,
            createdTime: ts || 0,
            type: Number(t),
            isDir: !!t,
            owner: u,
        };
        const parts = k.split(":"); // KEY LOOKS LIKE THIS nwIJksom:IWnmdo8JkoaJJklNJ
        const key = crypto_1.base64.decrypt(parts[parts.length - 1]);
        metadata.key = aes.decrypt.ecb(key);
        if (attributes) {
            const properties = Properties.decrypt(attributes, key);
            metadata = Object.assign(Object.assign({}, metadata), { properties });
        }
        return metadata;
    }
    static decrypt(attrsEnc, key) {
        const decAttrs = crypto_1.getCipher(key).decrypt.cbc(crypto_1.base64.decrypt(attrsEnc));
        const unpackAttrs = Properties.unpack(decAttrs);
        if (unpackAttrs) {
            return Properties.parse(unpackAttrs);
        }
    }
    static parse(attrs) {
        const { n, lbl, fav, folderColorRgb, target, videoMediaMetadata } = attrs, props = __rest(attrs, ["n", "lbl", "fav", "folderColorRgb", "target", "videoMediaMetadata"]);
        const properties = Object.assign({ name: n, label: LABEL_NAMES[lbl || 0], starred: !!fav, folderColorRgb: folderColorRgb || "white", mimeType: mime_types_1.default.lookup(n) }, props);
        return properties;
    }
    static unpack(attrs) {
        let end = 0;
        while (end < attrs.length && attrs.readUInt8(end))
            end++;
        const attrsParsed = attrs.slice(0, end).toString();
        try {
            return JSON.parse(attrsParsed.substr(4));
        }
        catch (error) {
            return new Error("Somithing wrong parsing JSON, tried with " + attrs);
        }
    }
    static encrypt(properties, key) {
        const unparsed = this.unparse(properties);
        console.log(unparsed, "unparsed");
        const packed = this.pack(unparsed);
        console.log(packed);
        const encProperties = crypto_1.getCipher(key).encrypt.cbc(packed);
        console.log(encProperties);
        return encProperties;
    }
    static unparse(attrs) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, label, starred, folderColorRgb, mimeType } = attrs, props = __rest(attrs, ["name", "label", "starred", "folderColorRgb", "mimeType"]);
        return Object.assign({ n: name, lbl: label, fav: starred ? 1 : 0 }, props);
    }
    /**
     * Compacts a object unparsed { n: "awsome.pdf", label: "green"} to --> "MEGA{"name":"awesome.pdf"...}" --> Buffer
     * @param { GenericObject } attrs
     * @returns { Buffer } packed buffer
     */
    static pack(attrs) {
        const at = Buffer.from(`MEGA${JSON.stringify(attrs)}`);
        console.log(at);
        const ret = Buffer.alloc(Math.ceil(at.length / 16) * 16);
        at.copy(ret);
        return ret;
    }
}
exports.default = Properties;
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
