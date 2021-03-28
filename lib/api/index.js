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
const querystring_1 = require("querystring");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("../crypto");
const events_1 = require("events");
const crypto_2 = require("crypto");
const errors_1 = require("./errors");
const MAX_RETRIES = 7;
class Api extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.counterId = Math.random().toString().substr(2, 10);
        this.gateway = "https://eu.api.mega.co.nz/";
        if (!options) {
            this.keepalive = true;
            this.axios = axios_1.default;
        }
        else {
            this.keepalive = options.keepalive;
            this.axios = axios_1.default;
        }
    }
    customRequest(data, params, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let qs = Object.assign({ id: (this.counterId++).toString() }, params);
            this.sid && (qs.sid = this.sid);
            const response = yield this.axios.post(`${this.gateway}cs?${querystring_1.stringify(qs)}`, [data], config);
            return response.data[0];
        });
    }
    request(json, retryno = 0, customParams = {}, ignoreError = false) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let params = { id: (this.counterId++).toString() };
            this.sid && (params.sid = this.sid);
            let response = (yield this.axios.post(`${this.gateway}cs?${querystring_1.stringify(params)}`, [json])).data[0];
            if (response === 0)
                resolve(null);
            if (typeof response === "undefined" && !ignoreError) {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    let response = yield this.request(json, retryno + 1);
                    resolve(response);
                }), Math.pow(2, retryno + 1) * 1e3);
            }
            if (typeof response === "number" && response < 0 && !ignoreError) {
                if (response === -3) {
                    if (retryno < MAX_RETRIES) {
                        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            let response = yield this.request(json, retryno + 1);
                            resolve(response);
                        }), Math.pow(2, retryno + 1) * 1e3);
                    }
                }
                reject(errors_1.ERRORS[-response]);
            }
            else {
                if (this.keepalive && response && response.sn) {
                    yield this.pull(response.sn);
                }
            }
            resolve(response);
        }));
    }
    pull(sn, retryno = 0) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let response = (yield this.axios.post(`${this.gateway}sc?${querystring_1.stringify({ sn, sid: this.sid })}`, `sc?${querystring_1.stringify({ sn })}`)).data;
            if (typeof response === "number" && response < 0) {
                if (response === -3) {
                    if (retryno < MAX_RETRIES) {
                        return setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            yield this.pull(sn, retryno + 1);
                        }), Math.pow(2, retryno + 1) * 1e3);
                    }
                }
                reject(errors_1.ERRORS[-response]);
            }
            if (response.w) {
                this.wait(response.w, sn);
            }
            else if (response.sn) {
                if (response.a) {
                    this.emit("sc", response.a);
                }
                this.pull(response.sn);
            }
            resolve(null);
        }));
    }
    wait(uri, sn) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            yield this.axios.post(uri);
            this.sn = undefined;
            yield this.pull(sn);
            resolve(null);
        }));
    }
    anonSession() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let masterkey = crypto_2.randomBytes(16);
                this.masterKey = masterkey;
                let passwordKey = crypto_2.randomBytes(16);
                let ssc = crypto_2.randomBytes(16);
                let aes = new crypto_1.AES(passwordKey);
                let user = yield this.request({
                    a: "up",
                    k: crypto_1.e64(aes.encryptECB(masterkey)),
                    ts: crypto_1.e64(Buffer.concat([ssc, new crypto_1.AES(this.masterKey).encryptECB(ssc)])),
                });
                let { tsid, k } = yield this.request({ a: "us", user });
                this.masterKey = aes.decryptECB(crypto_1.d64(k));
                this.sid = tsid;
                yield this.request({ a: "ug" });
                let { ph } = yield this.request({ a: "wpdf" });
                let n = yield this.request({ a: "g", p: ph });
                resolve(null);
            }
            catch (err) {
                reject(err);
            }
        }));
    }
    close() {
        if (this.sn)
            this.sn.abort();
    }
}
exports.default = Api;
