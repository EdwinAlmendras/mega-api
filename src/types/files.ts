import { ResponseType, AxiosRequestConfig } from "axios";

export interface Schema$File {
  nodeId?: string;
  name?: string;
  downlaodId?: string;
  createdTime?: number;
  type?: number;
  owner?: string;
  isDir?: boolean;
  size?: number | string;
  parent?: any;
  downloadId?: string;
  shareKey?: string;
  key?: Buffer;
  properties?: Schema$Properties
}

export interface Schema$Properties {
  name?: string;
  uid?: string;
  folderColorRgb?: string;
  mimeType?: string;
  label?: string;
  starred?: boolean;
  target?: {
    uid?: string;
    url?: string;
    account?: {
      email?: string;
      password?: string
    }
  }
  posterUrl?: string;
  stars?: string;
  videoMediaMetadata: {
    width: number;
    heigth: number;
  },
  tags?: string[];
  girl?: {
    name?: string;
    studios?: string[]
  };
}







export interface Options$LoadMetadata {
  /* Attributes */
  a: string; // Base64 encrypted attributes
  /* Size of file */
  s: number;
  /* Timestamp (created at) */
  ts: number;
  /* Type of file */
  t: string;
  /* Owner : user thats created */
  u: string;
  /* Key */
  k: string; //Base64 encryptrd key thats encrypted file
}


export interface Params$Get { 
  nodeId?: string; 
  name?: string; 
  parent?: string; 
  responseType?: ResponseType 
  config?: AxiosRequestConfig
}