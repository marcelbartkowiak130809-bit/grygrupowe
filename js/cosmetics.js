const item = (id, type, name, price, rarity, description, options = {}) => ({ id, type, name, price, rarity, description, ...options });
export const rarityLabels = { common:"Common", rare:"Rare", epic:"Epic", legendary:"Legendary", mythic:"Mythic" };

export const cosmetics = [
  item("defaultCandy","candy","Mietowka",0,"common","Domyslny bialo-czerwony cukierek. Dziala tylko w trybie Zatruty cukierek."),
  item("chocoCandy","candy","Czekoladka",700,"common","Czekoladowy skin cukierkow tylko do trybu Zatruty cukierek."),
  item("fizzyCandy","candy","Kwasna rolka",1200,"rare","Kolorowy kwasny cukierek bez zadnego logo. Tylko do trybu Zatruty cukierek."),
  item("jellyCandy","candy","Galaretka",1800,"rare","Miekki zelkowy wyglad cukierkow tylko do trybu Zatruty cukierek."),
  item("cosmicCandy","candy","Kosmiczny cukierek",3200,"epic","Animowany kosmiczny skin cukierkow tylko do trybu Zatruty cukierek."),
  item("colaCandy","candy","Cola drops",1400,"rare","Ciemny karmelowy cukierek tylko do trybu Zatruty cukierek."),
  item("neonCandy","candy","Neonowy zel",3600,"epic","Swiecacy zelowy cukierek tylko do trybu Zatruty cukierek."),
  item("lavaCandy","candy","Lava karmel",5200,"legendary","Rozgrzany cukierek lawowy tylko do trybu Zatruty cukierek."),
  item("diamondCandy","candy","Diamentowy cukierek",6100,"legendary","Krystaliczny cukierek tylko do trybu Zatruty cukierek."),
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

  item("hornedFrame","frame","Diabelskie rogi",5200,"legendary","Ramka z rogami i ogonem przy profilowym."),
  item("impTailFrame","frame","Ogon impa",3600,"epic","Czerwony ogon oplata avatar."),
  item("thunderFrame","frame","Ramka pioruna",4200,"legendary","Profilowe lapie blyskawice przy wygranych."),
  item("stageFrame","frame","Sceniczna ramka",3800,"epic","Delikatne swiatlo sceniczne wokol avatara."),
  item("moneyFrame","frame","Banknotowa ramka",4100,"legendary","Zielone blyski jak deszcz monet."),
  item("glassFrame","frame","Szklana ramka",2400,"epic","Przezroczysty szlif na avatarze."),
  item("moonFrame","frame","Kszycowa ramka",2600,"epic","Chlodny srebrny polksiezyc."),
  item("roseFrame","frame","Rozana ramka",2700,"epic","Rzadsza rozowa obwodka z drobnymi platkami."),
  item("stormFrame","frame","Burzowa ramka",4550,"legendary","Ciemny pierscien z blyskami."),
  item("royalSealFrame","frame","Krolewska pieczec",5900,"mythic","Zlota pieczec dla zwyciezcow."),
  item("dragonFrame","frame","Smocza ramka",6600,"mythic","Ostre rogi i rozgrzany obrys."),
  item("angelFrame","frame","Anielska ramka",6200,"mythic","Jasny krag i subtelna aureola."),

  item("batAura","aura","Nietoperze",3500,"epic","Male cienie przelatuja wokol profilowego."),
  item("coinAura","aura","Monety",4200,"legendary","Zlote monety krazace przy avatarze."),
  item("crownAura","aura","Korony",4500,"legendary","Mini korony migaja przy graczu."),
  item("spotlightAura","aura","Reflektor",3900,"epic","Sceniczne swiatlo spada na profilowe."),
  item("meteorAura","aura","Meteory",5200,"legendary","Male meteory przecinaja tlo avatara."),
  item("heartAura","aura","Serca",2500,"epic","Lekkie serca unosza sie przy profilu."),
  item("pixelAura","aura","Piksele",2700,"epic","Kwadratowe iskry arcade."),
  item("runeAura","aura","Runy",4700,"legendary","Runiczne znaki obracaja sie powoli."),
  item("shadowAura","aura","Cien",4300,"legendary","Ciemna smuga za profilowym."),
  item("lavaAura","aura","Lawa",6100,"mythic","Goracy puls lawy wokol avatara."),
  item("haloAura","aura","Aureola",5900,"mythic","Zlote swiatlo nad profilem."),
  item("cashStormAura","aura","Burza kasy",6800,"mythic","Banknoty przelatuja przy zwyciezcy."),

  item("bubbleIdle","idle","Idle: lekki bounce",900,"common","Profilowe delikatnie oddycha podczas gry."),
  item("tiltIdle","idle","Idle: przechylka",1100,"common","Krotkie plynne bujanie avatara."),
  item("pulseIdle","idle","Idle: puls",1350,"rare","Miekki puls bez ruszania strony."),
  item("floatIdle","idle","Idle: unoszenie",1600,"rare","Avatar spokojnie unosi sie i opada."),
  item("blinkIdle","idle","Idle: blysk",1800,"rare","Krotki blysk co chwile."),
  item("spinIdle","idle","Idle: maly obrot",2600,"epic","Subtelny obrot profilowego."),
  item("glitchIdle","idle","Idle: glitch",3100,"epic","Cyfrowy skok tylko na avatarze."),
  item("heartbeatIdle","idle","Idle: heartbeat",3300,"epic","Podwojny rytm jak bicie serca."),
  item("royalIdle","idle","Idle: royal hover",4300,"legendary","Dostojne unoszenie z blyskiem."),
  item("voidIdle","idle","Idle: void drift",5600,"mythic","Ciezki plynny dryf premium."),

  item("winCrown","win","Wygrana: korona",1700,"rare","Po zwyciestwie korona spada na profilowe."),
  item("winMoney","win","Wygrana: kasa",1900,"rare","Gracz rzuca pieniedzmi po wygranej."),
  item("winSpotlight","win","Wygrana: reflektor",2200,"rare","Swiatlo sceniczne robi wejscie zwyciezcy."),
  item("winConfetti","win","Wygrana: konfetti",2400,"epic","Kolorowy wybuch nad nickiem."),
  item("winFireworks","win","Wygrana: fajerwerki",2900,"epic","Mini fajerwerki przy profilowym."),
  item("winLightning","win","Wygrana: piorun",3200,"epic","Blyskawica uderza obok zwyciezcy."),
  item("winStageBow","win","Wygrana: uklon",3500,"epic","Profilowe robi szybki uklon."),
  item("winTrophy","win","Wygrana: puchar",3900,"legendary","Puchar wyskakuje nad graczem."),
  item("winHalo","win","Wygrana: aureola",4300,"legendary","Jasny kreg odpala przy zwyciezcy."),
  item("winPortal","win","Wygrana: portal",4700,"legendary","Portal otwiera sie za profilem."),
  item("winLaser","win","Wygrana: laser show",5100,"legendary","Krotkie lasery podswietlaja nick."),
  item("winRoyalRain","win","Wygrana: zloty deszcz",5600,"mythic","Mityczny deszcz zlota."),
  item("winMeteor","win","Wygrana: meteor",6100,"mythic","Meteor przelatuje nad zwyciezca."),
  item("winAscend","win","Wygrana: ascend",6800,"mythic","Profilowe unosi sie jak legenda."),
  item("winDemonKing","win","Wygrana: demon king",7200,"mythic","Czerwony tron cienia za zwyciezca."),

  item("loseFall","lose","Przegrana: przewrotka",1200,"common","Profilowe przewraca sie po porazce."),
  item("loseBonk","lose","Przegrana: bonk",1400,"common","Cos spada na avatar i go splaszcza."),
  item("loseDust","lose","Przegrana: kurz",1600,"rare","Profilowe znika w chmurce kurzu."),
  item("loseCrack","lose","Przegrana: pekniecie",1900,"rare","Szklo peka na avatarze."),
  item("loseThunder","lose","Przegrana: piorun",2300,"epic","Piorun uderza w przegranego."),
  item("loseLetters","lose","Przegrana: nick rozsypany",2600,"epic","Nick drzy i rozsypuje sie wizualnie."),
  item("loseSquash","lose","Przegrana: squash",2900,"epic","Avatar zgniata sie i wraca."),
  item("loseBurn","lose","Przegrana: popiol",3300,"epic","Ciemny blysk i popiol."),
  item("loseFreeze","lose","Przegrana: lod",3600,"legendary","Profilowe zamarza na chwile."),
  item("losePortal","lose","Przegrana: portal out",4100,"legendary","Portal zabiera avatar."),
  item("loseMeteorHit","lose","Przegrana: meteor hit",4700,"legendary","Cos wielkiego spada obok profilu."),
  item("losePixelBreak","lose","Przegrana: pixel break",5200,"legendary","Avatar rozpada sie w piksele."),
  item("loseDemonLaugh","lose","Przegrana: demoniczny smiech",5900,"mythic","Czerwony cien smieje sie za profilem."),
  item("loseBlackHole","lose","Przegrana: czarna dziura",6500,"mythic","Profilowe zasysa mini portal."),
  item("loseCrownDrop","lose","Przegrana: spadajaca korona",6900,"mythic","Korona spada obok przegranego."),

  item("levelBronzeFrame","frame","Ramka Weterana",0,"rare","Ekskluzywna ramka za level 6.",{exclusive:true,requiredLevel:6}),
  item("levelVioletNick","nick","Nick Awansu",0,"epic","Ekskluzywny fioletowy nick za level 10.",{exclusive:true,requiredLevel:10}),
  item("levelBlazeFrame","frame","Ramka Żaru",0,"epic","Ekskluzywna płonąca ramka za level 18.",{exclusive:true,requiredLevel:18}),
  item("levelCometAura","aura","Aura Komety",0,"legendary","Ekskluzywna aura komety za level 26.",{exclusive:true,requiredLevel:26}),
  item("levelChampionNick","nick","Nick Czempiona",0,"legendary","Ekskluzywny nick czempiona za level 35.",{exclusive:true,requiredLevel:35}),
  item("levelPrismFrame","frame","Pryzmatyczna ramka",0,"mythic","Ekskluzywna ramka za level 45.",{exclusive:true,requiredLevel:45}),
  item("levelNovaAura","aura","Aura Supernowej",0,"mythic","Ekskluzywna aura za level 60.",{exclusive:true,requiredLevel:60}),
  item("levelImpTailFrame","frame","Ogon za level",0,"epic","Ekskluzywna diabelska ramka za level 14.",{exclusive:true,requiredLevel:14}),
  item("levelQuestAura","aura","Aura Questow",0,"epic","Ekskluzywna aura za level 20.",{exclusive:true,requiredLevel:20}),
  item("levelRoyalIdle","idle","Idle Levelowy",0,"legendary","Ekskluzywna animacja idle za level 32.",{exclusive:true,requiredLevel:32}),
  item("levelChampionWin","win","Wygrana Czempiona",0,"legendary","Ekskluzywna animacja wygranej za level 38.",{exclusive:true,requiredLevel:38}),
  item("levelShatterLose","lose","Porazka Shatter",0,"legendary","Ekskluzywna animacja porazki za level 42.",{exclusive:true,requiredLevel:42}),
  item("levelDemonFrame","frame","Rogi Arcymistrza",0,"mythic","Ekskluzywna demoniczna ramka za level 55.",{exclusive:true,requiredLevel:55}),
  item("levelAscendWin","win","Ascend za level",0,"mythic","Ekskluzywna animacja wygranej za level 70.",{exclusive:true,requiredLevel:70}),
  item("levelVoidLose","lose","Void porazki",0,"mythic","Ekskluzywna animacja porazki za level 80.",{exclusive:true,requiredLevel:80}),
  item("levelHaloAura","aura","Aureola Legendy",0,"mythic","Ekskluzywna aura za level 90.",{exclusive:true,requiredLevel:90}),
];

const escapeAttr = value => String(value || "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[char]);
export const rarityOrder = { common:0, rare:1, epic:2, legendary:3, mythic:4 };
export const sortCosmeticsByRarity = (items, options = {}) => {
  const direction = (options.rareFirst ?? true) ? -1 : 1;
  return [...items].sort((a, b) => direction * ((rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0)) || a.name.localeCompare(b.name, "pl"));
};

function animationEffectHtml(id) {
  if (id === "winLaser") return '<span class="fx-laser laser-a"></span><span class="fx-laser laser-b"></span><span class="fx-laser laser-c"></span><span class="fx-laser laser-d"></span>';
  if (id === "winMeteor" || id === "loseMeteorHit") return '<span class="fx-meteor"></span><span class="fx-impact"></span>';
  if (id === "loseBlackHole" || id === "levelVoidLose") return '<span class="fx-black-hole"></span>';
  if (id === "loseDemonLaugh" || id === "winDemonKing") return '<span class="fx-ha ha-a">HA</span><span class="fx-ha ha-b">HA</span><span class="fx-ha ha-c">HA</span><span class="fx-ha ha-d">HA</span>';
  if (id === "winMoney" || id === "winRoyalRain") return '<span class="fx-money money-a">$</span><span class="fx-money money-b">$</span><span class="fx-money money-c">$</span>';
  if (id === "winCrown" || id === "loseCrownDrop" || id === "levelChampionWin") return '<span class="fx-crown">♛</span>';
  if (id === "winSpotlight") return '<span class="fx-spotlight"></span>';
  return "";
}

export function cosmeticPreview(item, profile = {}, options = {}) {
  if (item.type === "candy") {
    return `<div class="cosmetic-preview ${options.compact ? "compact-preview" : ""} preview-candy">
      <div class="shop-candy candy-${item.id}"><span></span></div>
      <span class="nick">${escapeAttr(item.name)}</span>
      ${options.hideType ? "" : '<small class="preview-type">CUKIEREK</small>'}
    </div>`;
  }
  if (["idle","win","lose"].includes(item.type)) {
    const kind = { idle:"IDLE", win:"WYGRANA", lose:"PORAZKA" }[item.type];
    const stateClass = item.type === "idle" ? "preview-idle-state" : item.type === "win" ? "preview-win-state" : "preview-lose-state";
    const avatar = profile.avatarImage ? `<img src="${escapeAttr(profile.avatarImage)}" alt="">` : "G";
    return `<div class="cosmetic-preview ${options.compact ? "compact-preview" : ""} preview-${item.type} ${stateClass}">
      <span class="preview-glow"></span>${animationEffectHtml(item.id)}
      <div class="mini-player cosmetic-animation-preview ${item.id}">
        <div class="preview-avatar avatar ${profile.selectedAvatarFrame || "defaultFrame"} ${profile.selectedAura || "noAura"} ${item.type === "idle" ? item.id : ""}">${avatar}</div>
        <span class="nick ${profile.selectedNickEffect || "defaultNick"}">${escapeAttr(options.nick || profile.nick || "Gracz")}</span>
      </div>
      ${options.hideType ? "" : `<small class="preview-type">${kind}</small>`}
    </div>`;
  }
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
