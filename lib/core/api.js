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
exports.MegaApiClient = void 0;
const querystring_1 = require("querystring");
const axios_1 = __importDefault(require("axios"));
const events_1 = require("events");
const constants_1 = require("./constants");
const MAX_RETRIES = 4;
const crypto_1 = require("../crypto");
const lodash_1 = require("lodash");
const helpers_1 = require("../helpers");
/**
 * Mega Api provider
 */
class MegaApiClient extends events_1.EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.axios = axios_1.default;
        this.counterId = Math.random().toString().substr(2, 10);
        this.errors = constants_1.ERRORS;
    }
    configureAxios(config) {
        this.axios = axios_1.default.create(config);
    }
    useTor(enable) {
        this.client.state.useTor = enable;
        this.axios = axios_1.default.create({});
    }
    /**
     * Make customizable request to api mega
     * @param {Object} data
     * @param params query string parameters
     * @param config axios config custom
     * @returns {Object} response data axios
     */
    custom({ data, params, config }) {
        return __awaiter(this, void 0, void 0, function* () {
            const qs = Object.assign({ id: (this.counterId++).toString() }, params);
            qs.sid || (qs.sid = this.client.state.SESSION_ID);
            try {
                const response = yield axios_1.default(Object.assign({ url: `${this.client.state.constants.API_GATEWAY_URL}cs?${querystring_1.stringify(qs)}`, data }, config));
                return Promise.resolve(response.data);
            }
            catch (error) {
                Promise.reject(error);
            }
        });
    }
    /*
    purerequqest
    */
    request(obj, { retryno = 0, transform = "" } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                id: (this.counterId++).toString(),
            };
            if (this.client.state.SESSION_ID) {
                params.sid = this.client.state.SESSION_ID;
            }
            helpers_1.log.info("REQUEST. Sending request with data:");
            console.log(obj);
            const url = `${this.client.state.constants.API_GATEWAY_URL}cs`;
            const { data, headers, status, config } = yield axios_1.default({
                url,
                data: [obj],
                params,
                method: "post",
            });
            const response = data[0];
            switch (true) {
                case (response === 0):
                    Promise.resolve();
                    break;
                case (typeof response === "number" && response < 0):
                    if (response === -3) {
                        (retryno < MAX_RETRIES)
                            ? setTimeout(retry, Math.pow(2, retryno) * 1e3)
                            : Promise.reject(new Error("Server is collapsed please try later"));
                    }
                    else {
                        helpers_1.log.error(`Request failed with status ${status}`);
                        helpers_1.log.error(constants_1.ERRORS[-response]);
                        Promise.reject(constants_1.ERRORS[response]);
                    }
                    break;
                case (typeof response === "undefined"):
                    setTimeout(retry, Math.pow(2, retryno + 1) * 1e3);
                    break;
                default:
                    if (this.keepalive && response && response.sn)
                        yield this.pull(response.sn);
                    if (transform === "buffer") {
                        helpers_1.log.sucess(`RESPONSE. Completed request with status: ${status}. With data:`);
                        console.log(response);
                        const newObj = lodash_1.mapValues(response, (v) => crypto_1.base64.decrypt(v));
                        return Promise.resolve(newObj);
                    }
                    helpers_1.log.sucess(`RESPONSE. Completed request with status: ${status}. With data:`);
                    console.log(response);
                    return Promise.resolve(response);
                    break;
            }
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            function retry() {
                return __awaiter(this, void 0, void 0, function* () {
                    const response = yield self.request(data, { retryno: retryno + 1 });
                    Promise.resolve(response);
                });
            }
        });
    }
    pull(sn, retryno = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.axios({
                url: `${this.client.state.constants.API_GATEWAY_URL}sc`,
                params: {
                    sn,
                    sid: this.sid,
                },
                data: `sc?${querystring_1.stringify({ sn })}`,
            });
            const response = data.data;
            if (typeof response === "number" && response < 0) {
                if (response === -3) {
                    if (retryno < MAX_RETRIES) {
                        return setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            yield this.pull(sn, retryno + 1);
                        }), Math.pow(2, retryno + 1) * 1e3);
                    }
                }
                Promise.reject(constants_1.ERRORS[-response]);
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
            Promise.resolve(null);
        });
    }
    wait(uri, sn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.axios.post(uri);
            this.sn = undefined;
            yield this.pull(sn);
            Promise.resolve();
        });
    }
    close() {
        if (this.sn)
            this.sn.abort();
    }
}
exports.MegaApiClient = MegaApiClient;
