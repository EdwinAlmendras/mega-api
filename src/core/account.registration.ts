/* import url from "url";
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

  }
  async create(): Promise<Mega$User> {
    return new Promise(async (resolve, reject) => {
      await this.api.anonSession();

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


  api_req({ a: 'up',
    privk: e64(encrypt_key(u_k_aes, str_to_a32(crypto_encodeprivkey(t)))),
      pubk : e64(crypto_encodepubkey(pubk))

confirmEmail(): Promise < void> {
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
 */
