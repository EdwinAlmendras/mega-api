/// <reference types="node" />
import { GenericObject, Schema$File, Schema$Properties, Params$GetData } from "../types";
import * as Types from "../types";
import { MegaClient } from "./";
import { AxiosResponse } from "axios";
import EventEmitter from "events";
import { SSL } from "types";
/**
 * Main class files for every purpose file
 */
export default class Files extends EventEmitter {
    protected client: MegaClient;
    folderIds: {
        root: string;
        trash: string;
        inbox: string;
    };
    shareKeys: GenericObject;
    data: Schema$File[];
    private KEY_AES;
    private api;
    storage: any;
    constructor(client: MegaClient);
    static defaultHandleRetries(tries: any, error: any, cb: any): void;
    fetch(): Promise<Schema$File[]>;
    /**
     * Compose - compons file decrypting and mounting in this.data object
     * @param {Object} f
     * @returns {void}
     */
    compose(f: any): Schema$File;
    /**
     * Parse a file data
     * @param {Object} f
     * @returns {void}
     */
    private parse;
    /**
     * Gets file attributes and parses data with AES Key
     * @param file file encrypted data
     * @param {AES} aes AESKEY for load data
     * @returns
     */
    private loadMetadata;
    /**
     * Get - gets a file data by name or nodeid
     * @param {Object}
     * @returns {Schema$File}
     */
    get({ nodeId, name, parent }: Types.Params$Get): Schema$File;
    /**
     * Gets data from file, customizable with responseType oprion
     * @param {Object}
     * @returns {AxiosResponse["data"]}
     */
    getSource({ nodeId, config, useSSL, range, url }: Params$GetData): Promise<{
        data: AxiosResponse["data"];
        url: string;
    }>;
    upload({ properties, size, target, source, options }: any): Promise<Schema$File>;
    _uploadInternal({ stream, size, source, type, options }: {
        stream: any;
        size: any;
        source: any;
        type: any;
        options: any;
    }): Promise<void>;
    /**
     * Get the thumbnail buffer
     * @param {nodeId} node Id handle file
     * @returns {Promise}
     */
    getThumbnail({ nodeId }: {
        nodeId: string;
    }): Promise<Buffer>;
    /**
     * List files by nodeId
     * @param {Object}
     * @returns {Schema$File[]}
     */
    list({ folderId, onlyFolders }: {
        folderId?: string;
        onlyFolders?: boolean;
    }): Schema$File[];
    getAbsolutePathByName(name: string): string;
    getByPath({ path }: {
        path: string;
    }): Promise<Schema$File>;
    /**
     * Creates new directorie in mount
     * @param {Object} options
     * @returns {Promise}
     */
    makedir(options: {
        name: string;
        parent: string;
        parentName?: string;
        properties?: Schema$Properties;
    }): Promise<Schema$File>;
    /**
     * Creates directory recursively
     * @example rdir("asd/daw/faadcs")
     * @param {Object}
     * @returns {void}
     */
    rdir({ path, parent }: {
        path?: string;
        parent?: string;
    }): Promise<void>;
    search(text: string): Schema$File[];
    exists(name: string): boolean;
    isDir(nodeId: string): boolean;
    /**
     * Deletes a file permanently or move to trash bin
     * @param {Object} params
     * @returns {Promise}
     */
    delete({ nodeId, permanent }: {
        nodeId: string;
        permanent?: boolean;
    }): Promise<void>;
    move({ nodeId, target }: {
        nodeId: string;
        target: string;
    }): Promise<void>;
    update({ nodeId, properties }: Types.Params$Update): Promise<void>;
    /**
     * Exports a file or folder by nodeId
     * @param {{ name, nodeId }} params
     * @returns {Promise<string>} url
     */
    export({ nodeId }: {
        nodeId: string;
    }): Promise<string>;
    loadAttributes({ isDir, downloadId, key }: GenericObject): Promise<GenericObject>;
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
