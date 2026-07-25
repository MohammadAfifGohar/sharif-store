import assert from "node:assert/strict";
import test from "node:test";

import { decodeEntities, textFromHtml } from "../src/lib/html-text";

test("strips html tags and collapses whitespace", () => {
  assert.equal(
    textFromHtml("<p>Hello   <strong>world</strong></p>"),
    "Hello world",
  );
});

test("returns empty string for undefined input", () => {
  assert.equal(textFromHtml(undefined), "");
});

test("decodes named entities", () => {
  assert.equal(decodeEntities("Tom &amp; Jerry &ndash; done"), "Tom & Jerry – done");
});

test("decodes decimal and hex numeric entities", () => {
  assert.equal(decodeEntities("It&#8217;s &#x2764; here"), "It’s ❤ here");
});

test("leaves unknown entities untouched", () => {
  assert.equal(decodeEntities("a &notreal; b"), "a &notreal; b");
});

test("textFromHtml decodes entities after stripping tags", () => {
  assert.equal(
    textFromHtml("<span>Rose &amp; Oud &#8211; 50ml</span>"),
    "Rose & Oud – 50ml",
  );
});
