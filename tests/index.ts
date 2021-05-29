import { MegaClient } from "../src/core";
async function main() {
  try {
    const client = new MegaClient();
    await client.account.login({
      email: "eafeik7@gmail.com",
      password: "zxcvbnm",
      fetch: true,
    });
    await client.files.update({
      name: "golden-park",
      properties: {
        name: "workung...",
      },
    });
    console.log(client.files);
  } catch (error) {
    console.log(error);
  }
}

main();
