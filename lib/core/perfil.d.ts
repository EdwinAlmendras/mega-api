/// <reference types="node" />
import { MegaClient } from "./";
export declare class Profile {
    private client;
    constructor(client: MegaClient);
    updateAvatar(image: Buffer): Promise<void>;
    getAvatar(): Promise<Buffer>;
}
