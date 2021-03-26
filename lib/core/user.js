"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const promise_fs_1 = require("promise-fs");
const crypto_1 = require("../crypto");
const events_1 = require("events");
//import { Schema$File, } from "../types";
const url_1 = require("url");
const email_1 = require("../utils/email");
const cheerio_1 = __importDefault(require("cheerio"));
const file_1 = __importDefault(require("../file"));
const crypto_2 = require("crypto");
/*


NOT IMPLEMENTDE YET


  async export() {
     let files = this.files.list(this.);
     let folder = await this.files.create({
       name: "ULTRAMK",
       parent: this.cloudDrive,
       folder: true,
     });
     for await (let file of files) {
       await this.files.move(file.nodeId, folder);
     }
     let link = await this.files.link(folder);
     return link
   }

   async copy(user: User) {
     let link = await this.files.export({nodeId: this.cloudDrive});
     await user.files.import(link, user.cloudDrive);
   }

   async backup() {
     let link = await this.export(this.cloudDrive);
     let user = await register();
     let { email, password } = user;
     await user.files.import(link);
     await saveCredentials({ email, password, title: "backup generic" });
   }




*/
class User extends events_1.EventEmitter {
    constructor(context) {
        super();
        Object.assign(this, context);
    }
    async loadUser() {
        let response = await this.api.request({ a: 'ug' });
        this.name = response.name;
        this.user = response.u;
    }
    /* RETURN FILES OBJECT */
    getFiles() {
        this.files = new file_1.default(this);
        return this.files;
    }
    async saveSession() {
        await promise_fs_1.writeFile("session.json", JSON.stringify({
            key: this.MASTER_KEY,
            sid: this.api.sid,
        }));
    }
    account() {
        return new Account(this.api, this.email);
    }
}
exports.default = User;
class Account {
    constructor(api, email) {
        this.api = api;
        this.email = email;
    }
    info() {
        return new Promise(async (resolve) => {
            let response = await this.api.request({
                a: "uq",
                strg: 1,
                xfer: 1,
                pro: 1,
            });
            const account = {};
            account.type = response.utype;
            account.spaceUsed = response.cstrg;
            account.spaceTotal = response.mstrg;
            account.downloadBandwidthTotal = response.mxfer || Math.pow(1024, 5) * 10;
            account.downloadBandwidthUsed = response.caxfer || 0;
            account.sharedBandwidthUsed = response.csxfer || 0;
            account.sharedBandwidthLimit = response.srvratio;
            resolve(account);
        });
    }
    async changeEmail({ email }) {
        var params = {
            a: 'se',
            aa: 'a',
            e: email, // The new email address
        };
        await this.api.request(params);
    }
    async changePassword({ password }) {
        let keys = crypto_1.deriveKeys(password, crypto_2.randomBytes(32));
        var requestParams = {
            a: 'up',
            k: crypto_1.e64(keys.k),
            uh: crypto_1.e64(keys.hak),
            crv: crypto_1.e64(keys.crv)
        };
        await this.api.request(requestParams);
    }
    async cancel() {
        /* RESPONSE SHOULD BE 0 */
        await this.api.request({ a: 'erm', m: this.email, t: 21 });
        /* THIS WILL BE RECEIVED EMAIL */
        if (this.email.includes("temporary-mail")) {
            let email = new email_1.TemporaryEmail({ reload: false, email: this.email });
            let [{ id }] = await email.fetch();
            let mail = await email.get(id);
            let $ = cheerio_1.default.load(mail.body.html);
            let link = $("a").eq(2).attr("href");
            let { hash } = url_1.parse(link);
            /* HANLDE SEND CONFIRM LINK */
        }
    }
}
exports.Account = Account;
