import { login } from "../src";


(async()=>{
    let user = await login({
        email: "kegob14409@990ys.com",
        password: "kegob14409@990ys.com"
    })

    let files = await user.getFiles()
    await files.fetch()

    console.log(files)
})()