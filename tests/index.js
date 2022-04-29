/* eslint-disable no-undef */

const { writeFileSync } = require("fs");
const { MegaClient } = require("../lib");

async function main() {
  try {
    const client = new MegaClient();
   /*  await client.account.login({
      email: "goldenpark1@yopmail.com",
      password: "goldenpark1@yopmail.com",
      fetch: true,
    });
 */
    await client.account.resumeSession();
   

    client.api.on("request", (data) => console.log(data));
    const file = client.files.get({ name: "ZPUAPFEFOBFSBFU6GS2MCJVJLY.jpg" });

    const [resp] = await client.files.getThumbs({ nodes: [file.nodeId], previewType: "preview"})

   // const buffer = await client.files.getThumbnail({ nodeId: file.nodeId })

    writeFileSync("ok2.jpg", resp.data)

  } catch (error) {
    console.log(error)
  }
}

main();
