import { MegaClient, Files } from "./";
export default class FilesExtended extends Files {
    protected client: MegaClient;
    private KEY_AES;
    private api;
    constructor(client: MegaClient);
}
