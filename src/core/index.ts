import Files from "./files";
import { MegaApiClient } from "./api";
import { Account } from "./account";
import { State } from "./state";
import { Contacts } from "./contacts";

/**
 * Main function handler
 */

export { default as Files} from "./files"
export class MegaClient {
  public state = new State()
  public api = new MegaApiClient(this)
  public account = new Account(this)
  public files = new Files(this)
  public contacts = new Contacts(this)
}
