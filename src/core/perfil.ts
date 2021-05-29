
import { base64 } from "../crypto";
import { MegaClient } from "./";


export class Profile {
  constructor(private client: MegaClient) { }
  public async updateAvatar(image: Buffer): Promise<void> {
    try {
      await this.client.api.request({
        "+a": base64.encrypt(image),
        "a": "up",
        "i": "Yx9sLEGlxg",
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }
  public async getAvatar(): Promise<Buffer> {
    try {
      const { av: avatarBase64 }: { av: string } = await this.client.api.request({
        a: "uga",
        u: this.client.state.USER_ID || "aMbaJ92YWfU",
        ua: "+a",
        v: 1,
      });
      return Promise.resolve(base64.decrypt(avatarBase64));
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }
}

