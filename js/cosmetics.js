const item = (id, type, name, price, rarity, description, options = {}) => ({ id, type, name, price, rarity, description, ...options });
export const rarityLabels = { common:"Common", rare:"Rare", epic:"Epic", legendary:"Legendary", mythic:"Mythic" };

export const cosmetics = [
  item("defaultNick","nick","Zwykły nick",0,"common","Klasyczny wygląd nicku."),
  item("redNick","nick","Czerwony nick",250,"common","Wyrazisty czerwony kolor."),
  item("blueNick","nick","Niebieski nick",250,"common","Spokojny niebieski kolor."),
  item("greenNick","nick","Zielony nick",300,"common","Soczysta zieleń."),
  item("yellowNick","nick","Żółty nick",300,"common","Jasny słoneczny kolor."),
  item("orangeNick","nick","Pomarańczowy nick",300,"common","Ciepły energetyczny kolor."),
  item("pinkNick","nick","Różowy nick",300,"common","Lekki cukierkowy kolor."),
  item("purpleNick","nick","Fioletowy nick",350,"common","Głęboki fioletowy tekst."),
  item("mintNick","nick","Miętowy nick",350,"common","Świeży pastelowy odcień."),
  item("goldNick","nick","Złoty nick",850,"rare","Błyszczący złoty tekst."),
  item("neonNick","nick","Neonowy nick",1300,"rare","Cyjanowa poświata retro."),
  item("neonRedNick","nick","Neon czerwony",1450,"rare","Czerwony neon z miękką poświatą."),
  item("neonBlueNick","nick","Neon niebieski",1450,"rare","Intensywny niebieski neon."),
  item("neonGreenNick","nick","Neon zielony",1450,"rare","Jaskrawa zielona poświata."),
  item("neonYellowNick","nick","Neon żółty",1450,"rare","Żółte światło jak szyld arcade."),
  item("neonPinkNick","nick","Neon różowy",1500,"rare","Różowy neon w stylu synthwave."),
  item("neonPurpleNick","nick","Neon fioletowy",1500,"rare","Fioletowa poświata premium."),
  item("iceNick","nick","Lodowy nick",1700,"rare","Chłodny połysk i szron."),
  item("sunsetNick","nick","Sunset nick",2200,"epic","Animowany zachód słońca."),
  item("matrixNick","nick","Matrix nick",2450,"epic","Cyfrowy zielony puls."),
  item("fireNick","nick","Ognisty nick",2300,"epic","Animowany gradient ognia."),
  item("electricNick","nick","Elektryczny nick",2600,"epic","Migoczące wyładowania."),
  item("glitchNick","nick","Glitch nick",3000,"epic","Kontrolowany cyfrowy chaos."),
  item("frostNick","nick","Frostbite nick",3150,"epic","Lodowy gradient i zimna poświata."),
  item("toxicNick","nick","Toxic nick",3350,"epic","Radioaktywna limonkowa energia."),
  item("rainbowNick","nick","Rainbow nick",4100,"legendary","Płynna animowana tęcza."),
  item("voidNick","nick","Void nick",4400,"legendary","Fioletowy puls pustki."),
  item("galaxyNick","nick","Galaktyczny nick",5200,"legendary","Kosmiczny przesuwający się gradient."),
  item("hologramNick","nick","Hologram nick",5600,"legendary","Migoczący holograficzny gradient."),
  item("auroraNick","nick","Aurora nick",5900,"legendary","Kolory zorzy przesuwające się po tekście."),
  item("cosmicNick","nick","Cosmic nick",6200,"mythic","Świetlista energia kosmosu."),
  item("demonicNick","nick","Demoniczny nick",6600,"mythic","Czerwono-czarna aura tekstu."),
  item("divineNick","nick","Boski nick",7200,"mythic","Złote światło premium."),
  item("plasmaNick","nick","Plasma nick",7800,"mythic","Pulsująca energia różu i cyjanu."),

  item("defaultFrame","frame","Zwykła ramka",0,"common","Klasyczna ramka avatara."),
  item("silverFrame","frame","Srebrna ramka",450,"common","Metaliczne srebro."),
  item("redFrame","frame","Czerwona ramka",550,"common","Prosta czerwona obwódka."),
  item("blueFrame","frame","Niebieska ramka",550,"common","Spokojna niebieska obwódka."),
  item("greenFrame","frame","Zielona ramka",550,"common","Soczysta zielona obwódka."),
  item("yellowFrame","frame","Żółta ramka",550,"common","Jasna żółta obwódka."),
  item("purpleFrame","frame","Fioletowa ramka",600,"common","Fioletowa ramka do avatara."),
  item("goldFrame","frame","Złota ramka",1000,"rare","Ciepła złota obwódka."),
  item("neonFrame","frame","Neonowa ramka",1700,"rare","Mocna cyjanowa poświata."),
  item("neonRedFrame","frame","Neonowa czerwona ramka",1800,"rare","Czerwony świecący pierścień."),
  item("neonBlueFrame","frame","Neonowa niebieska ramka",1800,"rare","Niebieski świecący pierścień."),
  item("neonGreenFrame","frame","Neonowa zielona ramka",1800,"rare","Zielony świecący pierścień."),
  item("neonPinkFrame","frame","Neonowa różowa ramka",1850,"rare","Różowy świecący pierścień."),
  item("fireFrame","frame","Ognista ramka",2400,"epic","Pulsujący żar."),
  item("iceFrame","frame","Lodowa ramka",2400,"epic","Chłodne błyski lodu."),
  item("electricFrame","frame","Elektryczna ramka",2800,"epic","Dynamiczne wyładowania."),
  item("toxicFrame","frame","Toxic ramka",3100,"epic","Limonkowa radioaktywna poświata."),
  item("sunsetFrame","frame","Sunset ramka",3250,"epic","Ciepłe kolory zachodu słońca."),
  item("rainbowFrame","frame","Tęczowa ramka",3900,"legendary","Obracający się kolorowy pierścień."),
  item("voidFrame","frame","Void ramka",4200,"legendary","Ciemna pulsująca ramka."),
  item("galaxyFrame","frame","Galaktyczna ramka",5100,"legendary","Kosmiczny pierścień."),
  item("auroraFrame","frame","Aurora ramka",5500,"legendary","Wirujące kolory zorzy polarnej."),
  item("hologramFrame","frame","Hologram ramka",5700,"legendary","Migotliwy holograficzny pierścień."),
  item("cosmicFrame","frame","Cosmic ramka",6100,"mythic","Energia gwiazd."),
  item("crownFrame","frame","Królewska ramka",6400,"mythic","Złota korona dla lidera."),
  item("cursedFrame","frame","Przeklęta ramka",6700,"mythic","Czerwony puls cienia."),
  item("divineFrame","frame","Boska ramka",7400,"mythic","Świetlisty złoty krąg."),
  item("plasmaFrame","frame","Plasma ramka",7900,"mythic","Rozgrzana energia różu i błękitu."),

  item("noAura","aura","Brak aury",0,"common","Bez dodatkowej aury."),
  item("sparkAura","aura","Małe iskry",950,"common","Subtelne migoczące punkty."),
  item("redGlowAura","aura","Czerwona poświata",1050,"common","Miękki czerwony blask."),
  item("blueGlowAura","aura","Niebieska poświata",1050,"common","Miękki niebieski blask."),
  item("greenGlowAura","aura","Zielona poświata",1050,"common","Miękki zielony blask."),
  item("yellowGlowAura","aura","Żółta poświata",1050,"common","Ciepły żółty blask."),
  item("pinkGlowAura","aura","Różowa poświata",1100,"common","Lekki różowy blask."),
  item("glowAura","aura","Glow aura",1350,"rare","Miękka świetlista poświata."),
  item("neonRedAura","aura","Neonowa czerwona aura",1850,"rare","Intensywny czerwony neon."),
  item("neonBlueAura","aura","Neonowa niebieska aura",1850,"rare","Intensywny niebieski neon."),
  item("neonGreenAura","aura","Neonowa zielona aura",1850,"rare","Intensywny zielony neon."),
  item("neonPinkAura","aura","Neonowa różowa aura",1900,"rare","Różowy neon synthwave."),
  item("flameAura","aura","Aura ognia",2600,"epic","Ciepły pulsujący płomień."),
  item("iceAura","aura","Lodowa aura",2600,"epic","Chłodna błękitna energia."),
  item("electricAura","aura","Elektryczna aura",3100,"epic","Migoczące wyładowania."),
  item("smokeAura","aura","Dymna aura",3500,"epic","Ciemna miękka mgła."),
  item("toxicAura","aura","Toxic aura",3600,"epic","Radioaktywny limonkowy puls."),
  item("sunsetAura","aura","Sunset aura",3700,"epic","Pomarańczowo-różowa energia."),
  item("starsAura","aura","Gwiezdna aura",3900,"legendary","Wędrujące gwiezdne iskry."),
  item("voidAura","aura","Void aura",4700,"legendary","Fioletowy puls pustki."),
  item("galaxyAura","aura","Galaktyczna aura",5600,"legendary","Kolorowa energia galaktyki."),
  item("auroraAura","aura","Aurora aura",5900,"legendary","Zorza polarna wokół avatara."),
  item("hologramAura","aura","Hologram aura",6100,"legendary","Migotliwa holograficzna poświata."),
  item("cosmicAura","aura","Kosmiczna aura",6400,"mythic","Mocna animowana aura premium."),
  item("demonicAura","aura","Demoniczna aura",6900,"mythic","Czerwony cień i żar."),
  item("divineAura","aura","Boska aura",7600,"mythic","Złota promienna poświata."),
  item("plasmaAura","aura","Plasma aura",8100,"mythic","Mocny puls różowej i błękitnej energii."),

  item("levelBronzeFrame","frame","Ramka Weterana",0,"rare","Ekskluzywna ramka za level 6.",{exclusive:true,requiredLevel:6}),
  item("levelVioletNick","nick","Nick Awansu",0,"epic","Ekskluzywny fioletowy nick za level 10.",{exclusive:true,requiredLevel:10}),
  item("levelBlazeFrame","frame","Ramka Żaru",0,"epic","Ekskluzywna płonąca ramka za level 18.",{exclusive:true,requiredLevel:18}),
  item("levelCometAura","aura","Aura Komety",0,"legendary","Ekskluzywna aura komety za level 26.",{exclusive:true,requiredLevel:26}),
  item("levelChampionNick","nick","Nick Czempiona",0,"legendary","Ekskluzywny nick czempiona za level 35.",{exclusive:true,requiredLevel:35}),
  item("levelPrismFrame","frame","Pryzmatyczna ramka",0,"mythic","Ekskluzywna ramka za level 45.",{exclusive:true,requiredLevel:45}),
  item("levelNovaAura","aura","Aura Supernowej",0,"mythic","Ekskluzywna aura za level 60.",{exclusive:true,requiredLevel:60}),
];

const escapeAttr = value => String(value || "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[char]);

export function cosmeticPreview(item, profile = {}, options = {}) {
  const nick = item.type === "nick" ? item.id : "defaultNick";
  const frame = item.type === "frame" ? item.id : "defaultFrame";
  const aura = item.type === "aura" ? item.id : "noAura";
  const avatar = profile.avatarImage ? `<img src="${escapeAttr(profile.avatarImage)}" alt="">` : "G";
  const typeLabel = { nick:"NICK", frame:"RAMKA", aura:"AURA" }[item.type] || "EFEKT";
  const auraHasGlow = item.type === "aura" && item.id !== "noAura";
  const auraHasOrbits = ["galaxyAura","auroraAura","hologramAura","cosmicAura","levelCometAura","levelNovaAura"].includes(item.id);
  const auraHasParticles = ["sparkAura","starsAura","galaxyAura","hologramAura","cosmicAura","levelCometAura","levelNovaAura"].includes(item.id);
  return `<div class="cosmetic-preview ${options.compact ? "compact-preview" : ""} preview-${item.type} ${item.id === "noAura" ? "preview-empty-aura" : ""}">
    ${auraHasGlow ? '<span class="preview-glow"></span>' : ""}
    ${auraHasOrbits ? '<span class="preview-orbit orbit-one"></span><span class="preview-orbit orbit-two"></span>' : ""}
    ${auraHasParticles ? '<span class="preview-particle particle-a"></span><span class="preview-particle particle-b"></span><span class="preview-particle particle-c"></span>' : ""}
    <div class="preview-avatar avatar ${frame} ${aura}">${avatar}</div>
    <span class="nick ${nick}">${escapeAttr(options.nick || profile.nick || "Gracz")}</span>
    ${options.hideType ? "" : `<small class="preview-type">${typeLabel}</small>`}
  </div>`;
}

export function getShopRotation(now = Date.now()) {
  const paid = cosmetics.filter(item => item.price > 0 && !item.exclusive);
  const slot = Math.floor(now / (15 * 60 * 1000));
  const offset = slot % paid.length;
  const items = [0, 17, 31].map(step => paid[(offset + step) % paid.length]);
  return { slot, items, endsAt:(slot + 1) * 15 * 60 * 1000 };
}
