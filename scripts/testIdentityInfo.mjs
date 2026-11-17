import assert from "node:assert/strict";
import { test } from "node:test";
import { identityCategories } from "../content/kim-jestem/categories.js";
import { identityDescriptions } from "../content/kim-jestem/referenceDescriptions.js";
import { getIdentityInfo, identityInfoButton } from "../js/identityInfo.js";

test("each built-in identity card has an encyclopaedia article or its own description", () => {
  for (const [category, words] of Object.entries(identityCategories)) {
    for (const word of words) {
      const {url} = getIdentityInfo(word, category);
      if (url) assert.equal(new URL(url).protocol, "https:");
      else assert.ok(identityDescriptions[`${category}|${word}`] || identityDescriptions[word], `${category} / ${word}`);
    }
  }
});

test("identity references distinguish homonyms and escape custom cards", () => {
  assert.match(getIdentityInfo("Loki", "Superbohaterowie").url, /Marvel/);
  assert.doesNotMatch(getIdentityInfo("Loki z mitologii", "Mitologia i legendy").url, /Marvel/);
  assert.match(getIdentityInfo("Steve", "Minecraft").url, /minecraft\.wiki\/w\/Player/);
  assert.match(getIdentityInfo("Pikachu", "Pokémon").url, /Pikachu/);
  assert.match(getIdentityInfo("Tymek", "Celebryci i artyści").description, /Język ciała/);
  assert.equal(identityInfoButton("", "Postacie z bajek"), "");
  assert.doesNotMatch(identityInfoButton('<img src=x onerror="test()">', "Wlasne hasla"), /<img/);
});
