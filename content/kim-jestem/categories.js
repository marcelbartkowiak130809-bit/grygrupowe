// Dopisuj hasła do tablicy wybranej kategorii lub dodaj nową kategorię z własną tablicą.
export const identityCategories = {
  "Postacie z bajek":["Shrek","Elsa","Kubuś Puchatek","Myszka Miki","Scooby-Doo","SpongeBob","Król Lew","Pikachu","Minionek","Vaiana","Arielka","Kaczor Donald","Tom","Jerry","Pszczółka Maja","Gargamel"],
  "Postacie z filmów":["Harry Potter","Darth Vader","Indiana Jones","Spider-Man","Batman","Barbie","Rocky Balboa","Jack Sparrow","Forrest Gump","James Bond","Wednesday Addams","Hulk","Neo","Hermiona Granger","Shrek","Wolverine"],
  "Postacie z gier":["Mario","Sonic","Steve z Minecrafta","Kratos","Lara Croft","Geralt","Pac-Man","Link","Kirby","Master Chief","CJ z GTA","Agent 47","Pikachu","Crash Bandicoot","Leon Kennedy","Ezio Auditore"],
  "Celebryci i artyści":["Taylor Swift","Robert Lewandowski","Sanah","Dawid Podsiadło","Lady Gaga","The Weeknd","Billie Eilish","Rihanna","Mata","Taco Hemingway","Iga Świątek","Cristiano Ronaldo","Lionel Messi","Ariana Grande","Ed Sheeran","Dua Lipa"],
  "Zwierzęta":["pies","kot","żyrafa","pingwin","rekin","słoń","wilk","lis","krokodyl","delfin","panda","kangur","papuga","żaba","koń","chomik"],
  "Zawody":["lekarz","strażak","nauczyciel","programista","kucharz","pilot","fryzjer","policjant","aktor","fotograf","mechanik","weterynarz","architekt","prawnik","kelner","astronauta"],
  "Przedmioty":["parasol","lodówka","telefon","krzesło","plecak","szczoteczka do zębów","klucz","lustro","czajnik","słuchawki","poduszka","odkurzacz","widelec","latarka","zegarek","walizka"],
  "Jedzenie":["pizza","burger","pierogi","sushi","rosół","naleśniki","kebab","lody","czekolada","frytki","spaghetti","sałatka","tost","ramen","popcorn","sernik"],
  "Marki":["Nike","Adidas","Apple","Samsung","Netflix","Spotify","Lego","IKEA","Coca-Cola","McDonald's","PlayStation","Xbox","YouTube","TikTok","Zara","Żabka"],
  "Kraje":["Polska","Japonia","Włochy","Hiszpania","USA","Kanada","Brazylia","Egipt","Australia","Norwegia","Niemcy","Francja","Grecja","Meksyk","Indie","Islandia"],
  "Miasta":["Warszawa","Kraków","Gdańsk","Wrocław","Paryż","Londyn","Nowy Jork","Tokio","Rzym","Barcelona","Berlin","Praga","Wenecja","Dubaj","Sopot","Zakopane"],
  "Memy i internet":["rickroll","sigma","gigachad","NPC","streamer","influencer","meme","selfie","hashtag","viral","scrollowanie TikToka","subskrypcja","emoji","Discord","YouTube Shorts","streak"],
  "Minecraft":["Creeper","Zombie","Szkielet","Enderman","Warden","Wieśniak","Żelazny golem","Steve","Alex","Herobrine","Wither","Ender Dragon","Ghast","Blaze","Piglin","Wiedźma","Axolotl","Pszczoła","Shulker","Pillager"],
  "Roblox":["noob z Roblox","gracz Brookhaven","gracz Adopt Me","Blox Fruits","Doors","Piggy","Tower of Hell","obby","Robux","avatar Roblox","Pet Simulator","Murder Mystery 2","Dress to Impress","Jailbreak","Arsenal","Rainbow Friends"],
  "Twórcy internetowi":["MrBeast","PewDiePie","IShowSpeed","Kai Cenat","Dream","Technoblade","TommyInnit","DanTDM","Friz","Rezi","Blowek","Mandzio","Gimper","Izak","Wersow","Wardęga","Eleven","Vertez","SKKF","KSI"],
  "Gry popularne":["Minecraft","Roblox","Fortnite","GTA V","The Sims","Brawl Stars","Among Us","Valorant","Counter-Strike","League of Legends","EA FC","Rocket League","Terraria","Subnautica","Pokémon","Mario Kart","Clash Royale","Fall Guys","Stardew Valley","Wiedźmin"],
};
const identityExtras = {
  "Postacie z bajek":["Prosiaczek","Tygrysek","Królik Bugs","Minnie","Goofy","Shaggy","Patryk Rozgwiazda","Skalmar","Anna","Olaf","Stich","Simba","Timon","Pumba","Osioł","Kot w butach","Gru","Po","Król Julian","Peppa","Bluey","Asterix","Obelix","Bolek","Lolek","Reksio","Muminek"],
  "Postacie z filmów":["Ron Weasley","Voldemort","Luke Skywalker","Yoda","Gandalf","Frodo","Gollum","Legolas","Katniss Everdeen","Terminator","Rambo","John Wick","Iron Man","Thor","Kapitan Ameryka","Deadpool","Thanos","Wonder Woman","Harley Quinn","Joker","Willy Wonka","Kevin McCallister","Marty McFly","Gru","Ken"],
  "Postacie z gier":["Luigi","Alex","Creeper","Enderman","Zelda","Ciri","Trevor","Franklin","Michael","Tommy Vercetti","Arthur Morgan","Joel","Ellie","Rayman","Sub-Zero","Scorpion","Chun-Li","Ryu","Sans","Cuphead","Freddy Fazbear","Jonesy","Peely","Shelly","Spike","Leon","Dynamike"],
  "Celebryci i artyści":["Beyoncé","Shakira","Bruno Mars","Justin Bieber","Eminem","Snoop Dogg","Drake","Post Malone","Harry Styles","Miley Cyrus","Selena Gomez","Katy Perry","Michael Jackson","Freddie Mercury","Quebonafide","Bedoes","Young Leosia","Doda","Maryla Rodowicz","Kylian Mbappé","Usain Bolt","LeBron James","Michael Jordan","Mariusz Pudzianowski"],
  "Zwierzęta":["królik","świnka morska","kanarek","krowa","świnia","owca","koza","kura","kaczka","gęś","bocian","orzeł","sowa","flaming","lew","tygrys","gepard","zebra","nosorożec","hipopotam","małpa","goryl","koala","niedźwiedź","wieloryb","ośmiornica","żółw","wąż","pszczoła","motyl"],
  "Zawody":["pielęgniarka","dentysta","psycholog","trener","piłkarz","youtuber","streamer","influencer","kurier","listonosz","sprzedawca","elektryk","hydraulik","budowlaniec","rolnik","kierowca","stewardesa","grafik","dziennikarz","sędzia","ratownik","detektyw"],
  "Przedmioty":["laptop","komputer","klawiatura","myszka","monitor","telewizor","pilot","głośnik","ładowarka","powerbank","portfel","okulary","kubek","talerz","łyżka","nóż","patelnia","garnek","mikrofalówka","ręcznik","kołdra","lampka","biurko","rower","hulajnoga","piłka","aparat","konsola"],
  "Jedzenie":["hot dog","lasagne","schabowy","gofry","pączek","drożdżówka","chipsy","szarlotka","taco","burrito","zapiekanka","kanapka","jajecznica","parówki","kurczak","ryż","ziemniaki","pomidor","ogórek","banan","jabłko","arbuz","truskawka","Nutella"],
  "Marki":["Xiaomi","Huawei","Google","Microsoft","Sony","Nintendo","Puma","New Balance","Vans","Converse","H&M","Pepsi","Sprite","Red Bull","Monster","KFC","Burger King","Starbucks","Biedronka","Lidl","Allegro","Amazon","Discord","Roblox"],
  "Kraje":["Portugalia","Wielka Brytania","Irlandia","Szwecja","Finlandia","Dania","Holandia","Belgia","Szwajcaria","Austria","Czechy","Słowacja","Ukraina","Turcja","Maroko","Chiny","Tajlandia","Argentyna","Korea Południowa","Chorwacja","Rumunia","Węgry","Litwa"],
  "Miasta":["Poznań","Łódź","Katowice","Szczecin","Lublin","Rzeszów","Toruń","Madryt","Lizbona","Wiedeń","Amsterdam","Bruksela","Ateny","Stambuł","Los Angeles","Miami","Chicago","Las Vegas","Toronto","Seul","Pekin","Sydney","Kair","Rio de Janeiro","Monako"],
  "Memy i internet":["Skibidi Toilet","Ohio","Rizz","Trollface","Doge","Cheems","Grumpy Cat","Pepe","Wojak","Among Us","Sus","Press F","LOL","XD","Cringe","Clickbait","Twitch","Reddit","Wikipedia","Google Maps","CapCut","ChatGPT","Duolingo","Keyboard Cat"],
  "Minecraft":["Pająk","Osadnik","Wilk","Kot","Smok Endu","Slime","Diament","Netherit","Redstone","TNT","Kilof","Miecz","Łuk","Tarcza","Totem nieśmiertelności","Stół rzemieślniczy","Piec","Skrzynia","Portal do Netheru","Nether","End","Twierdza","Wioska","Leśna posiadłość","Ocean Monument"],
  "Roblox":["Brookhaven","Adopt Me!","Bee Swarm Simulator","BedWars","Natural Disaster Survival","Build A Boat For Treasure","The Mimic","Work at a Pizza Place","Blade Ball","Evade","Flee the Facility","Restaurant Tycoon 2","Livetopia","MeepCity","Theme Park Tycoon 2","3008"],
  "Twórcy internetowi":["Markiplier","Logan Paul","Jake Paul","Sidemen","PrestonPlayz","Unspeakable","LazarBeam","Pokimane","xQc","Ninja","Kacper Blonsky","Mini Majk","Tromba","Stuu","DisStream","Madzia","Naruciak","Książulo","Mietczyński","Karol Paciorek","IsAmU","Nitrozyniak","Boxdel"],
  "Gry popularne":["Call of Duty","Overwatch 2","Apex Legends","Pokémon GO","Super Mario Bros.","The Legend of Zelda","The Witcher 3","Cyberpunk 2077","Red Dead Redemption 2","Geometry Dash","Plants vs. Zombies","Need for Speed","Forza Horizon","Genshin Impact","Five Nights at Freddy's","Undertale","Cuphead","Fallout","Skyrim","Assassin's Creed","God of War","The Last of Us","Mortal Kombat","Hogwarts Legacy"],
  "Pokémon":["Pikachu","Bulbasaur","Charmander","Squirtle","Eevee","Snorlax","Meowth","Psyduck","Jigglypuff","Gengar","Mewtwo","Mew","Charizard","Blastoise","Venusaur","Lucario","Greninja","Ditto","Magikarp","Gyarados","Lapras","Dragonite","Onix","Machamp","Slowpoke","Togepi","Piplup","Mudkip","Torchic","Treecko","Cyndaquil","Chikorita","Totodile","Rowlet","Litten","Popplio","Sprigatito","Fuecoco","Quaxly","Ash Ketchum","Team Rocket","Poké Ball"],
  "Superbohaterowie":["Spider-Man","Batman","Superman","Wonder Woman","Iron Man","Hulk","Thor","Kapitan Ameryka","Black Widow","Hawkeye","Deadpool","Wolverine","Black Panther","Doctor Strange","Ant-Man","Aquaman","Flash","Green Lantern","Joker","Harley Quinn","Venom","Thanos","Loki","Groot","Star-Lord","Gamora","Daredevil","Catwoman","Robin","Shazam","Supergirl","Miles Morales","Scarlet Witch","Vision","Homelander"],
  "Filmy i seriale":["Harry Potter","Shrek","Kraina Lodu","Toy Story","Auta","Minionki","Madagaskar","Avatar","Titanic","Barbie","Wednesday","Stranger Things","Dom z papieru","Squid Game","Gra o tron","The Walking Dead","Przyjaciele","The Office","Breaking Bad","Rodzina Addamsów","Gwiezdne wojny","Władca Pierścieni","Hobbit","Avengers","Spider-Man","Batman","Joker","Kevin sam w domu","Jurassic Park","Piraci z Karaibów","Matrix","Rocky","Kung Fu Panda","Epoka lodowcowa","Smerfy","SpongeBob","Simpsonowie","Psi Patrol","Czarnobyl"],
  "Sport":["Robert Lewandowski","Cristiano Ronaldo","Lionel Messi","Kylian Mbappé","Iga Świątek","Hubert Hurkacz","Michael Jordan","LeBron James","Usain Bolt","Mariusz Pudzianowski","Kamil Stoch","Adam Małysz","Marcin Gortat","Wojciech Szczęsny","Erling Haaland","Neymar","Karim Benzema","Luka Modrić","Novak Djoković","Rafael Nadal","Roger Federer","Michael Phelps","Mike Tyson","Muhammad Ali","Robert Kubica","Max Verstappen","Lewis Hamilton","Ronaldinho","Diego Maradona","Pelé"],
  "Anime i manga":["Naruto","Sasuke","Sakura","Kakashi","Goku","Vegeta","Luffy","Zoro","Nami","Sailor Moon","Totoro","Gojo","Yuji Itadori","Tanjiro","Nezuko","Light Yagami","Ryuk","Saitama","Eren","Mikasa","Levi","Deku","All Might","Anya Forger","Dragon Ball"],
};

Object.entries(identityExtras).forEach(([category, items]) => {
  identityCategories[category] = [...new Set([...(identityCategories[category] || []), ...items])];
});

const identityMoreExtras = {
  "Postacie z bajek":["Merida","Mulan","Dżin","Aladyn","Dzwoneczek","Piotruś Pan","Roszpunka","Kopciuszek","Śnieżka","Bella","Bestia","Pinokio","Dumbo","Kłapouchy","Królewna Fiona","Lord Farquaad","Kowalski","Rico","Skipper","Szeregowy"],
  "Postacie z filmów":["Tony Montana","Hannibal Lecter","E.T.","Sherlock Holmes","Dracula","Frankenstein","Godzilla","King Kong","Maverick","Ethan Hunt","Lara Jean","Mia Wallace","Don Corleone","Vito Corleone","Han Solo","Chewbacca","Princess Leia","Obi-Wan Kenobi","Dumbledore","Hagrid"],
  "Postacie z gier":["Donkey Kong","Bowser","Princess Peach","Yoshi","Samus","Mega Man","Solid Snake","Nathan Drake","Aloy","Doom Slayer","Vault Boy","Raiden","Jinx","Teemo","Ahri","Tracer","D.Va","Isaac Clarke","Spyro","Ratchet"],
  "Celebryci i artyści":["Taco Hemingway","Oki","Sobel","Lanek","Bambi","Ralph Kaminski","Krzysztof Zalewski","Podsiadło","Margaret","Vito Bambino","Zendaya","Timothée Chalamet","Tom Holland","Dwayne Johnson","Ryan Reynolds","Emma Watson","Millie Bobby Brown","Olivia Rodrigo","Doja Cat","SZA"],
  "Zwierzęta":["lama","alpaka","szop pracz","jeż","wiewiórka","ryś","łoś","foka","mors","krab","homar","meduza","konik morski","pelikan","tukan","paw","struś","lemur","surikatka","nietoperz"],
  "Zawody":["barber","cukiernik","taksówkarz","motorniczy","maszynista","reżyser","scenarzysta","operator kamery","montażysta","producent muzyczny","DJ","ochroniarz","żołnierz","marynarz","tancerz","kosmetyczka","dietetyk","farmaceuta","tłumacz","informatyk"],
  "Przedmioty":["drukarka","skaner","tablet","mikrofon","kamera","statyw","notes","długopis","ołówek","gumka","linijka","taśma klejąca","nożyczki","młotek","śrubokręt","wiertarka","wiadro","miotła","mop","kosz na śmieci"],
  "Jedzenie":["żurek","barszcz","bigos","gołąbki","placki ziemniaczane","racuchy","oscypek","tiramisu","croissant","bagietka","donut","brownie","cheeseburger","nachosy","quesadilla","curry","pad thai","pho","kimchi","falafel"],
  "Marki":["Tymbark","Wedel","Milka","Kinder","Lay's","Pringles","Oreo","Nesquik","M&M's","Skittles","Tarczyński","Reserved","Cropp","House","Media Expert","Empik","InPost","Orlen","Rossmann","Pepco"],
  "Kraje":["Nowa Zelandia","RPA","Kenia","Tunezja","Algieria","Nigeria","Chile","Peru","Kolumbia","Wenezuela","Kuba","Jamajka","Wietnam","Malezja","Indonezja","Filipiny","Singapur","Arabia Saudyjska","ZEA","Izrael"],
  "Miasta":["Bydgoszcz","Białystok","Gdynia","Częstochowa","Radom","Gliwice","Zabrze","Bielsko-Biała","Olsztyn","Opole","Płock","Kielce","Berno","Zurych","Oslo","Kopenhaga","Helsinki","Dublin","Edynburg","San Francisco"],
  "Memy i internet":["NPC stream","ratio","based","boomer","Karen","backrooms","liminal space","iceberg","deepfake","green screen","reaction video","storytime","unboxing","speedrun","rage quit","lag","AFK","GG EZ","skill issue","fan edit"],
  "Minecraft":["Krowa","Świnia","Owca","Kurczak","Lis","Lama","Handlarz","Fantom","Topielec","Strażnik","Starszy strażnik","Magma cube","Hoglin","Zoglin","Strider","Ravager","Allay","Żaba","Kijanka","Sniffer"],
  "Roblox":["Royale High","Murderers vs Sheriffs","Anime Adventures","Toilet Tower Defense","PLS DONATE","Mocap Dancing","Find the Markers","Nico's Nextbots","A Dusty Trip","Strongman Simulator","Shindo Life","Anime Fighters","King Legacy","Driving Empire","Car Crushers 2","Super Golf","Epic Minigames","Mega Easy Obby","Survive the Killer","Slap Battles"],
  "Twórcy internetowi":["Abstrachuje","Cyber Marian","Planeta Faktów","SciFun","Uwaga Naukowy Bełkot","Historia bez Cenzury","Kolega Ignacy","Klocuch","Generator Frajdy","Fangotten","Człowiek Warga","Hania Es","Maksymalnie","Doknes","Vito i Bella","Natsu","Murcix","Patec","Qesek","Palion"],
  "Gry popularne":["Baldur's Gate 3","Helldivers 2","Palworld","Lethal Company","Phasmophobia","Dead by Daylight","Hades","Hollow Knight","Celeste","Slime Rancher","Sea of Thieves","No Man's Sky","Warframe","Destiny 2","Dota 2","Team Fortress 2","The Forest","Sons of the Forest","It Takes Two","The Crew Motorfest"],
  "Pokémon":["Arceus","Mimikyu","Sylveon","Umbreon","Espeon","Vaporeon","Jolteon","Flareon","Leafeon","Glaceon","Goodra","Garchomp","Rayquaza","Kyogre","Groudon","Lugia","Ho-Oh","Zacian","Zamazenta","Koraidon"],
  "Superbohaterowie":["Moon Knight","Ms. Marvel","She-Hulk","Falcon","Winter Soldier","Punisher","Ghost Rider","Blade","Cyclops","Jean Grey","Storm","Professor X","Magneto","Beast","Raven","Nightwing","Riddler","Penguin","Green Arrow","Constantine"],
  "Filmy i seriale":["Better Call Saul","Peaky Blinders","Sherlock","The Boys","The Mandalorian","Loki","WandaVision","Arcane","Rick i Morty","BoJack Horseman","South Park","Family Guy","Stranger Things 4","Dark","Narcos","Dexter","Lost","Dr House","M jak miłość","Ranczo"],
  "Sport":["Zinedine Zidane","David Beckham","Sergio Ramos","Robert Lewandowski w Barcelonie","Harry Kane","Mohamed Salah","Kevin De Bruyne","Stephen Curry","Kobe Bryant","Shaquille O'Neal","Conor McGregor","Jan Błachowicz","Joanna Jędrzejczyk","Anita Włodarczyk","Bartosz Kurek","Wilfredo Leon","Piotr Żyła","Dawid Kubacki","Fernando Alonso","Valentino Rossi"],
  "Anime i manga":["Itachi","Hinata","Madara","Frieza","Piccolo","Chopper","Sanji","Usopp","Nico Robin","Ichigo","Rukia","Edward Elric","Alphonse Elric","Mikasa Ackerman","Eren Yeager","Armin","Killua","Gon","Hisoka","Sukuna"],
};

Object.entries(identityMoreExtras).forEach(([category, items]) => {
  identityCategories[category] = [...new Set([...(identityCategories[category] || []), ...items])];
});

const minecraftBlockAndItemExtras = [
  "Ziemia","Kamień","Bruk","Trawa","Drewno","Deski","Piasek","Żwir","Glina","Szkło","Obsydian","Bedrock","Netherrack","End Stone","Soul Sand","Glowstone","Prismarine","Latarnia morska","Kwarc","Bazalt","Blackstone","Deepslate","Tuff","Calcite","Miedź","Blok bambusa","Błoto","Cegły błotne","Beton","Terakota","Wełna","Dywan","Drabina","Pochodnia","Latarnia","Ognisko","Biblioteczka","Enchanting Table","Kowadło","Beczka","Lej","Dozownik","Dropper","Observer","Tłok","Lepki tłok","Repeater","Comparator","Dźwignia","Przycisk","Płyta naciskowa","Łóżko","Ender Chest","Shulker Box","Stojak na zbroję","Ramka na przedmiot","Obraz","Doniczka","Kocioł","Statyw alchemiczny","Jukebox","Blok dźwiękowy","Cel","Kilof diamentowy","Miecz diamentowy","Siekiera","Łopata","Motyka","Kusza","Wiadro","Wędka","Kompas","Mapa","Elytra","Perła Endermana","Oko Endera","Mikstura","Trójząb","Maczuga","Pędzel","Luneta","Kozi róg","Zegar","Książka","Zaklęta książka","Nożyce","Krzesiwo","Siodło","Smycz","Name tag","Fajerwerka","Tory","Minecart","Łódka","Jajko smoka","Nether Star","Serce oceanu","Muszla Nautilusa"
];

identityCategories.Minecraft = [...new Set([...identityCategories.Minecraft, ...minecraftBlockAndItemExtras])];

const identityRoomExtras = {
  "Postacie z bajek":["Królik z Alicji","Chudy","Buzz Astral","Mike Wazowski","Sulley","Maui","Miguel z Coco","Merlin","Robin Hood","Krecik"],
  "Postacie z filmów":["Shang-Chi","Oppenheimer","Neo z Matrixa","Morpheus","John Rambo","Forrest Gump","Ace Ventura","Beetlejuice","Maximus","Willy Wonka"],
  "Postacie z gier":["Bayonetta","Kiryu Kazuma","Duke Nukem","GLaDOS","Chell","Pyramid Head","Steve Harrington w grze","Agent 47","Aiden Pearce","Vaas"],
  "Celebryci i artyści":["Daria Zawiałow","Kaśka Sochacka","Tymek","Malik Montana","Mrozu","Kizo","Sarsa","Tate McRae","Billie Joe Armstrong","Travis Scott"],
  "Przedmioty":["router","pendrive","karta pamięci","klucz francuski","latarka czołowa","taśma miernicza","zszywacz","dziurkacz","podkładka pod mysz","mata do ćwiczeń"],
  "Jedzenie":["onigiri","bao","gyoza","mochi","pudding","budyń","kisiel","granola","owsianka","wrap"],
  "Memy i internet":["delulu","sigma edit","NPC live","rage bait","corecore","fan cam","iceberg video","tierlista","drama alert","clout"],
  "Minecraft":["Copper Golem","Armadillo","Vault","Trial Spawner","Breeze","Crafter","Heavy Core","Wind Charge","Bogged","Mace"],
  "Roblox":["Pressure","Dress to Impress judge","Anime Defenders","Anime Last Stand","Type Soul","Bloxburg","Meme Sea","Rivals","Gunfight Arena","The Strongest Battlegrounds"],
  "Gry popularne":["Balatro","Content Warning","Buckshot Roulette","Manor Lords","Hades II","Alan Wake 2","Elden Ring","Dark Souls","Resident Evil","Tekken"],
  "Filmy i seriale":["The Last of Us","Fallout","House of the Dragon","The Bear","Suits","Gambit królowej","Umbrella Academy","Cobra Kai","Wiedźmin Netflix","Ahsoka"]
};
Object.entries(identityRoomExtras).forEach(([category, items]) => {
  identityCategories[category] = [...new Set([...(identityCategories[category] || []), ...items])];
});

export const identityCategoryNames=Object.keys(identityCategories);
