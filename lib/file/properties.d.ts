/// <reference types="node" />
import { AES } from "../crypto";
import { Schema$File, Options$LoadMetadata, Schema$Properties } from "../types";
import Api from "../api";
export default class Properties {
    aes: AES;
    api: Api;
    /**
     * Load metadata from logged cloudDruve
     * @param param
     * @param aes
     */
    static loadMetadata(meta: Options$LoadMetadata, aes: AES): Schema$File;
    static decrypt(attrsEnc: any, key: any): Schema$Properties;
    static parse(attrs: any): Schema$Properties;
    static unpack(attrs: any): any;
    static unparse(attrs: Schema$Properties): {
        uid?: string;
        target?: {
            uid?: string;
            url?: string;
            account?: {
                email?: string;
                password?: string;
            };
        };
        posterUrl?: string;
        stars?: string;
        videoMediaMetadata: {
            width: number;
            heigth: number;
        };
        tags?: string[];
        girl?: {
            name?: string;
            studios?: string[];
        };
        n: string;
        lbl: string;
        fav: number;
    };
    static pack(attrs: any): Buffer;
}
