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
exports.MegaAccount = void 0;
/* eslint-disable max-len */
// eslint-disable-next-line max-len
const crypto_1 = require("../crypto");
const events_1 = require("events");
const url_1 = require("url");
const email_1 = require("../utils/email");
const cheerio_1 = __importDefault(require("cheerio"));
const crypto_2 = require("crypto");
const constants_1 = require("./constants");
const fs_1 = require("fs");
class MegaAccount extends events_1.EventEmitter {
    constructor(client) {
        super();
        this.client = client;
    }
    login({ email, password, fetch, saveSession }) {
        return __awaiter(this, void 0, void 0, function* () {
            const passwordBytes = Buffer.from(password, "utf8");
            const { passwordKey, userHash } = yield this._loginGetHashAndPasswordKey(passwordBytes, email);
            const aes = new crypto_1.AES(passwordKey);
            const params = {
                a: "us",
                user: email,
                uh: crypto_1.base64.encrypt(userHash),
            };
            let response;
            try {
                response = yield this.client.api.request(params, { transform: "buffer" });
            }
            catch (error) {
                return Promise.reject(error);
            }
            const { k, privk, csid } = response;
            const MASTER_KEY = (this.client.state.MASTER_KEY = aes.decrypt.ecb(k));
            const KEY_AES = (this.client.state.KEY_AES = new crypto_1.AES(MASTER_KEY));
            const RSA_PRIVK = (this.client.state.RSA_PRIVATE_KEY = crypto_1.cryptoDecodePrivKey(KEY_AES.decrypt.ecb(privk)));
            const sessionIdBuffer = crypto_1.cryptoRsaDecrypt(csid, RSA_PRIVK).slice(0, constants_1.RSA_PRIVK_LENGTH);
            const SESSION_ID = (this.client.state.SESSION_ID = crypto_1.base64.encrypt(sessionIdBuffer));
            console.log({ KEY_AES, RSA_PRIVK, SESSION_ID });
            try {
                yield this.data();
                console.log("point data");
                if (fetch) {
                    yield this.client.files.fetch();
                    console.log("point files");
                }
                if (saveSession) {
                    const dataSession = { MASTER_KEY: crypto_1.base64.encrypt(MASTER_KEY), RSA_PRIVK, SESSION_ID };
                    fs_1.writeFileSync(constants_1.PATH_SESSION, JSON.stringify(dataSession));
                }
                return Promise.resolve(true);
            }
            catch (error) {
                console.log(error);
                Promise.reject(new Error(error));
            }
        });
    }
    resumeSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const json = fs_1.readFileSync(constants_1.PATH_SESSION, { encoding: "utf-8" });
            const credentials = JSON.parse(json);
            this.client.state.SESSION_ID = credentials.SESSION_ID;
            this.client.state.RSA_PRIVATE_KEY = credentials.RSA_PRIVATE_KEY;
            this.client.state.MASTER_KEY = crypto_1.base64.decrypt(credentials.MASTER_KEY);
            this.client.state.KEY_AES = new crypto_1.AES(this.client.state.MASTER_KEY);
            yield this.data();
            yield this.client.files.fetch();
        });
    }
    _loginGetHashAndPasswordKey(passwordBytes, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const { v: version, s: salt } = yield this.client.api.request({
                a: "us0",
                user: email,
            });
            if (version === 1) {
                const credentials = crypto_1.key.prepare.v1(passwordBytes, email);
                return Promise.resolve(credentials);
            }
            else if (version === 2) {
                const credentials = crypto_1.key.prepare.v2(passwordBytes, salt);
                return Promise.resolve(credentials);
            }
            else {
                return Promise.reject(new Error("VERSION_ACCOUNT_DONT_SUPPORTED"));
            }
        });
    }
    /*
    public async register(user?: any): Promise<void> {
      try {
        user = !user && await generateRandomUser();
        const { firstName, lastName, email, password } = user;
        await this.anonymous();
        const userRandomBytes = randomBytes(16);
        const salt = createSalt(userRandomBytes);
        const [passwordKey, hashAuthKey] = key.prepare.v2(Buffer.from(password, "utf8"), salt);
        const aes = new AES(passwordKey);
        await this.client.api.request({
          a: "uc2",
          n: base64.encrypt(Buffer.from(firstName + " " + lastName, "utf8")), // Name (used just for the email)
          m: base64.encrypt(Buffer.from(email, "utf8")), // Email
          crv: base64.encrypt(userRandomBytes), // Client Random Value
          k: base64.encrypt(aes.encrypt.ecb(this.client.state.MASTER_KEY)), // Encrypted Master Key
          hak: base64.encrypt(hashAuthKey), // Hashed Authentication Key
          v: 2,
        });
        this.client.state.KEY_AES = new AES(this.client.state.MASTER_KEY);
        await this.client.api.request({
          a: "up",
          terms: "Mq",
          firstname: base64.encrypt(Buffer.from(firstName, "utf8")),
          lastname: base64.encrypt(Buffer.from(lastName, "utf8")),
          name2: base64.encrypt(Buffer.from(`${firstName} ${lastName}`, "utf8")),
        });
        console.log("Please confirm email");
        Promise.resolve();
      } catch (error) {
        Promise.reject(new Error(error));
      }
    }
   */
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
                const { name, u: userId, since, aav } = yield this.client.api.request({ a: "ug" });
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
        return {
            MASTER_KEY: this.client.state.MASTER_KEY,
            SESSION_ID: this.SESSION_ID,
        };
    }
    info() {
        return __awaiter(this, void 0, void 0, function* () {
            const { utype, cstrg, mstrg, mxfer, caxfer, srvratio, } = yield this.client.api.request({
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
                a: "erm",
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
exports.MegaAccount = MegaAccount;
function changeEmail({ email }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.client.api.request({
            a: "se",
            aa: "a",
            e: email, // The new email address
        });
        Promise.resolve();
    });
}
function changePassword({ password }) {
    return __awaiter(this, void 0, void 0, function* () {
        const keys = crypto_1.deriveKeys(password, crypto_2.randomBytes(32));
        const requestParams = {
            a: "up",
            k: crypto_1.base64.encrypt(keys.k),
            uh: crypto_1.base64.encrypt(keys.hak),
            crv: crypto_1.base64.encrypt(keys.crv),
        };
        yield this.api.request(requestParams);
    });
}
