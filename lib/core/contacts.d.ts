import { MegaClient } from "core";
export declare class Contacts {
    private client;
    constructor(client: MegaClient);
    add(email: string): Promise<void>;
}
