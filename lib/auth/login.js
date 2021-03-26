"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../api"));
const crypto_1 = require("../crypto");
const user_1 = __importDefault(require("../core/user"));
function login({ email, password }, options) {
    return new Promise(async (resolve, reject) => {
        let aes, userHash;
        const api = new api_1.default(options);
        let { v, s } = await api.request({ a: "us0", user: email });
        // V1 ACCOUNT HADLE LOGIN
        if (v === 1) {
            aes = new crypto_1.AES(crypto_1.prepareKey(Buffer.from(password, "utf8")));
            userHash = crypto_1.e64(aes.stringhash(Buffer.from(email)));
        }
        // V2 ACCOUNT HADLE LOGIN
        else if (v === 2) {
            let deriveKey = crypto_1.prepareKeyV2(Buffer.from(password), s);
            aes = new crypto_1.AES(deriveKey.slice(0, 16));
            userHash = crypto_1.e64(deriveKey.slice(16));
        }
        const params = { a: "us", user: email, uh: userHash };
        try {
            // Geenrating session-id, master-key, rsa-private-key
            let { k, privk, csid } = await api.request(params);
            // decrypt masterkey
            const MASTER_KEY = aes.decryptECB(crypto_1.formatKey(k));
            const KEY_AES = new crypto_1.AES(MASTER_KEY);
            /* save masterkey, sid, privk */
            let t = crypto_1.formatKey(csid);
            //decrypt privk
            const RSA_PRIVATE_KEY = crypto_1.cryptoDecodePrivKey(KEY_AES.decryptECB(crypto_1.formatKey(privk)));
            api.sid = crypto_1.e64(crypto_1.cryptoRsaDecrypt(t, RSA_PRIVATE_KEY).slice(0, 43));
            resolve(new user_1.default({ api, KEY_AES, RSA_PRIVATE_KEY, MASTER_KEY }));
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.default = login;
