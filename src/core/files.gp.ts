
import { MegaClient, Files } from "./";
/* Extension of files for Golden Park structure */

export default class FilesExtended extends Files {
  private KEY_AES: AES
  private api: MegaApiClient;
  constructor(protected client: MegaClient) {
    super(client);
    const version = this.client.state.VERSION = "2.0.0";
    this.KEY_AES = this.client.state.KEY_AES;
    this.api = this.client.api;
    const root = this.get({ name: "GOLDEN-PARK@" + version });
    const rootId = this.client.state.ID_ROOT_FOLDER = root.nodeId;
    this.client.state.FOLDERS = this.list({ folderId: rootId }).map((e) => {
      return this.get({ nodeId: e.nodeId });
    });
  };

};
