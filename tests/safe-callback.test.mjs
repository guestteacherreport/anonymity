// Run with: node --experimental-strip-types --test tests/safe-callback.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { getSafeConfirmEmailCallback } from "../lib/safe-callback.ts";

const token = "abc_DEF-123";

test("accepts the confirm page with its own token/approve parameter", () => {
  assert.equal(getSafeConfirmEmailCallback(`/account/confirm-email?token=${token}`), `/account/confirm-email?token=${token}`);
  assert.equal(getSafeConfirmEmailCallback(`/account/confirm-email?approve=${token}`), `/account/confirm-email?approve=${token}`);
  assert.equal(getSafeConfirmEmailCallback("/account/confirm-email?token=a%2Bb%3D"), "/account/confirm-email?token=a%2Bb%3D");
});

test("survives a round trip through URLSearchParams (middleware -> login)", () => {
  const callback = getSafeConfirmEmailCallback(`/account/confirm-email?approve=${encodeURIComponent("x.y_z-0")}`);
  assert.ok(callback);
  const login = new URL("https://example.test/login");
  login.searchParams.set("callbackUrl", callback);
  const read = new URL(login.toString()).searchParams.get("callbackUrl");
  assert.equal(getSafeConfirmEmailCallback(read), callback);
});

test("rejects external and protocol-relative URLs", () => {
  for (const value of [
    "https://evil.example/account/confirm-email?token=x",
    "http://evil.example",
    "//evil.example/account/confirm-email?token=x",
    "/\\evil.example/account/confirm-email?token=x",
    "\\\\evil.example",
    "javascript:alert(1)",
    "data:text/html,hi",
    "account/confirm-email?token=x",
  ]) {
    assert.equal(getSafeConfirmEmailCallback(value), null, value);
  }
});

test("rejects unrelated or disguised paths", () => {
  for (const value of [
    "/",
    "/auth-redirect",
    "/admin/dashboard",
    "/account",
    "/account/confirm-email",
    "/account/confirm-email/",
    "/account/confirm-email/extra?token=x",
    "/account/confirm-email/../../admin?token=x",
    "/account/confirm-email%2F..%2F..%2Fadmin?token=x",
    "/account/confirm-emailx?token=x",
    "/ACCOUNT/confirm-email?token=x",
  ]) {
    assert.equal(getSafeConfirmEmailCallback(value), null, value);
  }
});

test("rejects unexpected parameters, fragments and odd characters", () => {
  for (const value of [
    "/account/confirm-email?token=x&next=https://evil.example",
    "/account/confirm-email?callbackUrl=//evil.example",
    "/account/confirm-email?token=x#frag",
    "/account/confirm-email?token=x y",
    "/account/confirm-email?token=x\n",
    "/account/confirm-email?token=x\t",
    "/account/confirm-email?token=x\u0000",
    `/account/confirm-email?token=${"a".repeat(5000)}`,
  ]) {
    assert.equal(getSafeConfirmEmailCallback(value), null, JSON.stringify(value).slice(0, 80));
  }
});

test("rejects empty and non-string input", () => {
  assert.equal(getSafeConfirmEmailCallback(null), null);
  assert.equal(getSafeConfirmEmailCallback(undefined), null);
  assert.equal(getSafeConfirmEmailCallback(""), null);
  assert.equal(getSafeConfirmEmailCallback(42), null);
});
