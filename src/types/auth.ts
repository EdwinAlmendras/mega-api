export interface Params$Login {
    email: string;
    password: string;
}

export interface Schema$Credentials {
    MASTER_KEY: Buffer;
    SESSION_ID: string
}