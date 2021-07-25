import { MegaClient } from "../src/core";

//2108uhevdws@yopmail.com
async function main() {
  try {
    const client = new MegaClient();
    await client.account.login({
      email: "wixotad365@activesniper.com",
      password: "wixotad365@activesniper.com",
      fetch: true,
    });

    console.log(client.files.data);
// eslint-disable-next-line max-len
   console.log(client.files.list({ folderId: client.state.ID_ROOT_FOLDER}).map(e => e.nodeId))
  const files = await client.files.getThumbnails(client.files.list({ folderId: client.state.ID_ROOT_FOLDER}).map(e => e.nodeId));
  console.log(files)
   // await client.files.getThumbnail({ nodeId: client.files.get({ name: "ZPUAPFEFOBFSBFU6GS2MCJVJLY.jpg"}).nodeId });
  } catch (error) {
    console.log(error);
  }
}

main();
