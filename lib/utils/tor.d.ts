import { AxiosInstance } from "axios";
export declare class Tor {
    process: any;
    constructor();
    start(): Promise<AxiosInstance>;
    kill(): void;
}
export declare function torSetup({ ip, port, path, controlPort, controlPassword }: {
    ip?: string;
    port?: string;
    path?: string;
    controlPort?: string;
    controlPassword?: string;
}): any;
export declare function torIPC(commands: any): Promise<unknown>;
export default Tor;
