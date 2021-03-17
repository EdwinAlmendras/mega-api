import { AxiosRequestConfig } from "axios";
import { GenericObject } from "../types";

export interface Constructor$Api {
    keepalive?: Boolean; 
    useTor?: Boolean; 
    SESSION_ID?: string;
  }

  export interface Options$MegaApi {keepalive?: boolean; useTor?: boolean}

  
  export interface Schmea$ApiFile {
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