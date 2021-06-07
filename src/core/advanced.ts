import { MegaClient } from "core";
import { Schema$File } from "types";
import Files from "./files";


// eslint-disable-next-line no-trailing-spaces
/*
GOLDEN-PARK@{VERSION}/
├─ girls/
├─ categories/
├─ studios/
 */

export default class GoldenPark extends Files {
  constructor(ctx: MegaClient) {
    super(ctx);
    this.client.state.APP_NAME = "GOLDEN-PARK";
    this.client.state.VERSION = "2.0.0";
    this.client.state.APP = `${this.client.state.APP_NAME}@${this.client.state.VERSION}`;
    this.client.state.ID_ROOT_FOLDER = this.get({ name: this.client.state.APP}).nodeId;
    this.client.state.FOLDERS = {
      GIRLS: this.getByPath({ path: "girls"}),
      STUDIOS: this.getByPath({ path: "studios"}),
      CATEGORIES: this.getByPath({ path: "categories"}),
    };
  }
  public girls(): Schema$File[] {
    return this.list( { folderId: this.client.state.FOLDERS.GIRLS.nodeId} );
  }
}
