import { AxiosRequestConfig } from "axios";

export interface Constructor {
    keepalive?: boolean;
    useTor?: boolean;
    SESSION_ID?: string;
  }

export interface Options$MegaApi {keepalive?: boolean; useTor?: boolean}
export interface QueryStringApi { id: string; sid?: string }
export interface CustomRequest {
  data: GenericObject;
  params: GenericObject;
  config?: AxiosRequestConfig
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericObject = { [key: string]: any };
export interface Schmea$File {
    k?: string;
    h?: string;
    at?: string;
    s?: number;
    t?: number;
    ts?: number;
    u?: string
    a?: string;
    p?: string;
}
export interface Params$Api$CustomRequest{
    data?: GenericObject;
    params?: GenericObject;
    configAxios?: AxiosRequestConfig
  }
