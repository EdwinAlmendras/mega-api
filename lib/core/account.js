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
exports.Account = void 0;
/* eslint-disable max-len */
// eslint-disable-next-line max-len
const crypto_1 = require("../crypto");
const events_1 = require("events");
const url_1 = require("url");
const email_1 = require("../utils/email");
const cheerio_1 = __importDefault(require("cheerio"));
const crypto_2 = require("crypto");
const random_1 = require("../utils/random");
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
class Account extends events_1.EventEmitter {
    constructor(client) {
        super();
        this.client = client;
    }
    login({ email, password, fetch }) {
        return __awaiter(this, void 0, void 0, function* () {
            let aes;
            let userHash;
            const finishLogin = (userHash, aes) => __awaiter(this, void 0, void 0, function* () {
                const params = {
                    a: "us",
                    user: email,
                    uh: userHash,
                };
                // Geenrating session-id, master-key, rsa-private-key
                const { k, privk, csid } = yield this.client.api.request(params);
                const MASTER_KEY = aes.decrypt.ecb(crypto_1.base64.decrypt(k));
                const KEY_AES = new crypto_1.AES(MASTER_KEY);
                const t = crypto_1.base64.decrypt(csid);
                const privKey = KEY_AES.decrypt.ecb(crypto_1.base64.decrypt(privk));
                // eslint-disable-next-line new-cap
                this.client.state.RSA_PRIVATE_KEY = crypto_1.cryptoDecodePrivKey(privKey);
                this.client.state.SESSION_ID = crypto_1.base64.encrypt(crypto_1.cryptoRsaDecrypt(t, this.client.state.RSA_PRIVATE_KEY).slice(0, 43));
                this.client.state.KEY_AES = KEY_AES;
                this.client.state.MASTER_KEY = MASTER_KEY;
                try {
                    yield this.data();
                    if (fetch) {
                        yield this.client.files.fetch();
                    }
                }
                catch (error) {
                    Promise.reject(new Error(error));
                }
            });
            const response = yield this.client.api.request({
                a: "us0",
                user: email,
            });
            const version = response.v;
            const salt = response.salt;
            const passwordBytes = Buffer.from(password, "utf8");
            // V1 ACCOUNT HADLE LOGIN
            if (version === 1) {
                const [passwordKey, uh] = crypto_1.key.prepare.v1(passwordBytes, email);
                aes = new crypto_1.AES(passwordKey);
                userHash = crypto_1.base64.encrypt(uh);
                yield finishLogin(userHash, aes);
            }
            else if (version === 2) {
                const [passwordKey, uh] = crypto_1.key.prepare.v2(passwordBytes, salt);
                aes = new crypto_1.AES(passwordKey);
                userHash = crypto_1.base64.encrypt(uh);
                yield finishLogin(userHash, aes);
            }
        });
    }
    // todo not implemented yet
    register(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user = !user && (yield random_1.generateRandomUser());
                const { firstName, lastName, email, password } = user;
                yield this.anonymous();
                const userRandomBytes = crypto_2.randomBytes(16);
                const salt = crypto_1.createSalt(userRandomBytes);
                const [passwordKey, hashAuthKey] = crypto_1.key.prepare.v2(Buffer.from(password, "utf8"), salt);
                const aes = new crypto_1.AES(passwordKey);
                yield this.client.api.request({
                    a: "uc2",
                    n: crypto_1.base64.encrypt(Buffer.from(firstName + " " + lastName, "utf8")),
                    m: crypto_1.base64.encrypt(Buffer.from(email, "utf8")),
                    crv: crypto_1.base64.encrypt(userRandomBytes),
                    k: crypto_1.base64.encrypt(aes.encrypt.ecb(this.client.state.MASTER_KEY)),
                    hak: crypto_1.base64.encrypt(hashAuthKey),
                    v: 2,
                });
                this.client.state.KEY_AES = new crypto_1.AES(this.client.state.MASTER_KEY);
                yield this.client.api.request({
                    a: "up",
                    terms: "Mq",
                    firstname: crypto_1.base64.encrypt(Buffer.from(firstName, "utf8")),
                    lastname: crypto_1.base64.encrypt(Buffer.from(lastName, "utf8")),
                    name2: crypto_1.base64.encrypt(Buffer.from(`${firstName} ${lastName}`, "utf8")),
                });
                console.log("Please confirm email");
                Promise.resolve();
            }
            catch (error) {
                Promise.reject(new Error(error));
            }
        });
    }
    anonymous() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const masterKey = crypto_2.randomBytes(16);
                this.client.state.MASTER_KEY = masterKey;
                const passwordKey = crypto_2.randomBytes(16);
                const ssc = crypto_2.randomBytes(16);
                const aes = new crypto_1.AES(passwordKey);
                const user = yield this.client.api.request({
                    a: "up",
                    k: crypto_1.base64.encrypt(aes.encrypt.ecb(masterKey)),
                    ts: crypto_1.base64.encrypt(Buffer.concat([ssc, new crypto_1.AES(masterKey).encrypt.ecb(ssc)])),
                });
                const { tsid, k } = yield this.client.api.request({
                    a: "us",
                    user,
                });
                this.client.state.MASTER_KEY = aes.decrypt.ecb(crypto_1.base64.decrypt(k));
                this.client.api.sid = tsid;
                yield this.client.api.request({ a: "ug" });
                const { ph } = yield this.client.api.request({ a: "wpdf" });
                yield this.client.api.request({
                    a: "g",
                    p: ph,
                });
                return Promise.resolve(null);
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
    }
    // eslint-disable-next-line no-multi-spaces
    data() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, u: userId, since, aav } = yield this.client.api.request({ a: 'ug' });
                this.client.state.name = name;
                this.client.state.USER_ID = userId;
                this.client.state.since = since;
                this.client.state.ACCOUNT_VERSION = aav;
                return Promise.resolve({
                    name,
                    userId,
                });
            }
            catch (error) {
                return Promise.reject(new Error(error));
            }
        });
    }
    get credentials() {
        return ({
            MASTER_KEY: this.client.state.MASTER_KEY,
            SESSION_ID: this.SESSION_ID,
        });
    }
    info() {
        return __awaiter(this, void 0, void 0, function* () {
            const { utype, cstrg, mstrg, mxfer, caxfer, srvratio } = yield this.client.api.request({
                a: "uq",
                strg: 1,
                xfer: 1,
                pro: 1,
            });
            return Promise.resolve({
                type: utype,
                space: cstrg,
                spaceTotal: mstrg,
                downloadBandwidthTotal: mxfer || Math.pow(1024, 5) * 10,
                downloadBandwidthUsed: caxfer || 0,
                sharedBandwidthLimit: srvratio,
            });
        });
    }
    cancel() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.api.request({
                a: 'erm',
                m: this.client.state.email,
                t: 21,
            });
            // if email contains temporary email
            if (this.client.state.email.includes("temporary-mail")) {
                const email = new email_1.TemporaryEmail({
                    reload: false,
                    email: this.client.state.email,
                });
                const [{ id }] = yield email.fetch();
                const mail = yield email.get(id);
                const $ = cheerio_1.default.load(mail.body.html);
                const link = $("a").eq(2).attr("href");
                // eslint-disable-next-line no-unused-vars
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { hash } = url_1.parse(link);
                console.log(hash);
                // TODO HANDLE SEND CONFIRM LINK
            }
        });
    }
}
exports.Account = Account;
Account.prototype.change = {
    email: changeEmail,
    password: changePassword,
};
function changeEmail({ email }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.client.api.request({
            a: 'se',
            aa: 'a',
            e: email, // The new email address
        });
        Promise.resolve();
    });
}
function changePassword({ password }) {
    return __awaiter(this, void 0, void 0, function* () {
        const keys = crypto_1.deriveKeys(password, crypto_2.randomBytes(32));
        const requestParams = {
            a: 'up',
            k: crypto_1.base64.encrypt(keys.k),
            uh: crypto_1.base64.encrypt(keys.hak),
            crv: crypto_1.base64.encrypt(keys.crv),
        };
        yield this.api.request(requestParams);
    });
}
