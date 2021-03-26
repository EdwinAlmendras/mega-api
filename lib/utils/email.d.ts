export declare class Email {
    email: string;
    id: string;
}
export declare class TemporaryEmail extends Email {
    gateway: string;
    mails: Array<any>;
    constructor({ email, reload }: {
        email: any;
        reload: any;
    });
    fetch(): Promise<any>;
    get(id: any): Promise<any>;
    new(): Promise<void>;
}
