/* eslint-disable max-len */
// eslint-disable-next-line max-len
import { AES, deriveKeys, key, cryptoDecodePrivKey, cryptoRsaDecrypt, base64, createSalt } from "../crypto";
import { EventEmitter } from "events";
import { Schema$SorageInfo } from "../types";
import { parse } from "url";
import { TemporaryEmail } from "../utils/email";
import cheerio from "cheerio";
import { randomBytes } from "crypto";
import { MegaClient } from ".";
import { generateRandomUser } from "../utils/random";
import * as Account from "../types/account";
import * as API from "../types/api";

export default class MegaAccount extends EventEmitter {
  SESSION_ID: string;
  change: {
    email: typeof changeEmail,
    password: typeof changePassword,
  };
  constructor(private client: MegaClient) {
    super();
  }
  public async login({ email, password, fetch }: Account.Params$Login): Promise<boolean> {
    const RSA_PRIVK_LENGTH = 43
    const passwordBytes = Buffer.from(password, "utf8");
    const [passwordKey, userHash] = this._loginGetHashAndPasswordKey(passwordBytes, email)
    let aes = new AES(passwordKey);

    const params = {
      a: "us",
      user: email,
      uh: base64.encrypt(userHash),
    };

    const { k, privk, csid }: API.Response$GetLogin = await this.client.api.request(params, { transform: "buffer" });

    const MASTER_KEY = aes.decrypt.ecb(k);
    const KEY_AES = this.client.state.MASTER_KEY = new AES(MASTER_KEY);
    const RSA_PRIVK = this.client.state.RSA_PRIVATE_KEY = cryptoDecodePrivKey(KEY_AES.decrypt.ecb(privk));
    const bufferSessionId = cryptoRsaDecrypt(csid, RSA_PRIVK).slice(0, RSA_PRIVK_LENGTH)

    this.client.state.SESSION_ID = base64.encrypt(bufferSessionId);
    this.client.state.KEY_AES = KEY_AES;

    try {
      await this.data();
      if (fetch) await this.client.files.fetch(); return Promise.resolve(true)
    } catch (error) {
      Promise.reject(new Error(error));
    }

  }
  private async _loginGetHashAndPasswordKey(pwB, email): Buffer[] {
    const { v: version, s: salt } = await this.client.api.request({ a: "us0", user: email });
    if (version === 1) {
      let credentials = key.prepare.v1(passwordBytes, email)
      return Promise.resolve(credentials)
    } else if (version === 2) {
      let credentials = key.prepare.v2(passwordBytes, email)
      return Promise.resolve(credentials)
    } else {
      return Promise.reject("VERSION_ACCOUNT_DONT_SUPPORTED")
    }
  }

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

  public async anonymous(): Promise<void> {
    try {
      const masterKey = randomBytes(16);
      this.client.state.MASTER_KEY = masterKey;
      const passwordKey = randomBytes(16);
      const ssc = randomBytes(16);
      const aes = new AES(passwordKey);
      const user = await this.client.api.request({
        a: "up",
        k: base64.encrypt(aes.encrypt.ecb(masterKey)),
        ts: base64.encrypt(
          Buffer.concat([ssc, new AES(masterKey).encrypt.ecb(ssc)]),
        ),
      });

      const { tsid, k } = await this.client.api.request({
        a: "us",
        user,
      });
      this.client.state.MASTER_KEY = aes.decrypt.ecb(base64.decrypt(k));
      this.client.api.sid = tsid;
      await this.client.api.request({ a: "ug" });
      const { ph } = await this.client.api.request({ a: "wpdf" });
      await this.client.api.request({
        a: "g",
        p: ph,
      },
      );
      return Promise.resolve(null);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // eslint-disable-next-line no-multi-spaces
  async data(): Promise<{ name: string; userId: string }> {
    try {
      const { name, u: userId, since, aav } = await this.client.api.request({ a: 'ug' });
      this.client.state.name = name;
      this.client.state.USER_ID = userId;
      this.client.state.since = since;
      this.client.state.ACCOUNT_VERSION = aav;
      return Promise.resolve({
        name,
        userId,
      });
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  get credentials(): { MASTER_KEY: Buffer; SESSION_ID: string } {
    return ({
      MASTER_KEY: this.client.state.MASTER_KEY,
      SESSION_ID: this.SESSION_ID,
    });
  }

  async info(): Promise<Schema$SorageInfo> {
    const { utype, cstrg, mstrg, mxfer, caxfer, srvratio }:
      {
        utype: number; cstrg: number; mstrg: number; mxfer: number; caxfer: number; srvratio: number;
      } = await this.client.api.request({
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
  }

  async cancel(): Promise<void> {
    await this.client.api.request({
      a: 'erm',
      m: this.client.state.email,
      t: 21,
    });
    // if email contains temporary email
    if (this.client.state.email.includes("temporary-mail")) {
      const email = new TemporaryEmail({
        reload: false,
        email: this.client.state.email,
      });

      const [{ id }] = await email.fetch();
      const mail = await email.get(id);

      const $ = cheerio.load(mail.body.html);
      const link = $("a").eq(2).attr("href");
      // eslint-disable-next-line no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hash } = parse(link);
      console.log(hash);
      // TODO HANDLE SEND CONFIRM LINK
    }
  }
}
Account.prototype.change = {
  email: changeEmail,
  password: changePassword,
};

async function changeEmail({ email }): Promise<void> {
  await this.client.api.request({
    a: 'se', // Set Email
    aa: 'a',
    e: email, // The new email address
  });
  Promise.resolve();
}
async function changePassword({ password }) {
  const keys = deriveKeys(password, randomBytes(32));
  const requestParams = {
    a: 'up',
    k: base64.encrypt(keys.k),
    uh: base64.encrypt(keys.hak),
    crv: base64.encrypt(keys.crv),
  };
  await this.api.request(requestParams);
}


