"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pastebin_js_1 = __importDefault(require("pastebin-js"));
const moment_1 = __importDefault(require("moment"));
const API_KEY = '66797adb0b23b070bb4019851a1b1122';
const USER = 'gxldxm689171';
const PSW = 'bea54436fabf243c24b767289fbdf05f';
let pastebin = new pastebin_js_1.default({
    'api_dev_key': API_KEY,
    'api_user_name': USER,
    'api_user_password': PSW
});
const createPaste = async (data) => {
    let title = await moment_1.default().format('MMMM Do YYYY, h: mm: ss a');
    let link = await pastebin.createPaste(data, title, null, 2);
    return link;
};
exports.default = createPaste;
