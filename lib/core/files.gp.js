"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
/* Extension of files for Golden Park structure */
class FilesExtended extends _1.Files {
    constructor(client) {
        super(client);
        this.client = client;
        const version = this.client.state.VERSION = "2.0.0";
        this.KEY_AES = this.client.state.KEY_AES;
        this.api = this.client.api;
        const root = this.get({ name: "GOLDEN-PARK@" + version });
        const rootId = this.client.state.ID_ROOT_FOLDER = root.nodeId;
        this.client.state.FOLDERS = this.list({ folderId: rootId }).map((e) => {
            return this.get({ nodeId: e.nodeId });
        });
    }
    ;
}
exports.default = FilesExtended;
;
