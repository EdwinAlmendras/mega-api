export declare class Email {
    email: string;
    id: string;
}
export declare class TemporaryEmail extends Email {
    gateway: string;
    mails: Array<any>;
    static mailbox: string;
    static email: string;
    constructor({ email, reload }: {
        email: string;
        reload?: boolean;
    });
    static generateRandomMail(): Promise<string>;
    fetch(): Promise<any[]>;
    get(id: any): Promise<any>;
    new(): Promise<void>;
}
