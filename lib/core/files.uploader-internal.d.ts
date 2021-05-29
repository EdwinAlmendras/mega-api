/// <reference types="node" />
import { MegaEncrypt } from "../crypto";
import { Writable, WritableOptions } from "stream";
import { SSL, Uplaod$Params } from "types";
import { MegaClient } from "./";
export declare class UploaderInternal {
    private client;
    constructor(client: MegaClient);
    upload(params: Uplaod$Params): Promise<void>;
    private getUploadUrl;
}
export declare type Action$RequestUrl = "u" | "ufa";
export declare type VersionAccount = 1 | 2;
export interface RequestUrlFile {
    a: Action$RequestUrl;
    ssl: SSL;
    s: number;
    ms: number;
    r: number;
    e: number;
    v: VersionAccount;
}
export interface RequestUrlThumbs {
    a: Action$RequestUrl;
    ssl: SSL;
    s: number;
}
export declare class MegaUploadHandler extends Writable {
    private options;
    private config?;
    encrypter: MegaEncrypt;
    position: number;
    initialChunkSize: number;
    currentChunkSize: number;
    constructor(options: {
        url: string;
        size: number;
    }, config?: WritableOptions);
    _write(chunk: Buffer, encoding: BufferEncoding, cb: (error?: Error | null) => void): Promise<void>;
}
export interface Request$UploadFinish {
    a: "p";
    t: string;
    n: [
        {
            a: string;
            fa?: string;
            h: string;
            k: string;
            t: number;
        }
    ];
}
