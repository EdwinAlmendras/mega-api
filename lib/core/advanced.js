"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const files_1 = __importDefault(require("./files"));
// eslint-disable-next-line no-trailing-spaces
/*
GOLDEN-PARK@{VERSION}/
├─ girls/
├─ categories/
├─ studios/
 */
class GoldenPark extends files_1.default {
    constructor(ctx) {
        super(ctx);
        this.client.state.APP_NAME = "GOLDEN-PARK";
        this.client.state.VERSION = "2.0.0";
        this.client.state.APP = `${this.client.state.APP_NAME}@${this.client.state.VERSION}`;
        this.client.state.ID_ROOT_FOLDER = this.get({ name: this.client.state.APP }).nodeId;
        this.client.state.FOLDERS = {
            GIRLS: this.getByPath({ path: "girls" }),
            STUDIOS: this.getByPath({ path: "studios" }),
            CATEGORIES: this.getByPath({ path: "categories" }),
        };
    }
    girls() {
        return this.list({ folderId: this.client.state.FOLDERS.GIRLS.nodeId });
    }
}
exports.default = GoldenPark;
