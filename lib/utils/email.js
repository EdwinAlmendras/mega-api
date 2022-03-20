"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.email = email;
        this.id = email.split("@")[0];
        if (reload) {
            setInterval(this.fetch, 5000);
        }
    }
    static generateRandomMail() {
        return __awaiter(this, void 0, void 0, function* () {
            const mailbox = (yield axios_1.default.get("https://www.temporary-mail.net/api/v1/mailbox/keepalive?mailbox=")).data.mailbox;
            const email = mailbox + "@temporary-mail.net";
            return (email);
        });
    }
    fetch() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${this.gateway}/${this.id}`);
            this.mails = data;
            return data;
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${this.gateway}/${this.id}/${id}`);
            return data;
        });
    }
    new() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get(`${this.gateway}/keepalive?mailbox=`);
            this.id = data.mailbox;
        });
    }
}
exports.TemporaryEmail = TemporaryEmail;
