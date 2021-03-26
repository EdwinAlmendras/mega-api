/// <reference types="node" />
import { AxiosInstance } from "axios";
import { EventEmitter } from "events";
export default class Api extends EventEmitter {
    axios: AxiosInstance;
    keepalive: Boolean;
    counterId: any;
    gateway: string;
    sid: string;
    masterKey: any;
    sn: any;
    constructor(options: {
        keepalive: Boolean;
        useTor: Boolean;
    });
    customRequest(data: any, params: any, config?: {}): Promise<any>;
    request(json: any, retryno?: number, customParams?: {}, ignoreError?: boolean): Promise<any>;
    pull(sn: string, retryno?: number): Promise<unknown>;
    wait(uri: string, sn: string): Promise<unknown>;
    anonSession(): Promise<unknown>;
    close(): void;
}
