

console.log("working in typescript")


import User from "core/user";
import { login } from "./auth";

let email = "eafeik7@gmail.com"
let password = "zxcvbnm"


async function main() {
    const user: User = await login({
        email, password
    }, null)


    const files = await user.getFiles()
    await files.fetch()
    await files.shortcut({ name: "csac"}, { props: { name: "sacaa"}})
//await files.update({ name: "csac", properties: { uid: "saddas"}})

//console.log(await files.get({ name: "csac"}))
/*     console.log(await files.get({ name: "sacaa"}))

 */
   /* const url = await files.export({name: "dsadsad"}) */

/* await files.import({name: "tt"},url) */


main()