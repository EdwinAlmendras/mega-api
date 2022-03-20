import Files from "./files";
import { MegaApiClient } from "./api";
import { MegaAccount } from "./account";
import { State } from "./state";
import { Contacts } from "./contacts";
/**
 * Main function handler
 */
export { default as Files } from "./files";
export declare class MegaClient {
    state: State;
    api: MegaApiClient;
    account: MegaAccount;
    files: Files;
    contacts: Contacts;
}
