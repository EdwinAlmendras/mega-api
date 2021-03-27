
const mega = require("../lib")
async function main (){
    let user = await mega.login({
        email: "eafeik7@gmail.com",
        password: "zxcvbnm"
    })

    let files = await user.getFiles()
    await user.files.fetch()

    await user.files.import({ url: "https://mega.nz/file/3HwgmDaR#MlmVyAdEjsuekuWBKi9zwQMJ_eyHgBwn4frMIxEdN1o"})

}

main()