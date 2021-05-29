import { MegaClient } from "core";

export class Contacts {
  constructor(private client: MegaClient) { }
  async add(email: string): Promise<void> {
    try {
      await this.client.api.request({
        a: "upc",
        aa: "a",
        e: this.client.state.email,
        msg: "Hola, únete a MEGA y obtén acceso a almacenamiento y comunicación cifrados.",
        u: email,
      })
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }
}
