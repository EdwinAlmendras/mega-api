import { MegaClient } from "../src/core";
async function main() {
  try {
    const client = new MegaClient();
    await client.account.login({
      email: "2108uhevdws@yopmail.com",
      password: "2108uhevdws@yopmail.com",
      fetch: true,
    });
  } catch (error) {
    console.log(error);
  }
}

main();
