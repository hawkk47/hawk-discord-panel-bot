const test = require("node:test");
const assert = require("node:assert");
const { sendMessageSchema } = require("../shared/validation");

test("sendMessageSchema validates payload", () => {
  const ok = sendMessageSchema.safeParse({ channelId: "123", content: "Hello" });
  assert.ok(ok.success);

  const bad = sendMessageSchema.safeParse({ channelId: "", content: "" });
  assert.equal(bad.success, false);
});