
  
import PastebinAPI from 'pastebin-js'
import moment from "moment"



const API_KEY = '66797adb0b23b070bb4019851a1b1122'
const USER = 'gxldxm689171'
const PSW = 'bea54436fabf243c24b767289fbdf05f'

let pastebin = new PastebinAPI({
  'api_dev_key': API_KEY,
  'api_user_name': USER,
  'api_user_password': PSW

});


const createPaste = async (data) => {
  let title = await moment().format('MMMM Do YYYY, h: mm: ss a')
 let link = await pastebin.createPaste(data, title, null, 2)
 return link;
}


export default createPaste;