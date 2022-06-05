import assert from "node:assert";
//@ts-ignore
import test from "node:test";
import { MegaClient } from "../lib";

test("asynchronous failing test", async (t) => {
  const client = MegaClient();
  await client.account.resumeSession();
  assert.deepStrictEqual(client.account., {});
});
