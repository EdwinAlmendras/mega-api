"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var crypto_1 = require("../crypto");
var mime_types_1 = __importDefault(require("mime-types"));
var Properties = /** @class */ (function () {
    function Properties() {
    }
    /**
     * Load metadata from logged cloudDruve
     * @param param
     * @param aes
     */
    Properties.loadMetadata = function (meta, aes) {
        var a = meta.a, s = meta.s, ts = meta.ts, t = meta.t, k = meta.k, u = meta.u;
        /* HANDLING FILE INFO */
        var metadata = {
            size: s || 0,
            createdTime: ts || 0,
            type: Number(t),
            isDir: !!t,
            owner: u,
        };
        var parts = k.split(":");
        var key = crypto_1.formatKey(parts[parts.length - 1]);
        /* DECRYPTING KEY WITH AES */
        metadata.key = aes.decryptECB(key);
        if (a) {
            var properties = Properties.decrypt(a, key);
            metadata = __assign(__assign({}, metadata), { properties: properties });
        }
        return metadata;
    };
    Properties.decrypt = function (attrsEnc, key) {
        var decAttrs = crypto_1.getCipher(key).decryptCBC(crypto_1.d64(attrsEnc));
        var unpackAttrs = Properties.unpack(decAttrs);
        if (unpackAttrs) {
            return Properties.parse(unpackAttrs);
        }
    };
    Properties.parse = function (attrs) {
        var n = attrs.n, lbl = attrs.lbl, fav = attrs.fav, folderColorRgb = attrs.folderColorRgb, target = attrs.target, videoMediaMetadata = attrs.videoMediaMetadata, props = __rest(attrs, ["n", "lbl", "fav", "folderColorRgb", "target", "videoMediaMetadata"]);
        var properties = __assign({ name: n, label: LABEL_NAMES[lbl || 0], starred: !!fav, folderColorRgb: folderColorRgb || "white" }, props);
        target && (properties.target = target);
        properties.mimeType = target ? "application/shortcut" : mime_types_1.default.lookup(n);
        videoMediaMetadata && (properties.videoMediaMetadata = JSON.parse(videoMediaMetadata));
        return properties;
    };
    Properties.unpack = function (attrs) {
        var end = 0;
        while (end < attrs.length && attrs.readUInt8(end))
            end++;
        attrs = attrs.slice(0, end).toString();
        try {
            return JSON.parse(attrs.substr(4));
        }
        catch (error) {
            console.log("error parsing JSON");
        }
    };
    Properties.unparse = function (attrs) {
        var name = attrs.name, label = attrs.label, starred = attrs.starred, folderColorRgb = attrs.folderColorRgb, mimeType = attrs.mimeType, props = __rest(attrs, ["name", "label", "starred", "folderColorRgb", "mimeType"]);
        return __assign({ n: name, lbl: label, fav: starred ? 1 : 0 }, props);
    };
    Properties.pack = function (attrs) {
        var at = Buffer.from("MEGA" + JSON.stringify(attrs));
        var ret = Buffer.alloc(Math.ceil(at.length / 16) * 16);
        at.copy(ret);
        return ret;
    };
    return Properties;
}());
exports.default = Properties;
var LABEL_NAMES = [
    "",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "grey",
];
