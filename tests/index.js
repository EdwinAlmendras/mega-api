
const mega = require("../lib")
async function main (){
    let user = await mega.login({
        email: "eafeik7@gmail.com",
        password: "zxcvbnm"
    })

    let files = await user.getFiles()
    await user.files.fetch()
    
}

main()