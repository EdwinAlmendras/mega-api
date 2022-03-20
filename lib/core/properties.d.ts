/// <reference types="node" />
import { AES } from "../crypto";
import { Schema$File, Options$LoadMetadata, Schema$Properties, GenericObject } from "../types";
import { MegaApiClient } from "./api";
export default class Properties {
    aes: AES;
    api: MegaApiClient;
    /**
     * Load metadata from logged cloudDruve
     * @param param
     * @param aes
     */
    static loadMetadata(meta: Options$LoadMetadata, aes: AES): Schema$File;
    static decrypt(attrsEnc: string, key: Buffer): Schema$Properties;
    static parse(attrs: any): Schema$Properties;
    static unpack(attrs: Buffer): JSON | Error;
    static unparse(attrs: Schema$Properties): GenericObject;
    /**
     * Compacts a object unparsed { n: "awsome.pdf", label: "green"} to --> "MEGA{"name":"awesome.pdf"...}" --> Buffer
     * @param { GenericObject } attrs
     * @returns { Buffer } packed buffer
     */
    static pack(attrs: GenericObject): Buffer;
}
