/// <reference types="node" />
import { AES } from "../crypto";
import { EventEmitter } from "events";
import Api from "../api";
import Files from "../file";
export default class User extends EventEmitter {
    api: Api;
    files: Files;
    MASTER_KEY: Buffer;
    RSA_PRIVATE_KEY: any[];
    KEY_AES: AES;
    email: string;
    password: string;
    name: string;
    user: string;
    constructor(context: any);
    loadUser(): Promise<void>;
    getFiles(): Files;
    saveSession(): Promise<void>;
    account(): Account;
}
export declare class Account {
    api: Api;
    email: string;
    KEY_AES: AES;
    constructor(api: any, email: any);
    info(): Promise<unknown>;
    changeEmail({ email }: {
        email: any;
    }): Promise<void>;
    changePassword({ password }: {
        password: any;
    }): Promise<void>;
    cancel(): Promise<void>;
}
