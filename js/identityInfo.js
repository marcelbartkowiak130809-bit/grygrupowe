import { identityReferences } from "../content/kim-jestem/references.js?v=20261117-15";
import { identityDescriptions } from "../content/kim-jestem/referenceDescriptions.js?v=20261117-15";
import { escapeHtml } from "./utils.js?v=20261121-6";

const canonical = word => word.trim().normalize("NFC").toLocaleLowerCase("pl");
const index = new Map();
for (const [key, url] of Object.entries(identityReferences)) {
  const word = canonical(key.includes("|") ? key.split("|", 2)[1] : key);
  if (!index.has(word)) index.set(word, new Set());
  index.get(word).add(url);
}

const genericDescriptions = {
  "Wlasne hasla": "Hasło dodane przez gracza w lobby. Znaczenie zależy od tego, kogo lub co miał na myśli autor.",
  "Postacie z bajek": "Postać z animacji lub dziecięcej opowieści.",
  "Postacie z filmów": "Postać z filmu lub serialu.",
  "Postacie z gier": "Postać z gry komputerowej.",
  "Celebryci i artyści": "Osoba znana z działalności artystycznej lub występów w mediach.",
  "Twórcy internetowi": "Twórca publikujący materiały lub prowadzący transmisje w internecie.",
  "Roblox": "Hasło ze świata Roblox, platformy z grami tworzonymi przez społeczność.",
  "Minecraft": "Hasło ze świata Minecraft, gry o budowaniu i eksploracji z bloków.",
};

export function getIdentityInfo(word, category = "") {
  const key = `${category}|${word}`;
  const description = Object.hasOwn(identityDescriptions, key) ? identityDescriptions[key]
    : Object.hasOwn(identityDescriptions, word) ? identityDescriptions[word] : "";
  const matches = index.get(canonical(word));
  const direct = Object.hasOwn(identityReferences, key) ? identityReferences[key]
    : Object.hasOwn(identityReferences, word) ? identityReferences[word] : "";
  const url = direct || (!description && (!category || category === "Wlasne hasla") && matches?.size === 1
    ? matches.values().next().value : "");
  return { url, description:description || genericDescriptions[category] || (category
    ? `Hasło z kategorii „${category}”.`
    : genericDescriptions["Wlasne hasla"]) };
}

export function identityInfoButton(word, category) {
  if (!word) return "";
  const { url, description } = getIdentityInfo(word, category);
  const label = `Informacje o haśle: ${escapeHtml(word)}`;
  if (url) return `<a class="identity-info" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="Otwórz artykuł w nowej karcie">i</a>`;
  return `<button type="button" class="identity-info" data-identity-info="${escapeHtml(word)}" data-identity-description="${escapeHtml(description)}" aria-label="${label}" title="Przeczytaj opis">i</button>`;
}

export function bindIdentityInfo(root) {
  const dialog = root.querySelector(".identity-info-dialog");
  if (!dialog) return;
  for (const button of root.querySelectorAll("[data-identity-info]")) {
    button.addEventListener("click", () => {
      dialog.querySelector("h2").textContent = button.dataset.identityInfo;
      dialog.querySelector("p").textContent = button.dataset.identityDescription;
      dialog.showModal();
    });
  }
}
