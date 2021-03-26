import User from "../core/user";
interface ParamsAuth {
    email: string;
    password: string;
}
export default function login({ email, password }: ParamsAuth, options?: any): Promise<User>;
export {};
