import axios from "axios";

export class Email {
  email: string;
  id: string;
}

export class TemporaryEmail extends Email {
  gateway = "https://www.temporary-mail.net/api/v1/mailbox/";
  mails: Array<any>;
  static mailbox: string;
  static email: string;
  constructor({ email, reload }: { email: string; reload?: boolean}) {
    super();
    this.email = email;
    this.id = email.split("@")[0];
    if (reload) {
      setInterval(this.fetch, 5000);
    }
  }
  static async generateRandomMail(): Promise<string> {
    const mailbox = (
      await axios.get(
          "https://www.temporary-mail.net/api/v1/mailbox/keepalive?mailbox=",
      )
    ).data.mailbox;
    const email = mailbox + "@temporary-mail.net";
    return (email);
  }

  async fetch(): Promise<any[]> {
    const { data } = await axios.get(`${this.gateway}/${this.id}`);
    this.mails = data;
    return data;
  }

  async get(id): Promise<any> {
    const { data } = await axios.get(`${this.gateway}/${this.id}/${id}`);
    return data;
  }

  async new(): Promise<void> {
    const { data } = await axios.get(`${this.gateway}/keepalive?mailbox=`);
    this.id = data.mailbox;
  }
}
