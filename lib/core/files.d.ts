/// <reference types="node" />
import { GenericObject, Schema$File, Schema$Properties } from "../types";
import { MegaClient } from "./";
import { AxiosResponse } from "axios";
import { Params$GetData } from "../types";
import EventEmitter from "events";
import { MegaApiClient } from "./api";
/**
 * Class uploader - return instance upload - for upload any into folder
 */
export declare class Uploader {
    client: MegaApiClient;
    FOLDER_ROOT: string;
    constructor(client: MegaApiClient);
}
/**
 * Main class files for every purpose file
 */
export default class Files extends EventEmitter {
    private client;
    ID_ROOT_FOLDER: string;
    ID_TRASH: string;
    ID_INBOX: string;
    shareKeys: GenericObject;
    data: Schema$File[];
    private KEY_AES;
    private api;
    constructor(client: MegaClient);
    /**
     * fetch fetch all mount files for user storage
     * @return {null}
     */
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
     * Gets download url from node
     * @param param0
     * @returns
     */
    /**
     * Get - gets a file data by name or nodeid
     * @param {Object}
     * @returns {Schema$File}
     */
    get({ nodeId, name, parent }: {
        nodeId?: string;
        name?: string;
        parent?: string;
    }): Schema$File;
    /**
     * Gets data from file, customizable with responseType oprion
     * @param {Object}
     * @returns {AxiosResponse["data"]}
     */
    getData({ nodeId, options, responseType, }: Params$GetData): Promise<AxiosResponse["data"]>;
    /**
     * List files by nodeId
     * @param {Object}
     * @returns {Schema$File[]}
     */
    list({ folderId, onlyFolders }: {
        folderId?: string;
        onlyFolders?: boolean;
    }): Schema$File[];
    /**
     * Creates new directorie in mount
     * @param {Object} options
     * @returns {Promise}
     */
    dir(options: {
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
    rdir({ folderPath, parent }: {
        folderPath?: string;
        parent?: string;
    }): Promise<void>;
    search(text: string): Promise<Schema$File[] | boolean>;
    exists(name: string): Promise<boolean>;
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
    update({ name, nodeId, properties, }: {
        name?: string;
        nodeId?: string;
        properties?: any;
    }): Promise<void>;
    shortcut({ name, nodeId }: {
        name?: string;
        nodeId?: string;
    }, { parent, props }: any): Promise<void>;
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
