import { TemporaryEmail } from "./email";
import faker from "faker";

export function generateRandomUser(): any {
  const email = TemporaryEmail.generateRandomMail();
  return ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: email,
    password: email,
  })
}
