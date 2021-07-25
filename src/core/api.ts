
import { stringify } from "querystring";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { EventEmitter } from "events";
import { ERRORS } from "./constants";
const MAX_RETRIES = 4;
import { MegaClient } from "./";
import { ParsedUrlQueryInput } from "querystring";
import * as API from "../types/api";
/**
 * Mega Api provider
 */
export class MegaApiClient extends EventEmitter {
  axios: AxiosInstance = axios;
  keepalive: boolean;
  counterId: any = Math.random().toString().substr(2, 10);
  sid: string;
  masterKey: Buffer;
  sn: any;
  errors = ERRORS
  constructor(private client: MegaClient) {
    super();
  }
  public configureAxios(config: AxiosRequestConfig): void {
    this.axios = axios.create(config);
  }
  public useTor(enable: boolean): void {
    this.client.state.useTor = enable;
    this.axios = axios.create({
    });
  }
  /**
   * Make customizable request to api mega
   * @param {Object} data
   * @param params query string parameters
   * @param config axios config custom
   * @returns {Object} response data axios
   */
  async custom({data, params, config}: API.CustomRequest): Promise<API.GenericObject> {
    const qs: ParsedUrlQueryInput = { id: (this.counterId++).toString(),
      ...params };
    qs.sid ||= this.client.state.SESSION_ID;
    try {
      const response = await axios({
        url: `${this.client.state.constants.API_GATEWAY_URL}cs?${stringify(qs)}`,
        data,
        ...config,
      });
      return Promise.resolve(response.data);
    } catch (error) {
      Promise.reject(error);
    }
  }

  /**
   *
   * @param json
   * @param retryno
   * @param ignoreError
   * @returns
   */

  public async request(data: API.GenericObject, retryno = 0): Promise<API.GenericObject | any> {
    const params: { id: string; sid?: string } = {
      id: (this.counterId++).toString(),
    };
    params.sid ||= this.client.state.SESSION_ID;
    const url = `${this.client.state.constants.API_GATEWAY_URL}cs`;
    const axiosResponse = await axios({
      url,
      data: [data],
      params,
      method: "post",
    });

    const response = axiosResponse.data[0];
    switch (true) {
      // RESPONSES IS OKEY WHEN IS EQUAL TO 0
      case (response === 0):
        Promise.resolve();
        break;
        // RESPONSES IS A ERROR WHEN IS NEGATIVE NUMBER
      case (typeof response === "number" && response < 0):
        if (response === -3) {
            (retryno < MAX_RETRIES)
            ? setTimeout(retry, Math.pow(2, retryno + 1) * 1e3)
            : Promise.reject(new Error("Server is collapsed please try later"));
        } else {
          Promise.reject(ERRORS[-response]);
        }
        break;
        // RESPONSES IS ERROR WHEN RESPONSE IS UNDEFINED
      case (typeof response === "undefined"):
        setTimeout(retry, Math.pow(2, retryno + 1) * 1e3);
        break;
        // RESPONSE IS VALID
      default:
        if (this.keepalive && response && response.sn) await this.pull(response.sn);
        return Promise.resolve(response);
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    async function retry() {
      const response = await self.request(data, retryno + 1);
      Promise.resolve(response);
    }
  }

  private async pull(sn: string, retryno = 0): Promise<void | NodeJS.Timeout> {
    const { data }= await this.axios({
      url: `${this.client.state.constants.API_GATEWAY_URL}sc`,
      params: {
        sn,
        sid: this.sid,
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


