import { login } from "../src";


(async()=>{

    let user = await login({
        email: "eafeik7@gmail.com",
        password: "zxcvbnm"
    })

    let files = await user.getFiles()
    await user.files.fetch()

    await user.files.import({ url: "https://mega.nz/file/3HwgmDaR#MlmVyAdEjsuekuWBKi9zwQMJ_eyHgBwn4frMIxEdN1o"})


})()