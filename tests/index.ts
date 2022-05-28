import { createWriteStream, writeFile, writeFileSync } from "fs";
import { MegaClient } from "../src/core";

//2108uhevdws@yopmail.com
async function main() {
  try {
    const client = new MegaClient();
    /*  await client.account.login({
      email: "wixotad365@activesniper.com",
      password: "wixotad365@activesniper.com",
      fetch: true,
      saveSession: true,
    });
 */
    await client.account.resumeSession();
    client.api.on("request", (data) => console.log(data));
    const filename = "01.mp4"
    const absolutePAth = client.files.getAbsolutePathByName(filename)
    console.log(absolutePAth)
   /*  const [resp] = await client.files.getThumbs({ nodes: [file.nodeId], previewType: "preview"})
 */
   // const buffer = await client.files.getThumbnail({ nodeId: file.nodeId })

   /*  writeFileSync("ok.jpg", resp.data)
     */
 /*    const { data } = await client.files.getSource({
      nodeId: file.nodeId,
    });
    const w = createWriteStream(filename);
    data.pipe(w); */
    // eslint-disable-next-line max-len
    // console.log(client.files.list({ folderId: client.state.ID_ROOT_FOLDER}).map(e => e.nodeId))
    // await client.files.getThumbnail({ nodeId: client.files.get({ name: "ZPUAPFEFOBFSBFU6GS2MCJVJLY.jpg"}).nodeId });
  } catch (error) {
    console.log(error);
  }
}
main();
