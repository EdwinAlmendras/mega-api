import url from "url";
import axios from "axios";
import { e64, prepareKeyV2, AES, createSalt } from "../crypto";
import { encodePrivk, encodePubk, convertPrivk2JWK } from "../crypto/rsa";
import cheerio from "cheerio";
import { randomBytes, createHash } from "crypto";
import faker from "faker";
import Mega$Api from "../mega/api";
import Mega$User from "../mega/user";
import Mega from "../mega";
import { Schema$DataNewUser } from "../types";
import NodeRSA from "node-rsa";

export default class Register {
  api: Mega$Api;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  context: Mega;
  aes: AES;
  mailbox: string;
  constructor(context: Mega, dataNewUser?: Schema$DataNewUser) {
    Object.assign(this, { ...dataNewUser, ...context });
    this.api = new Mega$Api();
  }

  async random() {
    /* GETTING ID OF TEMPORARY EMAIL */
    this.mailbox = (
      await axios.get(
        "https://www.temporary-mail.net/api/v1/mailbox/keepalive?mailbox="
      )
    ).data.mailbox;

    /* GENERATING RANDOM DATA USER */
    let user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: this.mailbox + "@temporary-mail.net",
      password: this.mailbox + "@temporary-mail.net",
    };

    console.log("generate : " + user);
    Object.assign(this, user);
  }

  async create(): Promise<Mega$User> {
    return new Promise(async (resolve, reject) => {
      if (!this.email) await this.random();
      await this.api.anonSession();
      let userRandomBytes = randomBytes(16);
      let salt = createSalt(userRandomBytes);
      let deriveKey = prepareKeyV2(Buffer.from(this.password, "utf8"), salt);
      let passwordKey = deriveKey.subarray(0, 16);
      let aes = new AES(passwordKey);
      let hashAuthKey = deriveKey.slice(16, 32);
      hashAuthKey = createHash("sha256")
        .update(hashAuthKey)
        .digest()
        .subarray(0, 16);
      await this.api.request({
        a: "uc2",
        n: e64(Buffer.from(this.firstName + " " + this.lastName, "utf8")), // Name (used just for the email)
        m: e64(Buffer.from(this.email, "utf8")), // Email
        crv: e64(userRandomBytes), // Client Random Value
        k: e64(aes.encryptECB(this.api.masterKey)), // Encrypted Master Key
        hak: e64(hashAuthKey), // Hashed Authentication Key
        v: 2,
      });

      this.aes = new AES(this.api.masterKey);

      await this.api.request({
        a: "up",
        terms: "Mq",
        firstname: e64(this.firstName),
        lastname: e64(this.lastName),
        name2: e64(this.firstName + " " + this.lastName),
      });

      setTimeout(async () => {
        await this.confirmEmail();
      }, 3000);

      // privk and pubk rsa
      /*  let user = await this.context.login({
          email: this.email,
          password: this.password,
        });
        resolve(user); */
    });
  }

  async generatePairKeys() {
    // @ts-ignore
    const key = new NodeRSA();
    key.generateKeyPair();

    const pubk = key.exportKey("public-der");
    const privk = key.exportKey("private-der");

    let privkJWK = convertPrivk2JWK(privk);
    let privkEncoded = encodePrivk(privkJWK);
    let pubkEncoded = encodePubk(privkJWK);

    await this.api.request({
      a: "up",
      privk: e64(this.aes.encryptECB(Buffer.from(privkEncoded))),
      pubk: e64(encodePubk(Buffer.from(pubkEncoded))),
    });
  }

  /* 
    
    api_req({ a : 'up', 
    privk : e64(encrypt_key(u_k_aes,str_to_a32(crypto_encodeprivkey(t)))), 
    pubk : e64(crypto_encodepubkey(pubk))
     */

  confirmEmail(): Promise<void>{
    return new Promise(async (resolve, reject) => {
      let idMail = (
        await axios.get(
          `https://www.temporary-mail.net/api/v1/mailbox/${this.mailbox}`
        )
      ).data[0].id;
      let html = (
        await axios.get(
          `https://www.temporary-mail.net/api/v1/mailbox/${this.mailbox}/${idMail}`
        )
      ).data.body.html;

      let $ = cheerio.load(html);
      let link = $("a").eq(2).attr("href");
      let { hash } = url.parse(link);
      let confirmCode = hash.replace("#confirm", "");

      console.log(link, confirmCode);
      await this.api.request({ a: "ud2", c: confirmCode });
      await this.generatePairKeys();
      resolve();
    });
  }
}

//j89vm5mi@temporary-mail.net
//sorekzbe@temporary-mail.net
