"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.headersThumbnailRequest = void 0;
const chalk = require("chalk");
exports.headersThumbnailRequest = {
    "Origin": "https://mega.nz",
    "User-Agent": "Mozilla/ 5.0(Linux; Android 10; SM - M115F) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 88.0.4324.152 Mobile Safari / 537.36",
    "Accept": "*/*",
    "Referer": "https://mega.nz/",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "es-ES,es;q=0.9",
    "Connection": "keep-alive",
    "Content-Length": "8",
    "sec-ch-ua": `" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"`,
    "sec-ch-ua-mobile": "?0",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "Content-Type": "application/octet-stream",
};
exports.log = {
    sucess: (msg) => console.log(chalk.green(msg)),
    info: (msg) => console.log(chalk.blue(msg)),
    error: (msg) => console.log(chalk.red(msg)),
    warn: (msg) => console.log(chalk.bgRed(msg)),
};
