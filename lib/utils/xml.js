"use strict";
/* Implementig save email and password thats then used in SafeInCloud this uses XML */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCredentials = void 0;
const xmlbuilder_1 = __importDefault(require("xmlbuilder"));
const crypto_1 = require("crypto");
const promise_fs_1 = require("promise-fs");
const id = crypto_1.randomBytes(16).toString("hex");
async function saveCredentials({ title, email, password }) {
    var xml = xmlbuilder_1.default.create('database')
        .ele('card', { 'time_stamp': new Date(), "autofill": "off", "id": id, "title": title })
        .ele('field', { 'name': 'Website', "type": "website", "autofill": "url" }, "www.mega.nz")
        .ele('field', { 'name': 'E-mail', "type": "email", "autofill": "username" }, email)
        .ele('field', { 'name': 'Password', "type": "password", "autofill": "password" }, password)
        .end({ pretty: true });
    await promise_fs_1.writeFile(`${id}.xml`, xml);
}
exports.saveCredentials = saveCredentials;
