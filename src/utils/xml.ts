




/* Implementig save email and password thats then used in SafeInCloud this uses XML */

import builder from "xmlbuilder";
import { randomBytes } from "crypto";
import { writeFile } from "promise-fs"
const id = randomBytes(16).toString("hex");

export async function saveCredentials({title, email, password}){
    var xml = builder.create('database')
    .ele('card', {'time_stamp': new Date(), "autofill": "off", "id": id, "title": title})
    .ele('field', {'name': 'Website', "type": "website", "autofill": "url"}, "www.mega.nz")
    .ele('field', {'name': 'E-mail', "type": "email", "autofill": "username"}, email)
    .ele('field', {'name': 'Password', "type": "password", "autofill": "password"}, password)
    .end({ pretty: true});
    await writeFile(`${id}.xml`, xml)
}
