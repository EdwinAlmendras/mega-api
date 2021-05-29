"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomUser = void 0;
const email_1 = require("./email");
const faker_1 = __importDefault(require("faker"));
function generateRandomUser() {
    const email = email_1.TemporaryEmail.generateRandomMail();
    return ({
        firstName: faker_1.default.name.firstName(),
        lastName: faker_1.default.name.lastName(),
        email: email,
        password: email,
    });
}
exports.generateRandomUser = generateRandomUser;
