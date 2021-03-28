/// <reference types="node" />
import { ResponseType, AxiosRequestConfig } from "axios";
export interface Schema$File {
    nodeId?: string;
    name?: string;
    downlaodId?: string;
    createdTime?: number;
    type?: number;
    owner?: string;
    isDir?: boolean;
    size?: number | string;
    parent?: any;
    downloadId?: string;
    shareKey?: string;
    key?: Buffer;
    properties?: Schema$Properties;
}
export interface Schema$Properties {
    name?: string;
    uid?: string;
    folderColorRgb?: string;
    mimeType?: string;
    label?: string;
    starred?: boolean;
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
}
export interface Options$LoadMetadata {
    a: string;
    s: number;
    ts: number;
    t: string;
    u: string;
    k: string;
}
export interface Params$Get {
    nodeId?: string;
    name?: string;
    parent?: string;
    responseType?: ResponseType;
    config?: AxiosRequestConfig;
}
