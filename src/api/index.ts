
import { stringify } from "querystring";
import axios, { AxiosInstance } from "axios";
import { e64, d64, AES } from "../crypto";
import { EventEmitter } from "events";
import { randomBytes } from "crypto";
import {ERRORS} from "./errors";
const MAX_RETRIES = 7;

export default class Api extends EventEmitter {
  axios: AxiosInstance;
  keepalive: Boolean;
  counterId: any = Math.random().toString().substr(2, 10);
  gateway: string = "https://eu.api.mega.co.nz/";
  sid: string;
  masterKey: any;
  sn: any;

  constructor(options: { keepalive: Boolean; useTor: Boolean; }) {
    super();
    if (!options) {
      this.keepalive = true;
      this.axios = axios;
    } else {
      this.keepalive = options.keepalive;
      this.axios = axios
    }
  }

  async customRequest(data, params, config  = {}){
    let qs : { id: string; sid?: string}= { id: (this.counterId++).toString(), ...params };
    this.sid && (qs.sid = this.sid);
     const response = await this.axios.post(`${this.gateway}cs?${stringify(qs)}`, [data], config)
     return response.data[0]
  }

  request(json: any, retryno = 0, customParams = {}, ignoreError = false): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let params : { id: string; sid?: string}= { id: (this.counterId++).toString() };
      this.sid && (params.sid = this.sid);
      let response = (
        await this.axios.post(`${this.gateway}cs?${stringify(params)}`, [json])
      ).data[0];

      if (response === 0) resolve(null)
      if (typeof response === "undefined" && !ignoreError) {
        setTimeout(async () => {
         let response = await this.request(json, retryno + 1)
          resolve(response)
        }, Math.pow(2, retryno + 1) * 1e3)
      }
      if (typeof response === "number" && response < 0 && !ignoreError) {
        if (response === -3) {
          if (retryno < MAX_RETRIES) {
            setTimeout(async () => {
              let response = await this.request(json, retryno + 1)
               resolve(response)
             }, Math.pow(2, retryno + 1) * 1e3)
          }
        }
        reject(ERRORS[-response]);
      } else {
        if (this.keepalive && response && response.sn) {
          await this.pull(response.sn);
        }
      }
      resolve(response);
    });
  }

  pull(sn: string, retryno = 0) {
    return new Promise(async (resolve, reject) => {
      let response = (
        await this.axios.post(
          `${this.gateway}sc?${stringify({ sn, sid: this.sid })}`,
          `sc?${stringify({ sn })}`
        )
      ).data;
      if (typeof response === "number" && response < 0) {
        if (response === -3) {
          if (retryno < MAX_RETRIES) {
            return setTimeout(async () => {
              await this.pull(sn, retryno + 1);
            }, Math.pow(2, retryno + 1) * 1e3);
          }
        }
        reject(ERRORS[-response]);
      }
      if (response.w) {
        this.wait(response.w, sn);
      } else if (response.sn) {
        if (response.a) {
          this.emit("sc", response.a);
        }
        this.pull(response.sn);
      }
      resolve(null);
    });
  }

  wait(uri: string, sn: string) {
    return new Promise(async (resolve) => {
      await this.axios.post(uri);
      this.sn = undefined;
      await this.pull(sn);
      resolve(null);
    });
  }
  anonSession() {
    return new Promise(async (resolve, reject) => {
      try {
        let masterkey = randomBytes(16);
        this.masterKey = masterkey;
        let passwordKey = randomBytes(16);
        let ssc = randomBytes(16);
        let aes = new AES(passwordKey);
        let user = await this.request({
          a: "up",
          k: e64(aes.encryptECB(masterkey)),
          ts: e64(
            Buffer.concat([ssc, new AES(this.masterKey).encryptECB(ssc)])
          ),
        });

        let { tsid, k } = await this.request({ a: "us", user });
        this.masterKey = aes.decryptECB(d64(k));
        this.sid = tsid;
        await this.request({ a: "ug" });
        let { ph } = await this.request({ a: "wpdf" });
        let n = await this.request({ a: "g", p: ph });
        resolve(null);
      } catch (err) {
        reject(err);
      }
    });
  }

  close() {
    if (this.sn) this.sn.abort();
  }
}
