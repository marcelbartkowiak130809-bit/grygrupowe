import { escapeHtml } from "./utils.js?v=20260822-1";
import { Audio } from "./audio.js?v=20260902-1";
import { polishTrackData } from "./polishMusic.js?v=20260902-3";
import { extendedGlobalMusicTracks } from "./extendedMusic.js?v=20260902-1";
import { extendedGlobalMusicTracks2 } from "./extendedGlobalMusic2.js?v=20260902-4";
import { curatedArtistMusicTracks } from "./curatedArtistMusic.js?v=20260902-3";

export const musicDuelDefaults = { rounds: 5, selectionTime: 30, votingTime: 25, category: "all", region: "global" };
export const musicArenaDefaults = { rounds: 10, selectionTime: 30, votingTime: 25, category: "all", region: "global" };
export const musicRegionOptions = [
  ["global", "🌍", "Globalne", "Zagraniczne utwory i wykonawcy"],
  ["polish", "🇵🇱", "Polskie", "Polskie hity — stare, nowe i viralowe"],
];
export const musicRegionLabel = region => musicRegionOptions.find(([id]) => id === region)?.[2] || "Globalne";
const safeMusicRegion = value => value === "polish" ? "polish" : "global";
const MUSIC_LISTENING_SECONDS = 60;
const MUSIC_SKIP_AFTER_SECONDS = 10;

// The category list is intentionally much broader than a normal select menu.
// Positive/party prompts are the majority, with years, genres and darker
// moods mixed in so the game does not turn into the same four prompts.
export const musicCategories = [
  ["all", "Wszystko", "Najpopularniejsze"],
  ["bangers", "Bangery wszech czasów", "Najpopularniejsze"],
  ["party", "Impreza, która wymknęła się spod kontroli", "Najpopularniejsze"],
  ["summer", "Letnie hity", "Najpopularniejsze"],
  ["roadtrip", "Muzyka na roadtrip", "Najpopularniejsze"],
  ["morning", "Dobry początek dnia", "Najpopularniejsze"],
  ["dance", "Do tańca bez wymówek", "Najpopularniejsze"],
  ["energy", "Energetyczne", "Najpopularniejsze"],
  ["motivation", "Motywacja do działania", "Najpopularniejsze"],
  ["gym", "Na siłownię", "Najpopularniejsze"],
  ["confidence", "Czuję się jak główny bohater", "Najpopularniejsze"],
  ["victory", "Muzyka po wygranej", "Najpopularniejsze"],
  ["singalong", "Do darcia się razem", "Najpopularniejsze"],
  ["nostalgia", "Nostalgia", "Najpopularniejsze"],
  ["comfort", "Comfort songs", "Najpopularniejsze"],
  ["chill", "Spokojny wieczór", "Nastroje"],
  ["sunset", "Zachód słońca", "Nastroje"],
  ["rain", "Deszcz za oknem", "Nastroje"],
  ["night", "Późna noc", "Nastroje"],
  ["cozy", "Koc, herbata i serial", "Nastroje"],
  ["romantic", "Romantyczne, ale bez cringu", "Nastroje"],
  ["crush", "Muzyka dla zauroczenia", "Nastroje"],
  ["breakup", "Po rozstaniu", "Nastroje"],
  ["sad", "Smutne, ale piękne", "Nastroje"],
  ["crying", "Do płakania w poduszkę", "Nastroje"],
  ["anger", "Kiedy wszystko wkurza", "Nastroje"],
  ["villain", "Czarny charakter wchodzi do sceny", "Nastroje"],
  ["dark", "Mroczny klimat", "Nastroje"],
  ["dramatic", "Przesadnie dramatyczne", "Nastroje"],
  ["chaos", "Totalny chaos", "Nastroje"],
  ["weird", "Dziwne, ale działa", "Nastroje"],
  ["guilty", "Guilty pleasure", "Nastroje"],
  ["worst", "Najgorszy możliwy wybór", "Nastroje"],
  ["meme", "Memy i internet", "Nastroje"],
  ["tiktok", "Hity z TikToka", "Internet i trendy"],
  ["viral", "Viralowe refreny", "Internet i trendy"],
  ["edit", "Muzyka do editów", "Internet i trendy"],
  ["gaming", "Gaming soundtrack", "Internet i trendy"],
  ["roblox", "Roblox vibes", "Internet i trendy"],
  ["minecraft", "Minecraftowe wspomnienia", "Internet i trendy"],
  ["anime", "Anime openingi i endingi", "Internet i trendy"],
  ["movie", "Filmowy hit", "Internet i trendy"],
  ["series", "Serialowy soundtrack", "Internet i trendy"],
  ["radio", "Jak z radia", "Internet i trendy"],
  ["pop", "Pop", "Gatunki"],
  ["rap", "Rap", "Gatunki"],
  ["polishRap", "Polski rap", "Gatunki"],
  ["hiphop", "Hip-hop i R&B", "Gatunki"],
  ["rock", "Rock", "Gatunki"],
  ["popRock", "Pop rock", "Gatunki"],
  ["metal", "Metal", "Gatunki"],
  ["indie", "Indie", "Gatunki"],
  ["alternative", "Alternatywne", "Gatunki"],
  ["punk", "Punk", "Gatunki"],
  ["electronic", "Elektroniczne", "Gatunki"],
  ["house", "House", "Gatunki"],
  ["techno", "Techno", "Gatunki"],
  ["drumAndBass", "Drum & bass", "Gatunki"],
  ["phonk", "Phonk", "Gatunki"],
  ["disco", "Disco", "Gatunki"],
  ["funk", "Funk", "Gatunki"],
  ["jazz", "Jazz", "Gatunki"],
  ["blues", "Blues", "Gatunki"],
  ["country", "Country", "Gatunki"],
  ["reggae", "Reggae", "Gatunki"],
  ["latin", "Latino", "Gatunki"],
  ["kpop", "K-pop", "Gatunki"],
  ["classical", "Klasyka", "Gatunki"],
  ["acoustic", "Akustyczne", "Gatunki"],
  ["instrumental", "Bez wokalu", "Gatunki"],
  ["oneHit", "One hit wonders", "Gatunki"],
  ["debut", "Najlepszy debiut", "Gatunki"],
  ["collab", "Najlepsza współpraca", "Gatunki"],
  ["female", "Kobiece wokale", "Wokale i wykonawcy"],
  ["male", "Męskie wokale", "Wokale i wykonawcy"],
  ["duets", "Duety", "Wokale i wykonawcy"],
  ["bands", "Zespoły", "Wokale i wykonawcy"],
  ["soloists", "Soliści", "Wokale i wykonawcy"],
  ["polish", "Polskie piosenki", "Wokale i wykonawcy"],
  ["english", "Anglojęzyczne", "Wokale i wykonawcy"],
  ["international", "Międzynarodowe", "Wokale i wykonawcy"],
  ["live", "Wersja live", "Wokale i wykonawcy"],
  ["cover", "Lepszy cover niż oryginał", "Wokale i wykonawcy"],
  ["soundtrack", "Soundtrack życia", "Pomysły"],
  ["opening", "Czołówka, której nie skipujesz", "Pomysły"],
  ["endCredits", "Napisy końcowe", "Pomysły"],
  ["bossFight", "Walka z bossem", "Pomysły"],
  ["finalBattle", "Finał sezonu", "Pomysły"],
  ["firstDate", "Pierwsza randka", "Pomysły"],
  ["wedding", "Wesele", "Pomysły"],
  ["birthday", "Urodziny", "Pomysły"],
  ["holiday", "Wakacje", "Pomysły"],
  ["christmas", "Święta nadchodzą", "Pomysły"],
  ["newYear", "Sylwester", "Pomysły"],
  ["school", "Szkolne wspomnienia", "Pomysły"],
  ["work", "Do pracy albo nauki", "Pomysły"],
  ["cleaning", "Sprzątanie pokoju", "Pomysły"],
  ["sleep", "Do zasypiania", "Pomysły"],
  ["midnight", "Słuchane o północy", "Pomysły"],
  ["2020s", "Hity lat 2020–2025", "Roczniki"],
  ["2025", "Hity 2025", "Roczniki"],
  ["2024", "Hity 2024", "Roczniki"],
  ["2023", "Hity 2023", "Roczniki"],
  ["2022", "Hity 2022", "Roczniki"],
  ["2021", "Hity 2021", "Roczniki"],
  ["2020", "Hity 2020", "Roczniki"],
  ["2010s", "Hity lat 2010–2019", "Roczniki"],
  ["2019", "Hity 2019", "Roczniki"],
  ["2018", "Hity 2018", "Roczniki"],
  ["2017", "Hity 2017", "Roczniki"],
  ["2016", "Hity 2016", "Roczniki"],
  ["2015", "Hity 2015", "Roczniki"],
  ["2014", "Hity 2014", "Roczniki"],
  ["2013", "Hity 2013", "Roczniki"],
  ["2012", "Hity 2012", "Roczniki"],
  ["2011", "Hity 2011", "Roczniki"],
  ["2000s", "Hity lat 2000–2009", "Roczniki"],
  ["2009", "Hity 2009", "Roczniki"],
  ["2008", "Hity 2008", "Roczniki"],
  ["2007", "Hity 2007", "Roczniki"],
  ["2006", "Hity 2006", "Roczniki"],
  ["2005", "Hity 2005", "Roczniki"],
  ["2004", "Hity 2004", "Roczniki"],
  ["2003", "Hity 2003", "Roczniki"],
  ["2002", "Hity 2002", "Roczniki"],
  ["2001", "Hity 2001", "Roczniki"],
  ["2000", "Hity 2000", "Roczniki"],
  ["1990s", "Hity lat 90.", "Roczniki"],
  ["1980s", "Hity lat 80.", "Roczniki"],
  ["1970s", "Hity lat 70.", "Roczniki"],
  ["oldies", "Klasyki, które się nie starzeją", "Roczniki"],
  ["throwback", "Throwback", "Roczniki"],
  ["retro", "Retro", "Roczniki"],
];

const categoryIds = new Set(musicCategories.map(([id]) => id));
const categoryLabel = id => musicCategories.find(item => item[0] === id)?.[1] || "Wszystko";
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = value => Array.isArray(value) ? value : [];
const clamp = (value, min, max, fallback) => Math.max(min, Math.min(max, Number(value) || fallback));
const clean = (value, max = 180) => String(value || "").trim().slice(0, max);
const deadline = seconds => Date.now() + Math.max(5, Number(seconds) || 30) * 1000;
const shuffled = list => [...list].sort(() => Math.random() - 0.5);
const nick = (accounts, uid) => accounts?.[uid]?.nick || (String(uid).startsWith("bot:") ? "Bot" : "Gracz");
const same = (left, right) => String(left || "").trim().toLocaleLowerCase("pl-PL") === String(right || "").trim().toLocaleLowerCase("pl-PL");

const fallbackTrackNames = [
  ["Blinding Lights", "The Weeknd"], ["As It Was", "Harry Styles"], ["Levitating", "Dua Lipa"],
  ["Flowers", "Miley Cyrus"], ["Shape of You", "Ed Sheeran"], ["Bad Guy", "Billie Eilish"],
  ["Wake Me Up", "Avicii"], ["Mr. Brightside", "The Killers"], ["Believer", "Imagine Dragons"],
  ["One More Time", "Daft Punk"], ["Rolling in the Deep", "Adele"], ["Uptown Funk", "Mark Ronson"],
  ["Houdini", "Dua Lipa"], ["Starboy", "The Weeknd"], ["Cruel Summer", "Taylor Swift"],
  ["Dance Monkey", "Tones And I"], ["Someone You Loved", "Lewis Capaldi"], ["Perfect", "Ed Sheeran"],
  ["Counting Stars", "OneRepublic"], ["Cheap Thrills", "Sia"], ["Chandelier", "Sia"],
  ["Firework", "Katy Perry"], ["Roar", "Katy Perry"], ["Halo", "Beyoncé"],
  ["Someone Like You", "Adele"], ["Hello", "Adele"], ["Faded", "Alan Walker"],
  ["Closer (feat. Halsey)", "The Chainsmokers"], ["Something Just Like This", "The Chainsmokers & Coldplay"],
  ["My Universe", "Coldplay X BTS"], ["Yellow", "Coldplay"], ["Summertime Sadness", "Lana Del Rey"],
  ["Video Games (Remastered)", "Lana Del Rey"], ["One Dance (feat. Wizkid & Kyla)", "Drake"], ["Circles", "Post Malone"],
  ["Espresso", "Sabrina Carpenter"], ["Die With A Smile", "Lady Gaga & Bruno Mars"], ["APT.", "ROSÉ & Bruno Mars"],
  ["BIRDS OF A FEATHER", "Billie Eilish"], ["Beautiful Things", "Benson Boone"], ["drivers license", "Olivia Rodrigo"],
  ["Watermelon Sugar", "Harry Styles"], ["Heat Waves", "Glass Animals"], ["Sweater Weather", "The Neighbourhood"],
  ["Somebody That I Used to Know (feat. Kimbra)", "Gotye"], ["Take On Me", "a-ha"], ["Billie Jean", "Michael Jackson"],
  ["Smells Like Teen Spirit", "Nirvana"], ["Don't Stop Me Now", "Queen"], ["The Nights", "Avicii"],
  ["Titanium (feat. Sia)", "David Guetta"], ["Havana (feat. Young Thug)", "Camila Cabello"], ["Anti-Hero", "Taylor Swift"],
  ["Bad Habit", "Steve Lacy"],
  ["BbY WOW", "KAROL G, Judeline & rusowsky"], ["Dai Dai", "Shakira & Burna Boy"], ["Ordinary", "Alex Warren"],
  ["Taste", "Sabrina Carpenter"], ["Good Luck, Babe!", "Chappell Roan"], ["I Had Some Help (feat. Morgan Wallen)", "Post Malone"],
  ["SWIM", "BTS"],
  ["petal", "Ariana Grande"], ["hate that i made you love me", "Ariana Grande"], ["like i do", "Ariana Grande"],
  ["kiss me", "Ariana Grande"], ["7 rings", "Ariana Grande"], ["One Last Time", "Ariana Grande"],
  ["thank u, next", "Ariana Grande"], ["positions", "Ariana Grande"], ["no tears left to cry", "Ariana Grande"],
  ["Woman", "Doja Cat"], ["Kiss Me More (feat. SZA)", "Doja Cat & SZA"], ["Streets", "Doja Cat"],
  ["Paint The Town Red", "Doja Cat"], ["Agora Hills", "Doja Cat"], ["Say So", "Doja Cat"],
  ["Need To Know", "Doja Cat"], ["You Right", "Doja Cat & The Weeknd"],
  ["Poker Face", "Lady Gaga"], ["Just Dance (feat. Colby O'Donis)", "Lady Gaga"], ["Bad Romance", "Lady Gaga"],
  ["Paparazzi", "Lady Gaga"], ["Shallow", "Lady Gaga & Bradley Cooper"], ["Abracadabra", "Lady Gaga"],
  ["Always Remember Us This Way", "Lady Gaga"], ["Telephone (feat. Beyoncé)", "Lady Gaga"],
];

// Boty korzystają z lokalnego katalogu, więc musimy przechowywać w nim te
// same publiczne assety, które normalnie zwraca wyszukiwarka iTunes.
// Dzięki temu bot nie pokazuje pustej karty nawet bez wcześniejszego searchu.
const fallbackTrackAssets = [
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/9e/f7/689ef7fe-14fe-a846-c87f-7d3b2d6344b1/mzaf_4167137058064023087.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/37/d1/1a37d1b1-8508-54f2-f541-bf4e437dda76/19UMGIM05028.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/87/1f/c3871f7e-3260-d615-1c66-5fdca2c3a48f/mzaf_10721331211699880949.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/18/5b/1e/185b1ef5-5d97-19d8-aebf-8e29e41874ef/13UAAIM59255.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/68/1e/60/681e601f-e1f2-4ebb-37de-adf00bdf57b6/mzaf_8266263075137964740.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/64/9c/11649c80-2066-dba8-77a9-df7eecae26c1/17UM1IM06937.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/a0/30/c3a03008-17c5-aa29-6c6a-5e757ccdbaa5/mzaf_6073120660767081787.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c0/3f/36/c03f367a-b66b-fd0a-a54c-30f8250c4410/mzaf_12768434238801682952.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/fd/4a/77/fd4a77db-0ebc-d043-41a2-f32fa1bb0fb4/dj.qrikkdwj.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5d/93/d8/5d93d83f-ad1e-da4d-1d79-9937bdff24ec/mzaf_14396932211949300852.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4c/4f/03/4c4f032a-3d2b-853d-da81-996602355b42/mzaf_11625850023134180491.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7e/30/c5/7e30c572-aa47-5f7b-c6fd-42d50cd2c56d/886444959797.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b9/96/2c/b9962c79-3662-235c-e55d-6c4b41457499/mzaf_18075623088273148288.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/dd/af/ea/ddafeab5-797a-5b6f-7735-f96c537b45e0/5054197894091.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2c/da/b5/2cdab5c6-04a8-5231-c697-00101e876479/mzaf_5586859405346659517.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/d2/3a/b8/d23ab839-660d-ef93-2ccb-d0825fc3e8f5/075679838872.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/45/72/4f/45724fc8-2e85-d5b1-dda0-775958e9b692/mzaf_1626542530959622659.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3f/24/64/3f246431-43ae-3df2-c181-4b13661d2d00/19UMGIM90850.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/05/71/a8/0571a843-d302-0a76-2459-4a1f2f9f71ea/mzaf_16289059875957340999.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c7/ba/bc/c7babc66-f598-aaa6-bcf6-307281795817/mzaf_16337361235117168274.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/cb/eb/26/cbeb26a5-15fd-a9e7-0eff-5ee97e28e7c7/13UMGIM15044.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8a/e6/26/8ae626cc-ede8-47d2-d86b-ce7fd562e4d1/mzaf_15251194521255976653.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8b/81/ba/8b81ba55-0a7f-a0e5-6593-d44f1565cdd1/886446097428.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a6/61/ab/a661ab76-1046-6a65-0bd6-c9c0552a7f58/mzaf_15349844265528483258.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/00/bf/72/00bf72a2-3e50-e5e7-ae78-dc35bbf9bcda/886444578219.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f0/de/66/f0de661c-299a-b7ae-80d9-4f35f79875b1/mzaf_10598240417031133475.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/57/b3/3157b3d9-6551-e44e-46c0-488686998a05/13UABIM58339.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/01/1d/81/011d81db-504c-9e37-9cf9-310281b9301a/mzaf_7979324432520378010.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/36/21/81/36218129-51b4-df22-cafb-8e9503b53147/13UAAIM70445.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/21/a8/76/21a87607-1fe3-2bd2-753c-0b4b73c22b90/mzaf_9666996724668759977.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/52/f9/76/52f976b0-016e-a3bf-1897-f69fb5d002d7/mzi.csyboqno.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fb/4a/62/fb4a622f-727e-21f2-5d0b-078205d3b16a/mzaf_13032644911525500388.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f8/df/0a/f8df0ac9-ae76-9dae-86d3-4e913fc54fb1/634904152062.png/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cc/7c/82/cc7c82b6-0f0c-a362-952f-6389dbc603ba/mzaf_15156534524546439842.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/62/bc/87/62bc8791-2a12-4b01-8928-d601684a951c/634904074005.png/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/0e/a2/a1/0ea2a17f-49b7-8d2c-6645-b27f320de20e/mzaf_14739704916677365626.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/7b/37/53/7b375382-ce23-cfa4-03d4-1db4b0f89d72/886447442562.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b1/80/15/b18015f8-329b-7c1d-957a-dad57d257232/mzaf_7706123648455463235.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/fb/1a/a9/fb1aa964-5a7c-6f89-80a4-c35c92d479f6/886445991147.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e9/9d/6f/e99d6fdf-6b71-7567-a423-fce5e51ddad3/mzaf_17383656644300592526.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/9d/56/6f/9d566f55-5253-bed6-5c31-df952dae649d/886446379289.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/64/7f/96/647f9601-aa94-3599-6c73-0143510b8b92/mzaf_13538528720942742126.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0b/66/70/0b667065-6be7-3ac9-ce18-f1c66bcfa1b4/190296451997.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5d/95/8c/5d958cc0-c2e0-b098-9ff1-ddba99775a76/mzaf_5393526497708964970.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/66/f3/1a/66f31a76-a6ed-cb4c-f353-23310a7ae9a8/mzaf_10593596652344378873.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/37/ae/95/37ae95a0-2e1c-bf03-4900-983686da9292/12UMGIM00033.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b8/ef/c5/b8efc5c5-7877-2f17-75bd-b2db984bc59d/mzaf_9257410507335705007.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c5/df/dd/c5dfdd9c-24f2-de01-246c-fcc5e028f705/12UMGIM53864.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/c5/6d/75/c56d75df-9fc2-85dd-92ba-ead2e5526bf0/mzaf_6111395556782441571.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/c4/3a/78/c43a7814-b089-9447-8688-a2fb9bf12c1e/00602547899972.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/25/eb/68/25eb6888-2f1d-7e10-8ea4-ba8213ff1c54/mzaf_12543213267298631850.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6c/13/27/6c13279a-399b-2631-3cb2-6233a91d7a53/19UMGIM78325.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e5/ed/85/e5ed85cc-3cc0-4b6a-84b9-a11340e28989/mzaf_9565620202920523797.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a1/1c/ca/a11ccab6-7d4c-e041-d028-998bcebeb709/24UMGIM61704.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/99/da/ff/99daffce-cdde-59c6-5ae0-7f922ce411a8/mzaf_5621292401829922816.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/ae/f2/11aef294-f57c-bab9-c9fc-529162984e62/24UMGIM85348.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/07/6a/99/076a99ed-b946-431b-6f1f-54fa187ca5bd/mzaf_8102882277995122875.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2d/1a/7d/2d1a7d91-587e-0ceb-d434-327bd66d9e86/075679628312.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7a/15/38/7a1538f3-f41a-a2eb-0f24-8eb6712ee043/mzaf_7740628412097685267.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/34/31/d3/3431d34e-847f-5d66-df83-0bce688d997e/mzaf_18106743962423782018.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/54/f4/92/54f49210-e260-b519-ebbd-f4f40ee710cd/054391342751.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/4d/d5/00/4dd5006f-ee02-c3f1-94db-0ed4b8dd68f1/mzaf_14250561294796027079.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/ed/8c/02ed8cab-c089-2fdd-7ce6-ab334a9a4e19/21UMGIM26093.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/36/62/61/366261be-0996-d73d-de6f-03417867c800/mzaf_8201528327761821135.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2b/c4/c9/2bc4c9d4-3bc6-ab13-3f71-df0b89b173de/886448022213.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/16/86/f5/1686f50d-8b77-7e32-85f7-5f0e804d68fe/mzaf_14195633304344507287.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/da/8b/77/da8b7731-6f4f-eacf-5e74-8b23389eefa1/20UMGIM03371.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a3/4c/b9/a34cb911-40fc-5f0c-e862-14bd171a77aa/mzaf_384792072030970151.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/71/00/287100fb-5c31-0195-5343-e6b3625886d0/886443969834.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8c/37/20/8c372047-2727-8054-9411-0e4867643dd8/mzaf_10169659262182214119.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b3/8a/98/b38a9867-2a9c-de2f-2d80-c624fb2200ec/11UMGIM19347.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4a/63/85/4a6385ef-b80a-5e40-0bf2-245fa5b3dc52/mzaf_1146936378720252898.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music/c6/e1/c8/mzi.ixgzfcmc.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/03/4f/f2034f41-707f-7111-bc63-e5d3cf7f2240/mzaf_17215043934336702540.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/dc/bc/8a/dcbc8a3e-4ce1-c00d-cc02-eda2212053c7/mzaf_8347559338388601510.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d77f1a/00602527874609.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/a6/53/1e/a6531efa-397c-eb73-ecab-9b2790c1471e/mzaf_16440344883389407474.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4d/08/2a/4d082a9e-7898-1aa1-a02f-339810058d9e/14DMGIM05632.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/ec/92/6aec920f-5a05-d93b-ceaa-7de19cdbae88/mzaf_6658285650704260274.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/35/4d/a0/354da058-972b-dcf9-feec-609895ba8cb2/14UMGIM56567.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/20/32/b6/2032b6a6-11e6-b49d-d24d-f5ac0e436f93/mzaf_3388554548944023785.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/99/b4/7b/99b47bd8-2b22-e1ef-2e60-c5147f27a861/dj.thrvmjqj.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/dd/8f/45dd8ffc-0164-1f70-c53d-bf91a1d80b1a/mzaf_3092057092144618662.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/85/28/70/85287029-19b9-cbe3-d1ab-300781875bf4/886446870298.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7d/42/fe/7d42fe40-78b9-c546-861e-bda5788bba4e/mzaf_7434858341023410545.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/01/f2/3d01f2e5-5a08-835f-3d30-d031720b2b80/22UM1IM07364.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/56/2a/1d562a07-dc5f-a9c0-1f36-2051a8c14eb7/mzaf_7214829135431340590.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/41/cf/77/41cf7744-535f-3679-0ca6-c1b8d3f98c8f/196874557266.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/fd/df/23/fddf23b3-bc0c-2a6c-b811-e9784e2e8fc2/mzaf_16866686323648484948.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2b/66/b2/2b66b26c-ab23-faa1-c4ee-06fa2cce8f76/26UM1IM00558.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f3/08/da/f308da3d-00cc-7682-7be9-87cb882f4ea5/mzaf_129115212197250565.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/61/49/8d/61498ded-f0dc-227d-cd1d-2051b5d9f195/196874328590.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/56/7a/bc/567abc01-853d-946a-a47d-e75cb69b5b13/mzaf_345300859410957179.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/46/78/fb/4678fb84-d19e-f11b-93ff-4dc17660bff8/075679619075.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f4/2f/82/f42f82e5-e164-dd14-4f9a-2767d0215bae/mzaf_2512873933120069750.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c9/a3/e9/c9a3e987-3952-a6ac-7975-680f2033e660/25UMGIM10586.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f2/68/e5/f268e559-c2d6-2ab7-75e9-9d82deeacc74/mzaf_12284163589578842254.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/29/a7/c4/29a7c478-351d-25eb-a116-3e68118cdab8/24UMGIM31246.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c3/6d/4f/c36d4f23-b87f-046d-7a0e-e3e05d180b2a/mzaf_17235999651335214399.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/84/df/b9/84dfb96b-27c8-4d40-4780-b65ff22790e4/24UMGIM50612.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1f/70/04/1f7004b7-414e-a89c-0148-abdd38981be8/mzaf_10246855408392712577.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e0/a2/b4/e0a2b443-7969-b57a-a591-cb6172c10aa7/198704943959_Cover.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e7/ce/b3/e7ceb389-cb23-f708-cbdb-ff874be51365/mzaf_3407006493764005509.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/56/f4/96/56f49612-02dd-83f4-44fe-d2118cc70707/26UMGIM51129.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f8/e7/49/f8e7493f-646b-032d-70b2-c3097a0d18c6/mzaf_1782513975775586053.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/7e/e6/82/7ee682bd-1b17-6adc-be63-b5af1bdff369/26UMGIM51126.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/02/41/f3/0241f307-2ec2-f817-3953-78df5f80f63d/mzaf_525670659940588152.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/56/f4/96/56f49612-02dd-83f4-44fe-d2118cc70707/26UMGIM51129.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/12/20/bb/1220bb18-7590-9e7c-a6ed-beca1dc47620/mzaf_667380891852406034.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/56/f4/96/56f49612-02dd-83f4-44fe-d2118cc70707/26UMGIM51129.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b5/18/13/b518132d-1ac2-da97-8d5f-063bdb0c8c2a/mzaf_1158145135257468256.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/69/07/bb6907de-8ad4-970b-3311-121320e1bf9c/19UMGIM03691.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d5/c8/f3/d5c8f31b-1c8f-93ed-e78b-8c0bce3e8b66/mzaf_14456154925680073521.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/85/00/a1/8500a13b-05a6-9e40-dbe0-8a3e48206c24/14UMGIM28138.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/73/13/1c/73131c50-6571-06e5-3404-e1bfa20c7101/mzaf_13252324295984021768.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/69/07/bb6907de-8ad4-970b-3311-121320e1bf9c/19UMGIM03691.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/89/96/16/8996169e-2309-a298-f6f0-e7c52fe8e176/mzaf_590631660224715451.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a8/8e/f9/a88ef97a-74c3-bedf-0574-ea0b83b40a38/20UMGIM94965.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/2e/42/3a/2e423aa9-ca58-fabd-0c6f-dd7ae46f70d3/mzaf_15267168538994108138.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/9e/71/a4/9e71a47f-c290-a542-07fd-a3aed41eefa7/18UMGIM36924.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/14/99/60/14996009-1ae2-54c5-6685-0640c43f7fc2/mzaf_2609526654109745064.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/14/f3/28/14f32832-b9d9-1ba1-e20a-18c2ff8b6a80/886449410873.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/05/49/e8/0549e844-101c-56c7-b6ec-c04892c40b23/mzaf_1389493261873050246.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/14/f3/28/14f32832-b9d9-1ba1-e20a-18c2ff8b6a80/886449410873.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/db/9e/c3db9eb5-fed3-eae6-4bcd-baa949cb623d/mzaf_17138382012543023880.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/f3/03/40/f30340af-55d6-11bb-f59c-b03705360715/886447991831.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/19/2e/9f/192e9f88-8cac-e010-714e-5c1d43b9c957/mzaf_17943970501948063061.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/7b/8b/2a7b8b05-e5b0-bbef-c0a5-ebd27254e501/196871437684.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/28/23/bb/2823bb59-5a20-ed07-6772-2fe8477b373a/mzaf_2330059410084787188.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/db/c2/09/dbc20973-da5c-f959-5d28-e650b17a43c2/196871922708.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/dc/cd/7b/dccd7b93-99eb-d88b-ef80-5bb0cf74a60c/mzaf_1126158269804730666.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/f3/03/40/f30340af-55d6-11bb-f59c-b03705360715/886447991831.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ff/47/3c/ff473c7d-528e-0086-de52-6028bcb62973/mzaf_9830857886973437464.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/4f/4b/ee/4f4bee71-d197-67ab-2a42-913dc416df0d/886449138869.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/42/bc/87/42bc8780-8443-9824-2764-b0020c04a58d/mzaf_12347834451315285447.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/14/f3/28/14f32832-b9d9-1ba1-e20a-18c2ff8b6a80/886449410873.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/39/36/ac/3936acc3-cd4e-50ca-c264-5c8017fd781d/mzaf_16419456039928920907.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/60/b1/ea/60b1ea38-2d5a-190f-984a-281de09f3d73/10UMGIM12308.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f4/4b/0e/f44b0e00-dd5a-059a-258c-8cae357094ba/mzaf_10294149513285744913.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a6/68/28/a66828c0-3fe3-5419-374d-ad98739f3166/08UMGIM13954.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/39/7b/1b/397b1b6b-c433-133e-bb54-e41525e2111c/mzaf_4044793939430554541.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/1f/25/c4/1f25c4bf-7f7a-ff26-8769-20ab6052dadf/09UMGIM40719.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1b/54/f0/1b54f0b7-db6a-1a40-6af8-4ae4650d8d6d/mzaf_2782647211171496826.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/0d/08/050d086a-120b-0fd4-cdcd-9dae383eda49/23UMGIM64895.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/28/d7/0d/28d70d48-3b51-6db7-2fbf-3be964e17004/mzaf_16258227160172363729.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/9f/ef/b19fef51-79de-a940-e8ab-9e4e07b04d96/18UMGIM53752.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/0c/cc/ed/0ccced59-6e6f-f0a0-0c9a-d20bfd475052/mzaf_26600833784075363.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/54/64/2c/54642c8f-4c6c-5e55-45ea-475f98cf74b4/25UMGIM06790.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/66/ae/23/66ae23ad-76f2-cc89-bcef-8592f03f4a74/mzaf_3200208882053923784.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b1/9f/ef/b19fef51-79de-a940-e8ab-9e4e07b04d96/18UMGIM53752.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e4/b8/f3/e4b8f37d-91b4-ca6f-d903-604bb3ada165/mzaf_17531851350070402784.plus.aac.p.m4a"],
  ["https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1b/98/88/1b9888da-6a1f-bff0-ec03-518f445019f6/19UMGIM73435.rgb.jpg/100x100bb.jpg", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/07/ff/cd/07ffcd39-04b6-56a6-69ca-f0fbe35beaaa/mzaf_12419306420041349034.plus.aac.p.m4a"],
];

const globalMusicPreviewCatalog = fallbackTrackNames.map(([title, artist], index) => {
  const [coverUrl = "", previewUrl = ""] = fallbackTrackAssets[index] || [];
  return { id:`fallback-${index}`, title, artist, region:"global", coverUrl, previewUrl, externalUrl:`https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`, provider:"preview" };
});
export const musicPreviewCatalog = [...globalMusicPreviewCatalog, ...extendedGlobalMusicTracks, ...extendedGlobalMusicTracks2, ...curatedArtistMusicTracks, ...polishTrackData];
const fallbackTracks = musicPreviewCatalog;

const polishArtistNames = new Set(polishTrackData.map(track => clean(track.artist, 100).toLocaleLowerCase("pl-PL")));
const trackRegion = track => {
  const title = clean(track?.title || track?.trackName, 100).toLocaleLowerCase("pl-PL");
  const artist = clean(track?.artist || track?.artistName, 100).toLocaleLowerCase("pl-PL");
  const exact = polishTrackData.find(item => item.title.toLocaleLowerCase("pl-PL") === title && item.artist.toLocaleLowerCase("pl-PL") === artist);
  if (exact || polishArtistNames.has(artist)) return "polish";
  return safeMusicRegion(track?.region);
};
export const musicCatalogForRegion = region => musicPreviewCatalog.filter(track => trackRegion(track) === safeMusicRegion(region));
export const isMusicTrackInRegion = (track, region) => trackRegion(track) === safeMusicRegion(region);

function normalizeTrack(track) {
  if (!track || typeof track !== "object") return null;
  const title = clean(track.title || track.trackName, 100), artist = clean(track.artist || track.artistName, 100);
  if (!title || !artist) return null;
  const id = clean(track.id || track.trackId || `${artist}-${title}`, 120);
  const fallback = fallbackTracks.find(item => item.id === id || (item.title === title && item.artist === artist)) || {};
  const query = encodeURIComponent(`${artist} ${title}`);
  return {
    id,
    title,
    artist,
    region: trackRegion({ ...track, title, artist, region:track.region || fallback.region }),
    album: clean(track.album || track.collectionName || fallback.album, 100),
    coverUrl: clean(track.coverUrl || track.artworkUrl100 || fallback.coverUrl, 500),
    previewUrl: clean(track.previewUrl || fallback.previewUrl, 500),
    externalUrl: clean(track.externalUrl || track.trackViewUrl || fallback.externalUrl || `https://open.spotify.com/search/${query}`, 500),
    spotifyUrl: clean(track.spotifyUrl || `https://open.spotify.com/search/${query}`, 500),
    provider: clean(track.provider || fallback.provider || "preview", 30),
  };
}

export async function searchMusicTracks(query, region = "global") {
  const value = clean(query, 100);
  if (value.length < 2) return [];
  const selectedRegion = safeMusicRegion(region);
  const localMatches = musicCatalogForRegion(selectedRegion).filter(track => `${track.title} ${track.artist}`.toLocaleLowerCase("pl-PL").includes(value.toLocaleLowerCase("pl-PL"))).slice(0, 8);
  if (selectedRegion === "polish" && localMatches.length) return localMatches;
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(value)}&entity=song&limit=8&country=PL`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("search failed");
    const data = await response.json();
    const tracks = array(data?.results).map(item => normalizeTrack({ ...item, provider:"preview", region:selectedRegion })).filter(track => track && isMusicTrackInRegion(track, selectedRegion));
    if (tracks.length) return tracks;
  } catch {}
  return localMatches;
}

export function sanitizeMusicDuelSettings(settings = {}) {
  return { rounds:clamp(settings.rounds, 1, 20, 5), selectionTime:clamp(settings.selectionTime ?? settings.answerTime, 10, 90, 30), votingTime:clamp(settings.votingTime, 10, 90, 25), category:categoryIds.has(settings.category) ? settings.category : "all", region:safeMusicRegion(settings.region) };
}

export function sanitizeMusicArenaSettings(settings = {}) {
  return { rounds:clamp(settings.rounds, 1, 100, 10), selectionTime:clamp(settings.selectionTime ?? settings.answerTime, 10, 90, 30), votingTime:clamp(settings.votingTime, 10, 90, 25), category:categoryIds.has(settings.category) ? settings.category : "all", region:safeMusicRegion(settings.region) };
}

function validPlayers(players, min) {
  return [...new Set(array(players).map(String))].filter(Boolean).slice(0, 100).length >= min;
}

function trackForRound(track, fallbackIndex = 0) {
  return normalizeTrack(track) || { ...fallbackTracks[fallbackIndex % fallbackTracks.length] };
}

function trackPool(game) {
  const used = new Set(array(game.usedTracks));
  const pool = musicCatalogForRegion(game?.region);
  const choices = pool.filter(track => !used.has(track.id));
  return choices.length ? choices : pool;
}

function botTrackScore(track) {
  const index = fallbackTracks.findIndex(item => item.id === track?.id || (item.title === track?.title && item.artist === track?.artist));
  // The fallback catalog is ordered from the most recognisable songs to the
  // more niche ones. Real search results stay usable too, just with a neutral
  // score instead of being treated as automatically better.
  return index < 0 ? 8 : fallbackTracks.length - index;
}

function botTrackChoice(game, difficulty = "normal") {
  const available = trackPool(game);
  if (!available.length) return trackForRound(null);
  const ranked = [...available].sort((first, second) => botTrackScore(second) - botTrackScore(first));
  const count = difficulty === "expert" ? 3 : difficulty === "hard" ? 5 : difficulty === "normal" ? 8 : ranked.length;
  const pool = ranked.slice(0, Math.max(1, Math.min(ranked.length, count)));
  return trackForRound(pool[Math.floor(Math.random() * pool.length)]);
}

function botVoteChoice(game, uid, difficulty = "normal", arena = false) {
  const entries = Object.entries(game.submissions || {}).filter(([, track]) => track);
  if (!entries.length) return "";
  const withoutOwn = entries.filter(([owner]) => owner !== uid);
  const eligible = !arena && withoutOwn.length ? withoutOwn : entries;
  const ranked = [...eligible].sort(([, first], [, second]) => botTrackScore(second) - botTrackScore(first));
  const count = difficulty === "expert" ? 2 : difficulty === "hard" ? 3 : difficulty === "normal" ? 4 : ranked.length;
  const pool = ranked.slice(0, Math.max(1, Math.min(ranked.length, count)));
  return pool[Math.floor(Math.random() * pool.length)]?.[0] || eligible[0]?.[0] || "";
}

function startDuelVoting(game, settings) {
  game.phase = "voting";
  game.votes = {};
  game.phaseEndsAt = deadline(settings.votingTime);
}

function startDuelListening(game) {
  game.phase = "listening";
  game.listeningStartedAt = Date.now();
  game.skipAvailableAt = game.listeningStartedAt + MUSIC_SKIP_AFTER_SECONDS * 1000;
  game.skipRequests = {};
  game.phaseEndsAt = game.listeningStartedAt + MUSIC_LISTENING_SECONDS * 1000;
}

function resolveDuelVoting(game) {
  const submissions = object(game.submissions), votes = object(game.votes), counts = {};
  Object.values(votes).forEach(uid => { if (uid in submissions && submissions[uid]) counts[uid] = (counts[uid] || 0) + 1; });
  const max = Math.max(0, ...Object.values(counts).map(Number));
  const winners = max > 0 ? Object.keys(counts).filter(uid => Number(counts[uid]) === max) : [];
  game.scores = object(game.scores);
  winners.forEach(uid => { game.scores[uid] = Number(game.scores[uid] || 0) + 1; });
  game.roundResult = { round:game.round, submissions:{...submissions}, votes:{...votes}, voteCounts:counts, winners };
  game.phase = "roundResult";
  game.phaseEndsAt = Date.now() + 7000;
}

export function createMusicDuelGame(players, settings = {}) {
  const s = sanitizeMusicDuelSettings(settings), list = array(players).slice(0, 8);
  const game = { mode:"muzyczny-pojedynek", phase:"selecting", round:1, totalRounds:s.rounds, players:list, category:s.category, region:s.region, submissions:{}, votes:{}, scores:Object.fromEntries(list.map(uid => [uid, 0])), usedTracks:[], roundResult:null, finished:false, phaseEndsAt:deadline(s.selectionTime) };
  return game;
}

export const MusicDuelEngine = {
  select(game, uid, track, settings = {}) {
    if (game.phase !== "selecting") return "Wybór utworu jest już zamknięty.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    game.submissions = object(game.submissions);
    if (uid in game.submissions) return "Twój utwór jest już zapisany.";
    const cleanTrack = normalizeTrack(track);
    if (!cleanTrack) return "Wybierz utwór z wyników wyszukiwania.";
    if (!isMusicTrackInRegion(cleanTrack, game.region)) return `Wybierz utwór z katalogu: ${musicRegionLabel(game.region)}.`;
    game.submissions[uid] = cleanTrack;
    game.usedTracks = [...new Set([...array(game.usedTracks), cleanTrack.id])].slice(-100);
    if (game.players.every(player => player in game.submissions)) startDuelListening(game);
  },
  vote(game, uid, target) {
    if (game.phase !== "voting") return "Głosowanie jest już zakończone.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    if (!(target in object(game.submissions)) || !game.submissions[target]) return "Ten utwór nie ma poprawnej propozycji.";
    game.votes = object(game.votes);
    if (uid in game.votes) return "Twój głos jest już zapisany.";
    game.votes[uid] = target;
    if (game.players.every(player => player in game.votes)) resolveDuelVoting(game);
  },
  skip(game, uid, settings = {}) {
    if (game.phase !== "listening") return "Głosowanie rozpocznie się po odsłuchu.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej rundzie.";
    if (Date.now() < Number(game.skipAvailableAt || 0)) return `Możecie pominąć odsłuch dopiero po ${MUSIC_SKIP_AFTER_SECONDS} sekundach.`;
    game.skipRequests = object(game.skipRequests);
    game.skipRequests[uid] = true;
    if (game.players.every(player => game.skipRequests[player])) startDuelVoting(game, sanitizeMusicDuelSettings(settings));
  },
  timeout(game, settings = {}) {
    if (game.phase === "selecting") {
      game.submissions = object(game.submissions);
      game.players.forEach((uid, index) => { if (!(uid in game.submissions)) game.submissions[uid] = null; });
      startDuelListening(game);
    } else if (game.phase === "listening") {
      startDuelVoting(game, sanitizeMusicDuelSettings(settings));
    } else if (game.phase === "voting") resolveDuelVoting(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const s = sanitizeMusicDuelSettings(settings);
    if (Number(game.round) >= Number(game.totalRounds || s.rounds)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    game.round += 1; game.submissions = {}; game.votes = {}; game.skipRequests = {}; game.roundResult = null; game.phase = "selecting"; game.phaseEndsAt = deadline(s.selectionTime);
  },
  botTrack(game, uid, difficulty = "normal") {
    return botTrackChoice(game, difficulty);
  },
  botVote(game, uid, difficulty = "normal") {
    return botVoteChoice(game, uid, difficulty);
  },
};

function weightedPick(weights, excluded) {
  const entries = Object.entries(weights).filter(([uid]) => !excluded.has(uid));
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(1, Number(weight) || 1), 0);
  let cursor = Math.random() * Math.max(1, total);
  for (const [uid, weight] of entries) { cursor -= Math.max(1, Number(weight) || 1); if (cursor <= 0) return uid; }
  return entries[entries.length - 1]?.[0] || "";
}

function chooseArenaDuelists(game) {
  const players = array(game.players), weights = object(game.selectionWeights), first = weightedPick(weights, new Set()), second = weightedPick(weights, new Set([first]));
  game.duelists = [first || players[0] || "", second || players.find(uid => uid !== first) || players[1] || ""].filter(Boolean);
}

function startArenaVoting(game, settings) {
  game.phase = "voting"; game.votes = {}; game.phaseEndsAt = deadline(settings.votingTime);
}

function startArenaListening(game) {
  game.phase = "listening";
  game.listeningStartedAt = Date.now();
  game.skipAvailableAt = game.listeningStartedAt + MUSIC_SKIP_AFTER_SECONDS * 1000;
  game.skipRequests = {};
  game.phaseEndsAt = game.listeningStartedAt + MUSIC_LISTENING_SECONDS * 1000;
}

function resolveArenaVoting(game) {
  const submissions = object(game.submissions), votes = object(game.votes), counts = {};
  Object.values(votes).forEach(uid => { if (uid in submissions && submissions[uid]) counts[uid] = (counts[uid] || 0) + 1; });
  const max = Math.max(0, ...Object.values(counts).map(Number));
  const winners = max > 0 ? Object.keys(counts).filter(uid => Number(counts[uid]) === max) : [];
  game.scores = object(game.scores); game.wins = object(game.wins);
  winners.forEach(uid => { game.scores[uid] = Number(game.scores[uid] || 0) + 1; game.wins[uid] = Number(game.wins[uid] || 0) + 1; });
  game.roundResult = { round:game.round, duelists:[...game.duelists], submissions:{...submissions}, votes:{...votes}, voteCounts:counts, winners };
  game.phase = "roundResult"; game.phaseEndsAt = Date.now() + 7000;
}

export function createMusicArenaGame(players, settings = {}) {
  const s = sanitizeMusicArenaSettings(settings), list = array(players).slice(0, 100), selectionWeights = Object.fromEntries(list.map(uid => [uid, 1]));
  const game = { mode:"muzyczna-arena", phase:"selecting", round:1, totalRounds:s.rounds, players:list, category:s.category, region:s.region, duelists:[], submissions:{}, votes:{}, scores:Object.fromEntries(list.map(uid => [uid, 0])), wins:Object.fromEntries(list.map(uid => [uid, 0])), selectionWeights, usedTracks:[], roundResult:null, finished:false, phaseEndsAt:deadline(s.selectionTime) };
  chooseArenaDuelists(game);
  return game;
}

export const MusicArenaEngine = {
  select(game, uid, track, settings = {}) {
    if (game.phase !== "selecting") return "Wybór utworu jest już zamknięty.";
    if (!array(game.duelists).includes(uid)) return "W tej rundzie wybrano innych graczy.";
    game.submissions = object(game.submissions);
    if (uid in game.submissions) return "Twój utwór jest już zapisany.";
    const cleanTrack = normalizeTrack(track);
    if (!cleanTrack) return "Wybierz utwór z wyników wyszukiwania.";
    if (!isMusicTrackInRegion(cleanTrack, game.region)) return `Wybierz utwór z katalogu: ${musicRegionLabel(game.region)}.`;
    game.submissions[uid] = cleanTrack;
    game.usedTracks = [...new Set([...array(game.usedTracks), cleanTrack.id])].slice(-100);
    if (game.duelists.every(player => player in game.submissions)) startArenaListening(game);
  },
  vote(game, uid, target) {
    if (game.phase !== "voting") return "Głosowanie jest już zakończone.";
    if (array(game.duelists).includes(uid) || !array(game.players).includes(uid)) return "Gracze wybierający utwór nie głosują w tej rundzie.";
    if (!(target in object(game.submissions)) || !game.submissions[target]) return "Ten utwór nie ma poprawnej propozycji.";
    game.votes = object(game.votes);
    if (uid in game.votes) return "Twój głos jest już zapisany.";
    game.votes[uid] = target;
    const voters = game.players.filter(player => !game.duelists.includes(player));
    if (voters.every(player => player in game.votes)) resolveArenaVoting(game);
  },
  skip(game, uid, settings = {}) {
    if (game.phase !== "listening") return "Głosowanie rozpocznie się po odsłuchu.";
    if (!array(game.duelists).includes(uid)) return "Tylko osoby wybierające utwór mogą zaakceptować pominięcie.";
    if (Date.now() < Number(game.skipAvailableAt || 0)) return `Możecie pominąć odsłuch dopiero po ${MUSIC_SKIP_AFTER_SECONDS} sekundach.`;
    game.skipRequests = object(game.skipRequests);
    game.skipRequests[uid] = true;
    if (game.duelists.every(player => game.skipRequests[player])) startArenaVoting(game, sanitizeMusicArenaSettings(settings));
  },
  timeout(game, settings = {}) {
    if (game.phase === "selecting") {
      game.submissions = object(game.submissions);
      game.duelists.forEach((uid, index) => { if (!(uid in game.submissions)) game.submissions[uid] = null; });
      startArenaListening(game);
    } else if (game.phase === "listening") {
      startArenaVoting(game, sanitizeMusicArenaSettings(settings));
    } else if (game.phase === "voting") resolveArenaVoting(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const s = sanitizeMusicArenaSettings(settings);
    if (Number(game.round) >= Number(game.totalRounds || s.rounds)) { game.phase = "gameSummary"; game.finished = true; game.phaseEndsAt = null; return; }
    const selected = new Set(game.duelists || []);
    game.selectionWeights = Object.fromEntries(game.players.map(uid => [uid, selected.has(uid) ? 1 : Math.min(100, Math.max(1, Number(game.selectionWeights?.[uid] || 1) + 1))]));
    chooseArenaDuelists(game); game.round += 1; game.submissions = {}; game.votes = {}; game.skipRequests = {}; game.roundResult = null; game.phase = "selecting"; game.phaseEndsAt = deadline(s.selectionTime);
  },
  botTrack(game, uid, difficulty = "normal") {
    return botTrackChoice(game, difficulty);
  },
  botVote(game, uid, difficulty = "normal") {
    return botVoteChoice(game, uid, difficulty, true);
  },
};

function categoryOptions(selected) {
  let previous = "";
  return musicCategories.map(([id, label, group]) => {
    const optgroup = group !== previous ? `<optgroup label="${escapeHtml(group)}">` : "";
    previous = group;
    return `${optgroup}<option value="${escapeHtml(id)}" ${id === selected ? "selected" : ""}>${escapeHtml(label)}</option>${group !== musicCategories.find((item, index) => index > musicCategories.findIndex(item2 => item2[0] === id) && item[2] === group)?.[2] ? "</optgroup>" : ""}`;
  }).join("");
}

function categorySelect(selected, setting, isHost) {
  // A flat select is more usable than a huge grid on phones; optgroups still
  // make the large list scannable on desktop.
  const groups = [];
  musicCategories.forEach(([id, label, group]) => { let current = groups.find(item => item.label === group); if (!current) { current = { label:group, options:[] }; groups.push(current); } current.options.push(`<option value="${escapeHtml(id)}" ${id === selected ? "selected" : ""}>${escapeHtml(label)}</option>`); });
  return `<select data-music-setting="${setting}" ${isHost ? "" : "disabled"}>${groups.map(group => `<optgroup label="${escapeHtml(group.label)}">${group.options.join("")}</optgroup>`).join("")}</select>`;
}

export function musicRegionPicker(selected, setting, isHost, prefix = "music") {
  const region = safeMusicRegion(selected);
  return `<fieldset class="music-region-picker"><legend>Katalog utworów</legend><div class="music-region-options" role="radiogroup" aria-label="Katalog utworów">${musicRegionOptions.map(([id, icon, label, description]) => `<label class="music-region-option ${region === id ? "is-selected" : ""}"><input type="radio" name="${escapeHtml(setting)}" value="${id}" data-${escapeHtml(prefix)}-setting="${escapeHtml(setting)}" ${region === id ? "checked" : ""} ${isHost ? "" : "disabled"}><span class="music-region-option-icon">${icon}</span><span><b>${escapeHtml(label)}</b><small>${escapeHtml(description)}</small></span></label>`).join("")}</div></fieldset>`;
}

export function renderMusicDuelLobbySettings(room, isHost) {
  const s = sanitizeMusicDuelSettings(room.settings);
  return `<div class="music-settings">${musicRegionPicker(s.region, "region", isHost)}<label class="setting-row"><span>Liczba rund</span><select data-music-setting="rounds" ${isHost ? "" : "disabled"}>${[3, 5, 7, 10, 15, 20].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór utworu</span><select data-music-setting="selectionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${s.selectionTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><div class="music-fixed-listening"><b>Odsłuch rundy · 60 s</b><small>Stałe 30 sekund na każdy z dwóch podglądów. Tego czasu nie zmienia preset.</small></div><label class="setting-row"><span>Czas głosowania</span><select data-music-setting="votingTime" ${isHost ? "" : "disabled"}>${[15, 25, 30, 45, 60].map(value => `<option value="${value}" ${s.votingTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span>${categorySelect(s.category, "category", isHost)}</label><p class="tiny">Każdy wyszukuje i wybiera jeden utwór. Potem słuchacie propozycji i głosujecie na najlepszą.</p></div>`;
}

export function renderMusicArenaLobbySettings(room, isHost) {
  const s = sanitizeMusicArenaSettings(room.settings);
  return `<div class="music-settings">${musicRegionPicker(s.region, "region", isHost)}<label class="setting-row"><span>Liczba rund</span><select data-music-setting="rounds" ${isHost ? "" : "disabled"}>${[10, 20, 30, 50, 100].map(value => `<option value="${value}" ${s.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór utworu</span><select data-music-setting="selectionTime" ${isHost ? "" : "disabled"}>${[15, 30, 45, 60].map(value => `<option value="${value}" ${s.selectionTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><div class="music-fixed-listening"><b>Odsłuch rundy · 60 s</b><small>Oba wybrane podglądy mają po 30 sekund. Pominięcie wymaga zgody obu autorów po 10 sekundach.</small></div><label class="setting-row"><span>Czas głosowania</span><select data-music-setting="votingTime" ${isHost ? "" : "disabled"}>${[15, 25, 30, 45, 60].map(value => `<option value="${value}" ${s.votingTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Kategoria</span>${categorySelect(s.category, "category", isHost)}</label><p class="tiny">W każdej rundzie losujemy dwóch graczy. Szanse osób niewylosowanych rosną, ale nikt nie jest całkiem wykluczony.</p></div>`;
}

function playerRows(game, accounts, field = "scores") {
  return [...array(game.players)].sort((a, b) => Number(game[field]?.[b] || 0) - Number(game[field]?.[a] || 0)).map((uid, index) => `<div class="music-ranking-row"><span>${index + 1}. ${escapeHtml(nick(accounts, uid))}</span><b>${Number(game[field]?.[uid] || 0)} pkt</b></div>`).join("");
}

function trackIdentity(track) {
  const normalized = normalizeTrack(track);
  return normalized ? `${normalized.title} — ${normalized.artist}` : "Brak propozycji";
}

function trackInfoHtml(track, extra = "") {
  const normalized = normalizeTrack(track);
  if (!normalized) return `<div class="music-no-track">Brak wybranego utworu</div>`;
  return `<div class="music-track-info">${normalized.coverUrl ? `<img src="${escapeHtml(normalized.coverUrl)}" alt="" loading="lazy">` : `<span class="music-cover-placeholder">♫</span>`}<div><b>${escapeHtml(normalized.title)}</b><small>${escapeHtml(normalized.artist)}${normalized.album ? ` · ${escapeHtml(normalized.album)}` : ""}</small></div>${extra}</div>`;
}

function trackSearchHtml() {
  return `<form class="music-track-search" data-music-search-form><div class="music-search-input-row"><input type="search" maxlength="100" autocomplete="off" placeholder="Wpisz tytuł albo wykonawcę…" required><button class="primary" type="submit">Szukaj</button></div><p class="tiny">Wybierz gotowy wynik — nie musisz kopiować żadnego linku.</p><div class="music-search-results" data-music-search-results></div></form>`;
}

function trackSearchResultsHtml(results) {
  return results.map((track, index) => `<button class="music-search-result" type="button" data-music-search-result="${index}">${trackInfoHtml(track)}<span>Wybierz</span></button>`).join("") || `<p class="muted">Nie znaleziono utworu. Spróbuj tytułu albo wykonawcy.</p>`;
}

const musicSearchStates = new Map();
function musicSearchStateKey(room, game, currentUser) {
  return `${room?.roomId || "local"}:${room?.gameMode || game?.mode || "music"}:${game?.region || "global"}:${Number(game?.round || 1)}:${currentUser || "guest"}`;
}
function musicSearchStateFor(key) {
  if (!key) return { query:"", results:[], searched:false, pending:false, requestId:0 };
  let state = musicSearchStates.get(key);
  if (!state) {
    state = { query:"", results:[], searched:false, pending:false, requestId:0 };
    musicSearchStates.set(key, state);
  }
  return state;
}
function bindMusicSearchResults(results, found, onSelect, stateKey) {
  results.querySelectorAll("[data-music-search-result]").forEach(item => item.addEventListener("click", () => {
    const track = found[Number(item.dataset.musicSearchResult)];
    if (!track) return;
    const result = onSelect(track);
    const clear = value => { if (value !== false && stateKey) musicSearchStates.delete(stateKey); };
    if (result?.then) result.then(clear).catch(() => {});
    else clear(result);
  }));
}

function playlistHtml(submissions, accounts, { allowVote = false, currentUser = "", arena = false, namespace = "room" } = {}) {
  const entries = Object.entries(submissions || {}).filter(([, track]) => track);
  const playable = entries.find(([, track]) => track?.previewUrl) || entries[0];
  const firstIndex = playable ? Math.max(0, entries.findIndex(([uid]) => uid === playable[0])) : 0;
  const first = playable?.[1];
  const firstKey = first ? `music:${namespace}:${playable[0]}:${first.id || firstIndex}` : "";
  const player = first?.previewUrl ? `<audio data-music-preview data-track-audio controls preload="metadata" data-track-key="${escapeHtml(firstKey)}" src="${escapeHtml(first.previewUrl)}"></audio><p class="music-autoplay-note">Podglądy lecą po kolei. Jeśli przeglądarka zablokuje dźwięk, kliknij „Odtwórz”.</p>${Audio.trackVolumeControlHtml({ compact:true })}` : `<p class="music-no-preview">Brak dostępnego podglądu tego utworu. <a href="${escapeHtml(first?.spotifyUrl || first?.externalUrl || "#")}" target="_blank" rel="noreferrer">Otwórz w Spotify</a></p>${Audio.trackVolumeControlHtml({ compact:true })}`;
  return `<div class="music-playlist" data-music-playlist><div class="music-now-playing"><div><p class="eyebrow">TERAZ GRA</p><strong data-music-now-playing>${escapeHtml(first ? trackIdentity(first) : "Brak utworów")}</strong></div><span data-music-playlist-count>${first ? `${firstIndex + 1}/${entries.length}` : "0/0"}</span></div><div class="music-player" data-music-player>${player}</div><div class="music-song-list">${entries.map(([uid, track], index) => { const key = `music:${namespace}:${uid}:${track.id || index}`; return `<article class="music-song-card ${index === firstIndex ? "is-active" : ""}" data-music-track-card data-track-key="${escapeHtml(key)}" data-track-index="${index}" data-preview-url="${escapeHtml(track.previewUrl || "")}" data-external-url="${escapeHtml(track.spotifyUrl || track.externalUrl || "")}"><div class="music-song-card-head"><span class="music-song-number">${arena ? (index === 0 ? "A" : "B") : `#${index + 1}`}</span>${trackInfoHtml(track, `<small class="music-track-owner">${allowVote ? "" : escapeHtml(nick(accounts, uid))}</small>`)}</div><div class="music-song-card-actions"><button class="ghost" type="button" data-music-play-track>▶ Odtwórz</button>${allowVote ? `<button class="primary" type="button" data-music-vote="${escapeHtml(uid)}">Wybieram ten utwór</button>` : ""}</div></article>`; }).join("")}</div></div>`;
}

function bindTrackSearch(root, actions, onSelect, stateKey = "", region = "global") {
  const form = root.querySelector("[data-music-search-form]"), results = root.querySelector("[data-music-search-results]");
  if (!form || !results) return;
  const state = musicSearchStateFor(stateKey);
  let found = Array.isArray(state.results) ? state.results : [];
  const input = form.querySelector("input"), button = form.querySelector("button");
  if (state.query && input) input.value = state.query;
  const renderSavedResults = () => {
    if (state.pending) {
      results.innerHTML = `<p class="muted">Wyszukiwanie utworów…</p>`;
      if (button) { button.disabled = true; button.textContent = "Szukam…"; }
      return;
    }
    if (!state.searched) return;
    results.innerHTML = trackSearchResultsHtml(found);
    bindMusicSearchResults(results, found, onSelect, stateKey);
  };
  renderSavedResults();
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const query = input?.value || "";
    state.query = query;
    state.searched = true;
    state.pending = true;
    const requestId = ++state.requestId;
    button.disabled = true; button.textContent = "Szukam…"; results.innerHTML = `<p class="muted">Wyszukiwanie utworów…</p>`;
    try {
      const nextFound = await actions.musicSearchTracks(query, region);
      if (state.requestId !== requestId) return;
      found = Array.isArray(nextFound) ? nextFound : [];
      state.results = found;
      state.pending = false;
      if (form.isConnected) {
        results.innerHTML = trackSearchResultsHtml(found);
        bindMusicSearchResults(results, found, onSelect, stateKey);
        button.disabled = false; button.textContent = "Szukaj";
      }
    } catch {
      if (state.requestId !== requestId) return;
      state.results = [];
      state.pending = false;
      if (form.isConnected) {
        results.innerHTML = trackSearchResultsHtml([]);
        button.disabled = false; button.textContent = "Szukaj";
      }
    }
  });
}

function bindMusicPlayback(root) {
  const playlist = root.querySelector("[data-music-playlist]");
  if (!playlist) return;
  const audio = playlist.querySelector("audio[data-music-preview]"), player = playlist.querySelector("[data-music-player]"), now = playlist.querySelector("[data-music-now-playing]"), counter = playlist.querySelector("[data-music-playlist-count]"), cards = [...playlist.querySelectorAll("[data-music-track-card]")];
  const syncPlaybackState = () => player?.classList.toggle("is-playing", Boolean(audio && !audio.paused));
  audio?.addEventListener("play", syncPlaybackState);
  audio?.addEventListener("pause", syncPlaybackState);
  audio?.addEventListener("ended", () => {
    syncPlaybackState();
    const currentIndex = cards.findIndex(card => card.dataset.trackKey === Audio.activeTrackKey);
    const next = cards.slice(Math.max(0, currentIndex) + 1).find(card => card.dataset.previewUrl);
    if (next) activate(next);
  });
  syncPlaybackState();
  const activate = (card, { autoplay = true } = {}) => {
    cards.forEach(item => item.classList.toggle("is-active", item === card));
    const index = Number(card.dataset.trackIndex) + 1;
    if (now) now.textContent = card.querySelector(".music-track-info b")?.textContent || "Utwór";
    if (counter) counter.textContent = `${index}/${cards.length}`;
    if (!audio || !card.dataset.previewUrl) return;
    if (audio.dataset.trackKey === card.dataset.trackKey && audio.currentSrc === card.dataset.previewUrl) {
      Audio.bindTrackAudio(audio, card.dataset.trackKey, { autoplay });
      return;
    }
    Audio.setTrackAudioSource(audio, card.dataset.trackKey, card.dataset.previewUrl, { autoplay });
  };
  cards.forEach(card => card.querySelector("[data-music-play-track]")?.addEventListener("click", () => {
    if (card.dataset.previewUrl) activate(card);
    else if (card.dataset.externalUrl) window.open(card.dataset.externalUrl, "_blank", "noopener,noreferrer");
  }));
  if (audio) {
    const preferred = cards.find(card => card.dataset.trackKey === Audio.activeTrackKey && card.dataset.previewUrl) || cards.find(card => card.dataset.previewUrl);
    if (preferred) activate(preferred);
  }
  Audio.bindTrackVolumeControls(playlist);
}

function scheduleTimer(game, actions, method, expected) {
  const endAt = Number(game.phaseEndsAt);
  if (!["selecting", "listening", "voting"].includes(game.phase) || !Number.isFinite(endAt) || endAt <= 0) return;
  const timerKey = `${method}:${game.phase}:${endAt}`;
  musicTimerKey = timerKey;
  const update = () => {
    if (musicTimerKey !== timerKey) return;
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    document.querySelectorAll("[data-music-countdown]").forEach(item => { item.textContent = `${left}s`; });
    if (left <= 0) {
      musicClockTimer = 0;
      musicTimer = window.setTimeout(() => {
        if (musicTimerKey !== timerKey) return;
        musicTimerKey = "";
        actions[method](expected);
      }, 50);
      return;
    }
    musicClockTimer = window.setTimeout(update, 250);
  };
  update();
}

let musicTimer = 0;
let musicClockTimer = 0;
let musicTimerKey = "";
let musicSkipUnlockTimer = 0;
let musicSkipUnlockKey = "";
export function stopMusicTimer() { window.clearTimeout(musicTimer); window.clearTimeout(musicClockTimer); musicTimer = 0; musicClockTimer = 0; musicTimerKey = ""; }

function musicHeader(game, title, accounts, arena = false) {
  const region = musicRegionOptions.find(([id]) => id === game.region) || musicRegionOptions[0];
  return `<p class="eyebrow">${escapeHtml(title)} · RUNDA ${Math.min(Number(game.round || 1), Number(game.totalRounds || 1))}/${Number(game.totalRounds || 1)}</p><h1>${arena ? "Który utwór wygrywa?" : "Który numer bierze rundę?"}</h1><div class="music-category-banner"><span>🎵</span><div><small>KATEGORIA · ${region[1]} ${escapeHtml(region[2])}</small><strong>${escapeHtml(categoryLabel(game.category))}</strong></div></div>`;
}

function musicSkipPanel(game, currentUser, eligible) {
  const players = array(eligible), requests = object(game.skipRequests), requested = players.filter(uid => requests[uid]).length;
  const available = Date.now() >= Number(game.skipAvailableAt || 0);
  const ownRequest = Boolean(requests[currentUser]);
  const canRequest = players.includes(currentUser);
  const wait = Math.max(1, Math.ceil((Number(game.skipAvailableAt || 0) - Date.now()) / 1000));
  const agreementText = players.length === 2 ? "Obie osoby muszą potwierdzić." : "Wszyscy uczestnicy muszą potwierdzić.";
  const people = players.map(uid => { const value = String(uid); return `<span class="${requests[uid] ? "is-ready" : ""}">${escapeHtml(value === String(currentUser) ? "Ty" : value.startsWith("bot:") ? "Bot" : "Gracz")}${requests[uid] ? " ✓" : ""}</span>`; }).join("");
  return `<div class="music-skip-panel"><div><p class="eyebrow">WCZEŚNIEJSZE POMINIĘCIE</p><b>${requested}/${players.length} osób zgadza się na skip</b><small>Normalnie odsłuch trwa pełną minutę. ${agreementText}</small></div><div class="music-skip-people">${people}</div>${canRequest ? `<button class="ghost" type="button" data-music-skip ${!available || ownRequest ? "disabled" : ""}>${ownRequest ? "Zgoda zapisana" : available ? "Zgadzam się na skip" : `Dostępne za ${wait}s`}</button>` : `<small class="muted">Czekamy na zgodę wybranych graczy.</small>`}</div>`;
}

function bindMusicSkipAvailability(root, game) {
  const button = root.querySelector("[data-music-skip]");
  const remaining = Number(game.skipAvailableAt || 0) - Date.now();
  if (!button) return;
  if (remaining <= 0) {
    button.disabled = false;
    button.textContent = "Zgadzam się na skip";
    return;
  }
  const key = String(game.skipAvailableAt);
  if (musicSkipUnlockKey !== key) {
    window.clearTimeout(musicSkipUnlockTimer);
    musicSkipUnlockKey = key;
    musicSkipUnlockTimer = window.setTimeout(() => {
      musicSkipUnlockKey = "";
      document.querySelectorAll("[data-music-skip]").forEach(item => { item.disabled = false; item.textContent = "Zgadzam się na skip"; });
    }, remaining + 50);
  }
}

export function renderMusicDuelGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  const namespace = room.roomId || "duel";
  let content = musicHeader(game, "POJEDYNEK HITÓW", accounts);
  if (game.phase === "selecting") {
    const selected = game.submissions?.[currentUser];
    content += selected ? `<div class="music-selected-track"><p class="eyebrow">TWÓJ WYBÓR</p>${trackInfoHtml(selected)}<p class="muted">Czekamy na resztę ekipy. ${Object.keys(game.submissions || {}).length}/${game.players.length} utworów.</p></div>` : `<div class="music-task-card"><h2>Wybierz piosenkę</h2><p class="muted">Znajdź numer pasujący do kategorii i przekonaj ekipę.</p>${trackSearchHtml()}</div><p class="music-timer">Pozostało <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "listening") {
    content += `<h2>Pełny odsłuch rundy</h2><p class="muted">Każdy podgląd trwa 30 sekund. Runda odsłuchu trwa zawsze 60 sekund, niezależnie od presetu.</p>${playlistHtml(game.submissions, accounts, { namespace })}${musicSkipPanel(game, currentUser, game.players)}<p class="music-timer">Do głosowania: <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "voting") {
    content += `<h2>Posłuchajcie propozycji</h2><p class="muted">Głosujesz na numer, który najbardziej pasuje do kategorii. ${currentUser in (game.votes || {}) ? "Twój głos jest zapisany." : "Wybierz jeden utwór poniżej."}</p>${playlistHtml(game.submissions, accounts, { allowVote:!(currentUser in (game.votes || {})), currentUser, namespace })}<p class="music-timer">Głosowanie kończy się za <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "roundResult") {
    const winners = game.roundResult?.winners || [];
    content += `<h2>Wynik rundy</h2>${playlistHtml(game.roundResult?.submissions || game.submissions, accounts, { namespace })}<div class="music-result-list">${Object.entries(game.roundResult?.submissions || {}).map(([uid, track]) => track ? `<div><span>${escapeHtml(nick(accounts, uid))}</span><b>${Number(game.roundResult?.voteCounts?.[uid] || 0)} gł.</b></div>` : "").join("")}</div><p class="music-winner">${winners.length ? `🏆 ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")} wygrywa rundę!` : "Nikt nie zdobył punktu."}</p><div class="music-ranking">${playerRows(game, accounts)}</div><button id="music-duel-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna runda"}</button>`;
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<div class="music-final"><span>🏆</span><h2>Koniec pojedynku</h2><p>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Tym razem nie było zwycięzcy."}</p><div class="music-ranking">${playerRows(game, accounts)}</div></div><button id="music-duel-lobby" class="primary">Zagraj ponownie</button>`;
  }
  root.innerHTML = `<main class="page music-page music-duel-page enter"><section class="panel music-panel">${content}</section><button id="music-duel-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  bindTrackSearch(root, actions, track => track && actions.musicDuelSelect(track, expected), musicSearchStateKey(room, game, currentUser), game.region);
  root.querySelectorAll("[data-music-vote]").forEach(button => button.addEventListener("click", () => actions.musicDuelVote(button.dataset.musicVote, expected)));
  root.querySelector("[data-music-skip]")?.addEventListener("click", () => actions.musicDuelSkip(expected));
  if (game.phase === "listening") bindMusicSkipAvailability(root, game);
  root.querySelector("#music-duel-next")?.addEventListener("click", actions.musicDuelNext);
  root.querySelector("#music-duel-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#music-duel-leave")?.addEventListener("click", () => actions.leaveRoom());
  bindMusicPlayback(root);
  scheduleTimer(game, actions, "musicDuelTimeout", expected);
}

export function renderMusicArenaGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt }, timer = Math.max(0, Math.ceil((Number(game.phaseEndsAt || 0) - Date.now()) / 1000));
  const namespace = room.roomId || "arena";
  let content = musicHeader(game, "BITWA HITÓW", accounts, true);
  if (game.phase === "selecting") {
    const duelists = game.duelists || [], isDuelist = duelists.includes(currentUser), selected = game.submissions?.[currentUser];
    content += `<div class="music-challengers"><p class="eyebrow">WYLOSOWANI GRACZE</p>${duelists.map(uid => `<span>${escapeHtml(nick(accounts, uid))}</span>`).join("<b>VS</b>")}</div>`;
    content += isDuelist ? (selected ? `<div class="music-selected-track"><p class="eyebrow">TWÓJ WYBÓR</p>${trackInfoHtml(selected)}<p class="muted">Drugi gracz wybiera swoją propozycję.</p></div>` : `<div class="music-task-card"><h2>Wejdź do bitwy</h2><p class="muted">Wyszukaj piosenkę, która pokona drugi numer.</p>${trackSearchHtml()}</div>`) : `<div class="waiting-state"><h2>Jesteś dziś publicznością</h2><p>Czekamy, aż ${duelists.map(uid => escapeHtml(nick(accounts, uid))).join(" i ")} wybiorą utwory.</p></div>`;
    content += `<p class="music-timer">Pozostało <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "listening") {
    const duelists = game.duelists || [];
    content += `<h2>Pełny odsłuch rundy</h2><p class="muted">Oba podglądy trwają po 30 sekund, więc odsłuch ma stałe 60 sekund. Dopiero potem publiczność głosuje.</p>${playlistHtml(game.submissions, accounts, { arena:true, namespace })}${musicSkipPanel(game, currentUser, duelists)}<p class="music-timer">Do głosowania: <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "voting") {
    const eligible = !(game.duelists || []).includes(currentUser), voted = currentUser in (game.votes || {});
    content += `<h2>Głosowanie publiczności</h2><p class="muted">Posłuchajcie obu propozycji i wybierzcie lepszą. ${voted ? "Twój głos jest zapisany." : eligible ? "Wybrani gracze nie głosują." : "Nie głosujesz w tej rundzie."}</p>${playlistHtml(game.submissions, accounts, { allowVote:eligible && !voted, currentUser, arena:true, namespace })}<p class="music-timer">Głosowanie kończy się za <b data-music-countdown>${timer}s</b></p>`;
  } else if (game.phase === "roundResult") {
    const winners = game.roundResult?.winners || [];
    content += `<h2>Wynik bitwy</h2>${playlistHtml(game.roundResult?.submissions || game.submissions, accounts, { arena:true, namespace })}<div class="music-result-list">${Object.entries(game.roundResult?.submissions || {}).map(([uid, track]) => track ? `<div><span>${escapeHtml(nick(accounts, uid))}</span><b>${Number(game.roundResult?.voteCounts?.[uid] || 0)} gł.</b></div>` : "").join("")}</div><p class="music-winner">${winners.length ? `🏆 Wygrywa ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Remis — nikt nie zdobywa punktu."}</p><div class="music-ranking">${playerRows(game, accounts, "wins")}</div><button id="music-arena-next" class="primary">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż podsumowanie" : "Następna bitwa"}</button>`;
  } else {
    const top = Math.max(0, ...Object.values(game.scores || {}).map(Number)), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<div class="music-final"><span>🏆</span><h2>Koniec bitwy</h2><p>${winners.length ? `Najwięcej zwycięstw ma ${winners.map(uid => escapeHtml(nick(accounts, uid))).join(", ")}!` : "Nie wyłoniono zwycięzcy."}</p><div class="music-ranking">${playerRows(game, accounts, "wins")}</div></div><button id="music-arena-lobby" class="primary">Zagraj ponownie</button>`;
  }
  root.innerHTML = `<main class="page music-page music-arena-page enter"><section class="panel music-panel">${content}</section><button id="music-arena-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  bindTrackSearch(root, actions, track => track && actions.musicArenaSelect(track, expected), musicSearchStateKey(room, game, currentUser), game.region);
  root.querySelectorAll("[data-music-vote]").forEach(button => button.addEventListener("click", () => actions.musicArenaVote(button.dataset.musicVote, expected)));
  root.querySelector("[data-music-skip]")?.addEventListener("click", () => actions.musicArenaSkip(expected));
  if (game.phase === "listening") bindMusicSkipAvailability(root, game);
  root.querySelector("#music-arena-next")?.addEventListener("click", actions.musicArenaNext);
  root.querySelector("#music-arena-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#music-arena-leave")?.addEventListener("click", () => actions.leaveRoom());
  bindMusicPlayback(root);
  scheduleTimer(game, actions, "musicArenaTimeout", expected);
}
