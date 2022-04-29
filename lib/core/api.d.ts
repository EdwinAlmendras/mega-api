/// <reference types="node" />
import { AxiosInstance, AxiosRequestConfig } from "axios";
import { EventEmitter } from "events";
import { MegaClient } from "./";
import * as API from "../types/api";
export declare class MegaApiClient extends EventEmitter {
    private client;
    axios: AxiosInstance;
    keepalive: boolean;
    counterId: any;
    sid: string;
    sn: any;
    errors: {
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        10: string;
        11: string;
        12: string;
        13: string;
        14: string;
        15: string;
        16: string;
        17: string;
        18: string;
    };
    constructor(client: MegaClient);
    configureAxios(config: AxiosRequestConfig): void;
    useTor(enable: boolean): void;
    /**
     * Make customizable request to api mega
     * @param {Object} data
     * @param params query string parameters
     * @param config axios config custom
     * @returns {Object} response data axios
     */
    custom({ data, params, config, }: API.CustomRequest): Promise<API.GenericObject[]>;
    request(obj: API.GenericObject, { retryno, transform }?: {
        retryno?: number;
        transform?: string;
    }): Promise<any>;
    private pull;
    private wait;
    protected close(): void;
}
