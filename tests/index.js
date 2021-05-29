
const { MegaClient } = require("../lib");
async function main() {
  const client = new MegaClient()
  await client.account.login({
    email: "eafeik7@gmail.com",
    password: "zxcvbnm",
    fetch: true,
  });
  await client.files.update({
    name: "passed",
    properties: {
      name: "asdasd",
    },
  });
  console.log(client.files);
}

main();
