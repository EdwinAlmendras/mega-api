import axios from "axios";

export class Email {
  email: string;
  id: string;
}

export default class TemporaryEmail extends Email {
  gateway: string = "https://www.temporary-mail.net/api/v1/mailbox/";
  mails: Array<any>;
  constructor({ email, reload }) {
    super();
    if (!email) {
    }
    this.email = email;
    this.id = email.split("@")[0];
    if (reload) {
      setInterval(this.fetch, 5000);
    }
  }

  async fetch() {
    let { data } = await axios.get(`${this.gateway}/${this.id}`);
    this.mails = data;
    return data;
  }

  async get(id) {
    let { data } = await axios.get(`${this.gateway}/${this.id}/${id}`);
    return data;
  }

  async new() {
    let { data } = await axios.get(`${this.gateway}/keepalive?mailbox=`);
    this.id = data.mailbox;
  }
}
