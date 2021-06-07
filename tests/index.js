/* eslint-disable no-undef */

const { MegaClient } = require("../lib");
async function main() {
  try {
    const client = new MegaClient();
    await client.account.login({
      email: "goldenpark1@yopmail.com",
      password: "goldenpark1@yopmail.com",
      fetch: true,
    });
    console.log(client.files);
  } catch (error) {
    console.log(error)
  }
}

main();
