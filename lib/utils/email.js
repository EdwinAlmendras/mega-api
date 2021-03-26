"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporaryEmail = exports.Email = void 0;
const axios_1 = __importDefault(require("axios"));
class Email {
}
exports.Email = Email;
class TemporaryEmail extends Email {
    constructor({ email, reload }) {
        super();
        this.gateway = "https://www.temporary-mail.net/api/v1/mailbox/";
        if (!email) {
        }
        this.email = email;
        this.id = email.split("@")[0];
        if (reload) {
            setInterval(this.fetch, 5000);
        }
    }
    async fetch() {
        let { data } = await axios_1.default.get(`${this.gateway}/${this.id}`);
        this.mails = data;
        return data;
    }
    async get(id) {
        let { data } = await axios_1.default.get(`${this.gateway}/${this.id}/${id}`);
        return data;
    }
    async new() {
        let { data } = await axios_1.default.get(`${this.gateway}/keepalive?mailbox=`);
        this.id = data.mailbox;
    }
}
exports.TemporaryEmail = TemporaryEmail;
