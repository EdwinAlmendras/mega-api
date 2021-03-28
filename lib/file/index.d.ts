import { GenericObject, Schema$File, Schema$Properties } from "../types";
import Api from "../api";
import { AES } from "../crypto";
import { Params$Get } from "../types";
export default class Files {
    ID_ROOT_FOLDER: string;
    ID_TRASH: string;
    ID_INBOX: string;
    KEY_AES: AES;
    shareKeys: GenericObject;
    data: any[];
    api: Api;
    user: string;
    name: string;
    constructor(context: any);
    fetch(): Promise<unknown>;
    private compose;
    private parse;
    private loadMetadata;
    get({ nodeId, name, stream, parent }: Params$Get, options?: any): Promise<any>;
    list({ folderId, onlyFolders }: {
        folderId?: string;
        onlyFolders?: Boolean;
    }): Schema$File[];
    dir(options: {
        name: string;
        parent: string;
        parentName?: string;
        properties?: Schema$Properties;
    }): Promise<Schema$File>;
    rdir({ folderPath, parent }: {
        folderPath: any;
        parent: any;
    }): Promise<void>;
    search(text: string): Promise<Schema$File[] | Boolean>;
    exists(name: string): Promise<Boolean>;
    isDir(nodeId: any): any;
    delete({ nodeId, permanent }: {
        nodeId: any;
        permanent: any;
    }): Promise<void>;
    move({ nodeId, target }: {
        nodeId: any;
        target: any;
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
    find({ path }: {
        path: any;
    }): void;
    export({ name, nodeId }: {
        name: any;
        nodeId: any;
    }): Promise<unknown>;
    unexport({ name, nodeId }: {
        name: any;
        nodeId: any;
    }): Promise<unknown>;
    import({ nodeId, url }: {
        nodeId?: string;
        url: string;
    }): Promise<void>;
    loadAttributes({ isDir, downloadId, file, key }: {
        isDir: any;
        downloadId: any;
        file: any;
        key: any;
    }): Promise<any>;
}
