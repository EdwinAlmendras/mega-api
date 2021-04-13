
import { Tor } from "../src/utils";



import { login } from "../src";

async function main (){


/*    let torInst = new Tor()
console.log("starting")
   let tor = await torInst.start()

   let response = await tor.get('http://api.ipify.org');
let ip = response.data;
console.log(ip); */

    let user = await login({
        email: "eafeik7@gmail.com",
        password: "zxcvbnm"
    })

    let files = await user.getFiles()
    await user.files.fetch()

    let file = user.files.get({ name: "hc.jpg" })
    console.log(file)
    await user.files.donwload({ nodeId: file.nodeId})

}

main()