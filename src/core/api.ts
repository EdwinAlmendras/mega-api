import { stringify } from "querystring";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { EventEmitter } from "events";
import { API_GATEWAY_URL, ERRORS } from "./constants";
import { MegaClient } from "./";
import { ParsedUrlQueryInput } from "querystring";
import * as API from "../types/api";
import { base64 } from "../crypto";
import { mapValues } from "lodash";
import { log } from "../helpers";
/**
 * Mega Api provider
 */
const MAX_RETRIES = 3;
const SUCCESS_RESPONSE = 0;
const ERROR_RESPONSE_SERVER = -3;
export class MegaApiClient extends EventEmitter {
  axios: AxiosInstance = axios;
  keepalive: boolean;
  counterId: any = Math.random().toString().substr(2, 10);
  sid: string;
  sn: any;
  errors = ERRORS;
  constructor(private client: MegaClient) {
    super();
  }
  public configureAxios(config: AxiosRequestConfig): void {
    this.axios = axios.create(config);
  }
  public useTor(enable: boolean): void {
    this.client.state.useTor = enable;
    this.axios = axios.create({});
  }
  /**
   * Make customizable request to api mega
   * @param {Object} data
   * @param params query string parameters
   * @param config axios config custom
   * @returns {Object} response data axios
   */
  async custom({
    data,
    params,
    config,
  }: API.CustomRequest): Promise<API.GenericObject[]> {
    const qs: ParsedUrlQueryInput = {
      id: (this.counterId++).toString(),
      ...params,
    };
    qs.sid ||= this.client.state.SESSION_ID;

    try {
      const response = await axios({
        url: `${API_GATEWAY_URL}cs`,
        params: qs,
        data,
        ...config,
      });
      return Promise.resolve(response.data);
    } catch (error) {
      Promise.reject(error);
    }
  }
  /*
  purerequqest
  */

  public async request(
    obj: API.GenericObject,
    { retryno = 0, transform = "" } = {}
  ): Promise<any> {
    const params: { id: string; sid?: string } = {
      id: (this.counterId++).toString(),
    };
    if (this.client.state.SESSION_ID) {
      params.sid = this.client.state.SESSION_ID;
    }

    this.emit("request", {
      status: "sending...",
      data: obj,
    });

    const url = `${this.client.state.constants.API_GATEWAY_URL}cs`;
    const { data, headers, status }: AxiosResponse = await axios({
      url,
      data: [obj],
      params,
      method: "post",
    });

    const response = data[0];

    switch (true) {
      case response === SUCCESS_RESPONSE:
        this.emit("request", {
          status: "completed",
          data: SUCCESS_RESPONSE,
          headers,
        });
        Promise.resolve();
        break;
      case typeof response === "number" && response < 0:
        if (response === ERROR_RESPONSE_SERVER) {
          this.emit("request", {
            status: "error",
            data: null,
            error: ERRORS[3],
          });
          retryno < MAX_RETRIES
            ? setTimeout(retry, Math.pow(2, retryno) * 1e3)
            : Promise.reject(new Error("Server is collapsed please try later"));
        } else {
          log.error(`Request failed with status ${status}`);
          log.error(ERRORS[-response]);
          Promise.reject(ERRORS[response]);
        }
        break;

      case typeof response === "undefined":
        this.emit("request", {
          status: "retry-request",
          data: null,
          retryno: retryno,
        });
        setTimeout(retry, Math.pow(2, retryno + 1) * 1e3);
        break;
      default:
        if (this.keepalive && response && response.sn) {
          await this.pull(response.sn);
        }
        if (transform === "buffer") {
          const newObj = mapValues(response, (v) => base64.decrypt(v));
          return Promise.resolve(newObj);
        }
        return Promise.resolve(response);
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    async function retry() {
      const response = await self.request(obj, { retryno: retryno + 1 });
      Promise.resolve(response);
    }
  }

  private async pull(sn: string, retryno = 0): Promise<void | NodeJS.Timeout> {
    const { data } = await this.axios({
      url: `${this.client.state.constants.API_GATEWAY_URL}sc`,
      params: {
        sn,
        sid: this.client.state.SESSION_ID,
      },

      data: `sc?${stringify({ sn })}`,
    });

    const response = data.data;
    if (typeof response === "number" && response < 0) {
      if (response === -3) {
        if (retryno < MAX_RETRIES) {
          return setTimeout(async () => {
            await this.pull(sn, retryno + 1);
          }, Math.pow(2, retryno + 1) * 1e3);
        }
      }
      Promise.reject(ERRORS[-response]);
    }
    if (response.w) {
      this.wait(response.w, sn);
    } else if (response.sn) {
      if (response.a) {
        this.emit("sc", response.a);
      }
      this.pull(response.sn);
    }
    Promise.resolve(null);
  }

  private async wait(uri: string, sn: string): Promise<void> {
    await this.axios.post(uri);
    this.sn = undefined;
    await this.pull(sn);
    Promise.resolve();
  }

  protected close(): void {
    if (this.sn) this.sn.abort();
  }
}
