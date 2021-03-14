import { writeFile } from "promise-fs";
import { AES, createSalt, formatKey, deriveKeys, e64 } from "../crypto";
import Api from "../api";
//import { Schema$File, } from "../types";
import { parse } from "url"
import { EmailGenerator } from "../utils";
import cheerio from "cheerio"
import { Schema$File } from "../types";
import Files from "../file";
import { createHash, randomBytes } from "crypto";
import { Interface } from "node:readline";


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



interface Constructor$User {
  MASTER_KEY: Buffer;
  RSA_PRIVATE_KEY?: any[] | Boolean
}

export default class User {
  api: Api
  SESSION_ID: string
  MASTER_KEY: Buffer;
  RSA_PRIVATE_KEY: any[] | Boolean;
 KEY_AES: AES
  constructor({MASTER_KEY, RSA_PRIVATE_KEY}: Constructor$User, apiOptions) {
    this.api = new Api(apiOptions)
    this.MASTER_KEY = MASTER_KEY
    this.RSA_PRIVATE_KEY = RSA_PRIVATE_KEY
    this.KEY_AES = new AES(MASTER_KEY)
  }

  /* RETURN FILES OBJECT */
  getFiles(){
     return new Files({api: this.api, KEY_AES: this.KEY_AES})
  }

  async saveSession() {
    await writeFile(
      "session.json",
      JSON.stringify({
        key: this.MASTER_KEY,
        SESSION_ID: this.api.SESSION_ID,
      })
    );
  }

  account(){
      return new Account(this.api)
  }
}


export class Account {
    api: Api
  KEY_AES: AES;
    constructor(api){
        this.api = api
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



/* 
  async cancel() {
   await this.api.request({ a: 'erm', m: this.email, t: 21 })
    if(this.email.includes("temporary-mail")){
      let email = new EmailGenerator({ reload: false, email: this.email})
      
      let [{id}] = await email.fetch()
      let mail = await email.get(id)

      let $ = cheerio.load(mail.body.html);
      let link = $("a").eq(2).attr("href");
      let { hash } = parse(link);
    
    }
  } */
}

