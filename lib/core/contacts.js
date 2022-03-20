"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contacts = void 0;
class Contacts {
    constructor(client) {
        this.client = client;
    }
    add(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.api.request({
                    a: "upc",
                    aa: "a",
                    e: this.client.state.email,
                    msg: "Hola, únete a MEGA y obtén acceso a almacenamiento y comunicación cifrados.",
                    u: email,
                });
                return Promise.resolve();
            }
            catch (error) {
                return Promise.reject(new Error(error));
            }
        });
    }
}
exports.Contacts = Contacts;
