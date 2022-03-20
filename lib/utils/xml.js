"use strict";
/* Implementig save email and password thats then used in SafeInCloud this uses XML */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCredentials = void 0;
const xmlbuilder_1 = __importDefault(require("xmlbuilder"));
const crypto_1 = require("crypto");
const promise_fs_1 = require("promise-fs");
const id = crypto_1.randomBytes(16).toString("hex");
function saveCredentials({ title, email, password }) {
    return __awaiter(this, void 0, void 0, function* () {
        var xml = xmlbuilder_1.default.create('database')
            .ele('card', { 'time_stamp': new Date(), "autofill": "off", "id": id, "title": title })
            .ele('field', { 'name': 'Website', "type": "website", "autofill": "url" }, "www.mega.nz")
            .ele('field', { 'name': 'E-mail', "type": "email", "autofill": "username" }, email)
            .ele('field', { 'name': 'Password', "type": "password", "autofill": "password" }, password)
            .end({ pretty: true });
        yield promise_fs_1.writeFile(`${id}.xml`, xml);
    });
}
exports.saveCredentials = saveCredentials;
