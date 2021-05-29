/// <reference types="node" />
import { EventEmitter } from "events";
import { Schema$SorageInfo } from "../types";
import { MegaClient } from ".";
export declare class Account extends EventEmitter {
    private client;
    SESSION_ID: string;
    change: {
        email: typeof changeEmail;
        password: typeof changePassword;
    };
    constructor(client: MegaClient);
    login({ email, password, fetch }: {
        email: string;
        password: string;
        fetch?: boolean;
    }): Promise<void>;
    register(user?: any): Promise<void>;
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
