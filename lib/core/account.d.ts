/// <reference types="node" />
import { EventEmitter } from "events";
import { Schema$SorageInfo } from "../types";
import { MegaClient } from ".";
import * as Account from "../types/account";
export declare class MegaAccount extends EventEmitter {
    private client;
    SESSION_ID: string;
    change: {
        email: typeof changeEmail;
        password: typeof changePassword;
    };
    constructor(client: MegaClient);
    login({ email, password, fetch }: Account.Params$Login): Promise<boolean>;
    private _loginGetHashAndPasswordKey;
    anonymous(): Promise<void>;
    data(): Promise<{
        name: string;
        userId: string;
    }>;
    get credentials(): {
        MASTER_KEY: Buffer;
        SESSION_ID: string;
    };
    info(): Promise<Schema$SorageInfo>;
    cancel(): Promise<void>;
}
declare function changeEmail({ email }: {
    email: any;
}): Promise<void>;
declare function changePassword({ password }: {
    password: any;
}): Promise<void>;
export {};
