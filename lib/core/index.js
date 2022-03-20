"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MegaClient = exports.Files = void 0;
const files_1 = __importDefault(require("./files"));
const api_1 = require("./api");
const account_1 = require("./account");
const state_1 = require("./state");
const contacts_1 = require("./contacts");
/**
 * Main function handler
 */
var files_2 = require("./files");
Object.defineProperty(exports, "Files", { enumerable: true, get: function () { return __importDefault(files_2).default; } });
class MegaClient {
    constructor() {
        this.state = new state_1.State();
        this.api = new api_1.MegaApiClient(this);
        this.account = new account_1.MegaAccount(this);
        this.files = new files_1.default(this);
        this.contacts = new contacts_1.Contacts(this);
    }
}
exports.MegaClient = MegaClient;
