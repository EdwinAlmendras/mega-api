import { AxiosInstance } from "axios";
import { AES } from "../crypto";
import * as Constants from "./constants";
/**
 * Manage global data of the application
 */
export class State {
  public constants = Constants
  sid: string;
  useTor: boolean;
  axios: AxiosInstance;
  RSA_PRIVATE_KEY: boolean | number[];
  SESSION_ID: string;
  KEY_AES: AES;
  MASTER_KEY: Buffer;
  name: string;
  USER_ID: string;
  email: string;
  since: number;
  ACCOUNT_VERSION: number;
  ID_ROOT_FOLDER: string;
  ID_TRASH: string;
  ID_FOLDER_INBOX: string;
  APP_NAME: string;
  VERSION: string;
  ID_FOLDER_GIRLS: any;
  FOLDERS: any;
  APP: string;
}
