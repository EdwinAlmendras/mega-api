
import Api from "../api"
import { AES, cryptoDecodePrivKey, cryptoRsaDecrypt, e64, formatKey, prepareKey, prepareKeyV2 } from "../crypto";
import User from "../core/user"

interface ParamsAuth {
    email: string;
    password: string;
}

export default function login({ email, password }: ParamsAuth, options): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let aes: any, userHash;

        const api = new Api(options)

        let { v, s } = await api.request({ a: "us0", user: email });

        // V1 ACCOUNT HADLE LOGIN
        if (v === 1) {
            aes = new AES(prepareKey(Buffer.from(password, "utf8")));
            userHash = e64(aes.stringhash(Buffer.from(email)));
        }
        // V2 ACCOUNT HADLE LOGIN

        else if (v === 2) {
            let deriveKey = prepareKeyV2(Buffer.from(password), s);
            aes = new AES(deriveKey.slice(0, 16));
            userHash = e64(deriveKey.slice(16));
        }
        const params = { a: "us", user: email, uh: userHash };

        try {

            // Geenrating session-id, master-key, rsa-private-key
            let { k, privk, csid } = await api.request(params);

            // decrypt masterkey
            const MASTER_KEY = aes.decryptECB(formatKey(k));

            const KEY_AES = new AES(MASTER_KEY);


            /* save masterkey, sid, privk */
            let t = formatKey(csid);
            //decrypt privk
            const RSA_PRIVATE_KEY = cryptoDecodePrivKey(KEY_AES.decryptECB(formatKey(privk)));
            api.sid = e64(cryptoRsaDecrypt(t, RSA_PRIVATE_KEY).slice(0, 43));
            resolve(new User({api, KEY_AES, RSA_PRIVATE_KEY, MASTER_KEY}))
        } catch (error) {
            reject(error)
        }
    });
}