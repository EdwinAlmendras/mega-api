import { writeFile } from "promise-fs";
import { AES, createSalt, formatKey, deriveKeys, e64 } from "../crypto";
import { EventEmitter } from "events";
import Api from "../api";
//import { Schema$File, } from "../types";
import { parse } from "url"
import { TemporaryEmail } from "../utils/email";
import cheerio from "cheerio"

import { Schema$File } from "../types";
import Files from "../file";
import { createHash, randomBytes } from "crypto";


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


export default class User {
  api: Api
  MASTER_KEY: Buffer;
  RSA_PRIVATE_KEY: any[];
 KEY_AES: AES
  email: string;
  password: string;

  constructor(context) {
    Object.assign(this, context)
  }

  /* RETURN FILES OBJECT */
  getFiles(){
     const files = new Files({api: this.api, KEY_AES: this.KEY_AES})

     return files
  }

  async saveSession() {
    await writeFile(
      "session.json",
      JSON.stringify({
        key: this.MASTER_KEY,
        sid: this.api.sid,
      })
    );
  }

  account(){
      return new Account(this.api, this.email)
  }
}


export class Account {
    api: Api
    email: string;
  KEY_AES: AES;
    constructor(api, email){
        this.api = api
        this.email = email
    }
  info() {
    return new Promise(async (resolve) => {
      let response = await this.api.request({
        a: "uq",
        strg: 1,
        xfer: 1,
        pro: 1,
      });
      const account: any = {};
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

  async changeEmail({email}) {
    var params = {
        a: 'se',            // Set Email
        aa: 'a',
        e: email,        // The new email address
    }

    await this.api.request(params)
  }
  async changePassword({password}) {
    let keys = deriveKeys(password, randomBytes(32))
              var requestParams = {
                  a: 'up',
                  k: e64(keys.k),
                  uh: e64(keys.hak),
                  crv: e64(keys.crv)
              };
             await  this.api.request(requestParams)
  }




  async cancel() {
    /* RESPONSE SHOULD BE 0 */
   await this.api.request({ a: 'erm', m: this.email, t: 21 })
    /* THIS WILL BE RECEIVED EMAIL */
    if(this.email.includes("temporary-mail")){
      let email = new TemporaryEmail({ reload: false, email: this.email})
      
      let [{id}] = await email.fetch()
      let mail = await email.get(id)

      let $ = cheerio.load(mail.body.html);
      let link = $("a").eq(2).attr("href");
      let { hash } = parse(link);
    
      /* HANLDE SEND CONFIRM LINK */
    }
  }
}

