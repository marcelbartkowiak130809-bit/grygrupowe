const list = text => text.split("|").map(item => item.trim()).filter(Boolean);
const task = (id, prompt, answers) => [id, prompt, list(answers)];

// Konkretne pytania z osobnymi pulami. Szerokie pytanie bazowe dla każdej
// kategorii nadal powstaje w categories.js.
export const specificTasks = {
  animals:[
    task("animals_large","Wymień duże zwierzęta","słoń|żyrafa|nosorożec|hipopotam|wieloryb|orka|rekin|niedźwiedź|niedźwiedź polarny|lew|tygrys|gepard|pantera|jaguar|puma|goryl|orangutan|szympans|koń|krowa|żubr|łoś|jeleń|dzik|wielbłąd|lama|alpaka|kangur|krokodyl|aligator|waran|struś|emu|pelikan|flaming|foka|mors|słoń morski|manat|delfin|tuńczyk|marlin|manta|ośmiornica|kałamarnica|pyton|anakonda|zebra|bawół|antylopa|renifer|osioł|muł|hiena|wilk"),
    task("animals_small","Wymień małe zwierzęta","mysz|szczur|chomik|świnka morska|koszatniczka|myszoskoczek|wiewiórka|jeż|kret|ryjówka|łasica|fretka|królik|zając|nietoperz|żaba|ropucha|traszka|jaszczurka|gekko|kameleon|rybka|gupik|danio|neon|biedronka|mrówka|pszczoła|osa|trzmiel|motyl|ćma|komar|mucha|ważka|chrząszcz|konik polny|świerszcz|karaluch|modliszka|patyczak|pająk|skorpion|kleszcz|ślimak|dżdżownica|stonoga|krab|krewetka|wróbel|sikorka|koliber|kanarek|papużka falista"),
    task("animals_water","Wymień zwierzęta wodne","rekin|delfin|wieloryb|orka|foka|mors|słoń morski|manat|wydra morska|ośmiornica|kałamarnica|meduza|krab|homar|krewetka|langusta|rozgwiazda|konik morski|manta|płaszczka|węgorz|tuńczyk|łosoś|dorsz|śledź|makrela|karp|szczupak|sum|okoń|pstrąg|sandacz|pirania|błazenek|miecznik|marlin|murena|żółw morski|krokodyl|aligator|pingwin|pelikan|mewa|bóbr|wydra|żaba|ropucha|aksolotl|gupik|bocja|danio"),
    task("animals_birds","Wymień ptaki","orzeł|sokół|jastrząb|sowa|puchacz|wróbel|sikorka|gołąb|kruk|wrona|kawka|gawron|sroka|bocian|czapla|żuraw|mewa|pelikan|flaming|papuga|ara|kakadu|kanarek|koliber|dzięcioł|kukułka|jaskółka|jerzyk|drozd|gil|bażant|paw|kura|kogut|kaczka|gęś|indyk|przepiórka|struś|emu|pingwin|albatros|tukan|sęp|bielik|łabędź|nandu|rybitwa"),
    task("animals_farm","Wymień zwierzęta gospodarskie lub domowe","pies|kot|koń|kucyk|krowa|byk|cielak|świnia|prosiak|owca|baran|jagnię|koza|kura|kogut|kurczak|kaczka|gęś|indyk|królik|chomik|świnka morska|fretka|papuga|kanarek|rybka|żółw|jaszczurka|alpaka|lama|osioł"),
    task("animals_insects","Wymień owady lub pajęczaki","mrówka|pszczoła|osa|szerszeń|trzmiel|motyl|ćma|komar|mucha|meszka|ważka|biedronka|chrząszcz|żuk|stonka|konik polny|świerszcz|karaluch|modliszka|patyczak|pchła|wesz|pluskwa|termita|szarańcza|skorek|pająk|tarantula|skorpion|kleszcz|roztocz|kosarz"),
  ],
  fruits:[
    task("fruits_citrus","Wymień cytrusy","pomarańcza|mandarynka|cytryna|limonka|grejpfrut|pomelo|klementynka|kumkwat|bergamotka|cytron|tangelo|ugli|limonka kaffir|limonka perska|pomarańcza sewilska|pomarańcza valencia|pomarańcza navel"),
    task("fruits_berries","Wymień owoce jagodowe lub leśne","truskawka|malina|borówka|jagoda|jeżyna|porzeczka|agrest|żurawina|poziomka|aronia|morwa|malina żółta|czarna malina|malina moroszka|jagoda acai|jagoda maqui|jagoda haskap|boysenberry|josta|poziomka leśna|truskawka biała"),
    task("fruits_exotic","Wymień egzotyczne owoce","ananas|mango|papaja|kokos|awokado|marakuja|liczi|pitaja|smoczy owoc|durian|rambutan|karambola|gujawa|jackfruit|chlebowiec|persymona|kaki|kumkwat|opuncja|tamarillo|acerola|granadilla|cherimoya|noni|pepino|ręka buddy|ambarella|bilimbi|bael|mamey"),
    task("fruits_orchard","Wymień owoce rosnące w sadzie","jabłko|gruszka|śliwka|wiśnia|czereśnia|morela|brzoskwinia|nektarynka|mirabelka|renkloda|pigwa|jabłko gala|jabłko golden|jabłko granny smith|jabłko fuji|jabłko idared|jabłko lobo|śliwka japońska|śliwka kalifornijska"),
  ],
  school:[
    task("school_subjects","Wymień przedmioty szkolne","matematyka|język polski|polski|angielski|język angielski|niemiecki|język niemiecki|hiszpański|język hiszpański|francuski|język francuski|historia|geografia|biologia|chemia|fizyka|informatyka|wos|wiedza o społeczeństwie|edb|edukacja dla bezpieczeństwa|wf|wychowanie fizyczne|religia|etyka|plastyka|muzyka|technika|przyroda|podstawy przedsiębiorczości|biznes i zarządzanie|filozofia|łacina"),
    task("school_supplies","Wymień przybory szkolne","zeszyt|podręcznik|ćwiczenia|długopis|pióro|ołówek|gumka|temperówka|linijka|ekierka|kątomierz|cyrkiel|plecak|piórnik|marker|zakreślacz|kredka|mazak|farby|pędzel|blok rysunkowy|brystol|kolorowy papier|nożyczki|klej|taśma|korektor|teczka|segregator|spinacz|zszywacz|kalkulator|kompas|papier milimetrowy|zeszyt w kratkę|zeszyt w linie"),
    task("school_places","Wymień miejsca, które można znaleźć w szkole","sala lekcyjna|klasa|korytarz|szatnia|biblioteka|stołówka|sekretariat|gabinet dyrektora|pokój nauczycielski|sala gimnastyczna|boisko|toaleta|pracownia komputerowa|pracownia chemiczna|świetlica|aula|hala sportowa|basen|parking|plac zabaw|sklepik szkolny|portiernia|schody|winda|piwnica|magazyn|laboratorium"),
    task("chemical_elements","Wymień pierwiastki chemiczne","wodór|hel|lit|beryl|bor|węgiel|azot|tlen|fluor|neon|sód|magnez|glin|krzem|fosfor|siarka|chlor|argon|potas|wapń|skand|tytan|wanad|chrom|mangan|żelazo|kobalt|nikiel|miedź|cynk|gal|german|arsen|selen|brom|krypton|rubid|stront|itr|cyrkon|niob|molibden|technet|ruten|rod|pallad|srebro|kadm|ind|cyna|antymon|tellur|jod|ksenon|cez|bar|lantan|cer|prazeodym|neodym|promet|samar|europ|gadolin|terb|dysproz|holm|erb|tul|iterb|lutet|hafn|tantal|wolfram|ren|osm|iryd|platyna|złoto|rtęć|tal|ołów|bizmut|polon|astat|radon|frans|rad|aktyn|tor|protaktyn|uran|neptun|pluton|ameryk|kiur|berkel|kaliforn|einstein|ferm|mendelew|nobel|lorens|rutherford|dubn|seaborg|bohr|has|meitner|darmsztadt|rentgen|kopernik|nihon|flerow|moskow|liwermor|tenes|oganeson"),
  ],
  pokemon:[
    task("pokemon_starters","Wymień Pokémony starterowe lub ich ewolucje","bulbasaur|ivysaur|venusaur|charmander|charmeleon|charizard|squirtle|wartortle|blastoise|chikorita|bayleef|meganium|cyndaquil|quilava|typhlosion|totodile|croconaw|feraligatr|treecko|grovyle|sceptile|torchic|combusken|blaziken|mudkip|marshtomp|swampert|turtwig|grotle|torterra|chimchar|monferno|infernape|piplup|prinplup|empoleon|snivy|servine|serperior|tepig|pignite|emboar|oshawott|dewott|samurott|chespin|quilladin|chesnaught|fennekin|braixen|delphox|froakie|frogadier|greninja|rowlet|dartrix|decidueye|litten|torracat|incineroar|popplio|brionne|primarina|grookey|thwackey|rillaboom|scorbunny|raboot|cinderace|sobble|drizzile|inteleon|sprigatito|floragato|meowscarada|fuecoco|crocalor|skeledirge|quaxly|quaxwell|quaquaval"),
    task("pokemon_legendary","Wymień legendarne lub mityczne Pokémony","articuno|zapdos|moltres|mewtwo|mew|raikou|entei|suicune|lugia|ho-oh|celebi|regirock|regice|registeel|latias|latios|kyogre|groudon|rayquaza|jirachi|deoxys|uxie|mesprit|azelf|dialga|palkia|heatran|regigigas|giratina|cresselia|phione|manaphy|darkrai|shaymin|arceus|victini|cobalion|terrakion|virizion|tornadus|thundurus|reshiram|zekrom|landorus|kyurem|keldeo|meloetta|genesect|xerneas|yveltal|zygarde|diancie|hoopa|volcanion|tapu-koko|tapu-lele|tapu-bulu|tapu-fini|cosmog|cosmoem|solgaleo|lunala|necrozma|magearna|marshadow|zeraora|meltan|melmetal|zacian|zamazenta|eternatus|kubfu|urshifu|zarude|regieleki|regidrago|glastrier|spectrier|calyrex|enamorus|wo-chien|chien-pao|ting-lu|chi-yu|koraidon|miraidon|walking-wake|iron-leaves|ogerpon|terapagos|pecharunt"),
    task("pokemon_gen1","Wymień Pokémony z pierwszej generacji","bulbasaur|ivysaur|venusaur|charmander|charmeleon|charizard|squirtle|wartortle|blastoise|caterpie|metapod|butterfree|weedle|kakuna|beedrill|pidgey|pidgeotto|pidgeot|rattata|raticate|spearow|fearow|ekans|arbok|pikachu|raichu|sandshrew|sandslash|nidoran|nidorina|nidoqueen|nidorino|nidoking|clefairy|clefable|vulpix|ninetales|jigglypuff|wigglytuff|zubat|golbat|oddish|gloom|vileplume|paras|parasect|venonat|venomoth|diglett|dugtrio|meowth|persian|psyduck|golduck|mankey|primeape|growlithe|arcanine|poliwag|poliwhirl|poliwrath|abra|kadabra|alakazam|machop|machoke|machamp|bellsprout|weepinbell|victreebel|tentacool|tentacruel|geodude|graveler|golem|ponyta|rapidash|slowpoke|slowbro|magnemite|magneton|farfetchd|doduo|dodrio|seel|dewgong|grimer|muk|shellder|cloyster|gastly|haunter|gengar|onix|drowzee|hypno|krabby|kingler|voltorb|electrode|exeggcute|exeggutor|cubone|marowak|hitmonlee|hitmonchan|lickitung|koffing|weezing|rhyhorn|rhydon|chansey|tangela|kangaskhan|horsea|seadra|goldeen|seaking|staryu|starmie|mr-mime|scyther|jynx|electabuzz|magmar|pinsir|tauros|magikarp|gyarados|lapras|ditto|eevee|vaporeon|jolteon|flareon|porygon|omanyte|omastar|kabuto|kabutops|aerodactyl|snorlax|articuno|zapdos|moltres|dratini|dragonair|dragonite|mewtwo|mew"),
    task("pokemon_eevee","Wymień ewolucje Eevee","vaporeon|jolteon|flareon|espeon|umbreon|leafeon|glaceon|sylveon"),
  ],
  minecraft:[
    task("minecraft_mobs","Wymień moby z Minecrafta","creeper|zombie|zombiak|skeleton|szkielet|spider|pająk|cave spider|pająk jaskiniowy|enderman|witch|wiedźma|slime|szlam|ghast|blaze|płomyk|piglin|hoglin|warden|nadzorca|villager|wieśniak|iron golem|żelazny golem|snow golem|bałwan|śnieżny golem|sheep|owca|cow|krowa|pig|świnia|chicken|kurczak|wolf|wilk|cat|kot|horse|koń|donkey|osioł|mule|muł|llama|lama|bee|pszczoła|fox|lis|frog|żaba|tadpole|kijanka|axolotl|aksolotl|dolphin|delfin|guardian|strażnik|elder guardian|prastrażnik|starszy strażnik|shulker|phantom|fantom|drowned|utopiec|pillager|rabieżca|evoker|przywoływacz|ravager|dewastator|niszczyciel|endermite|silverfish|rybik cukrowy|magma cube|kostka magmy|wither skeleton|mroczny szkielet|zombified piglin|zombifikowany piglin|breeze|wicher|bogged|bagniak|camel|wielbłąd|sniffer|wąchacz|allay|goat|koza|panda|polar bear|niedźwiedź polarny|parrot|papuga|rabbit|królik|ocelot|strider|zoglin|vex|vindicator|wandering trader|wędrowny handlarz|trader llama|lama handlarza|mooshroom|grzybowa krowa|ender dragon|smok endu|enderdragon|wither|bat|nietoperz|squid|kałamarnica|glow squid|świecąca kałamarnica|turtle|żółw|salmon|łosoś|cod fish|dorsz|pufferfish|rozdymka|tropical fish|ryba tropikalna|husk|posuch|stray|tułacz|armadillo|pancernik|creaking|happy ghast|ghastling|zombie villager|skeleton horse|zombie horse|spider jockey|chicken jockey|illusioner"),
    task("minecraft_blocks","Wymień bloki lub surowce z Minecrafta","ziemia|trawa|kamień|bruk|drewno|deski|szkło|piasek|żwir|obsydian|bedrock|diament|węgiel|żelazo|złoto|redstone|lapis|szmaragd|netherrack|soul sand|end stone|wełna|glina|cegły|beton|terakota|miedź|deepslate|sculk|calcite|tuff|bazalt|blackstone|glowstone|kwarc|prismarine|sea lantern|copper bulb|bamboo block|mud|packed mud|mud bricks"),
    task("minecraft_items","Wymień przedmioty z Minecrafta","kilof|miecz|łopata|siekiera|motyka|łuk|kusza|tarcza|wiadro|wędka|pochodnia|kompas|mapa|łóżko|elitra|totem|perła endermana|oko endera|mikstura|trójząb|mace|maczuga|brush|pędzel|bundle|spyglass|luneta|goat horn|kozi róg|recovery compass|clock|zegar|book|książka|enchanted book|zaklęta książka|shears|nożyce|flint and steel|krzesiwo"),
    task("minecraft_structures","Wymień struktury lub miejsca z Minecrafta","village|wioska|ancient city|bastion|bastion remnant|desert temple|dżunglowa świątynia|jungle temple|leśna posiadłość|woodland mansion|nether fortress|ocean monument|ocean ruins|pillager outpost|ruined portal|shipwreck|stronghold|trial chambers|witch hut|igloo|mineshaft|kopalnia|end city|jaskinia|amethyst geode|nether|end|overworld"),
  ],
  food:[
    task("food_polish","Wymień polskie potrawy","pierogi|rosół|pomidorowa|schabowy|gołąbki|bigos|żurek|barszcz|ogórkowa|krupnik|kotlet mielony|kotlet de volaille|kopytka|placki ziemniaczane|naleśniki|kluski śląskie|racuchy|fasolka po bretońsku|kapuśniak|chłodnik|zupa grzybowa|zupa szczawiowa|zupa jarzynowa|flaki|kaszanka|kiełbasa|oscypek|mizeria|sałatka jarzynowa|makowiec|sernik|szarlotka|pączek|drożdżówka|kremówka"),
    task("food_fast","Wymień fast foody","pizza|kebab|burger|hamburger|frytki|hot dog|zapiekanka|tortilla|tacos|burrito|nachos|nuggetsy|skrzydełka|hot wings|kebab rollo|doner kebab|cheeseburger|wrap|panini|frytki belgijskie|pizza pepperoni|pulled pork|fish and chips"),
    task("food_sweets","Wymień słodycze lub desery","lody|czekolada|sernik|szarlotka|pączek|drożdżówka|gofry|budyń|galaretka|popcorn|baton|ciastko|babeczka|beza|tort|kremówka|chałwa|cheesecake|churros|cynamonka|mochi|marcepan|pancakes|tarta|tort bezowy|cukierek|lizak|żelki|ptasie mleczko|piernik|makowiec"),
  ],
  tech:[
    task("tech_devices","Wymień urządzenia elektroniczne","komputer|laptop|telefon|smartfon|tablet|monitor|klawiatura|mysz|słuchawki|mikrofon|głośnik|kamera|drukarka|router|modem|konsola|playstation|xbox|nintendo switch|steam deck|powerbank|ładowarka|pendrive|smartwatch|telewizor|projektor|dron|robot|drukarka 3d|czytnik ebooków|kindle|radio|odtwarzacz mp3|aparat|kamera sportowa"),
    task("tech_systems","Wymień systemy operacyjne, języki lub programy","windows|linux|android|ios|macos|ubuntu|chrome os|html|css|javascript|typescript|python|php|sql|c++|java|visual studio code|vscode|excel|powerpoint|word|office|photoshop|docker|wordpress|unity|unreal engine|firefox|google chrome|safari|obs|notion|slack"),
  ],
  creators:[
    task("creators_polish","Wymień polskich youtuberów lub streamerów","friz|rezi|rezigiusz|blowek|stuu|gimper|izak|izakooo|poczciwy krzychu|mandzio|disowskyy|dealereq|tromba|wersow|mortalcio|karol paciorek|naruciak|wardęga|boxdel|multi|young multi|nitro|rembol|vertez|skkf|eleven|mietczynski|kacper porębski|rojson|remek|kamerzysta|marcin dubiel|mini majk|natsu|fagata|genzie|ekipa|rafonix|kasix|pago|xayoo|ewron|pasha|saju|kubon|wojan|palion|doknes|enzzi|eniuu|yoshi|gilathissnew|fairout|safemodtv|kaluch|noobek|tivolt|kiszak|isamu|lachu|sitrox|czuux|sheo|karolek|rock alone|vito minecraft|przemek best games|matura to bzdura|historia bez cenzury|naukowy bełkot|scifun|tvgry|nrgeek|quaz"),
    task("creators_world","Wymień zagranicznych youtuberów lub streamerów","mrbeast|pewdiepie|markiplier|jacksepticeye|ishowspeed|kai cenat|dream|georgenotfound|tommyinnit|dantdm|preston|lazarbeam|ninja|pokimane|xqc|ksi|logan paul|jake paul|sidemen|technoblade|aphmau|sssniperwolf|sapnap|tubbo|ranboo|stampy|captainsparklez|caseoh|adin ross|asmongold|ludwig|moistcr1tikal|sykkuno|quackity|dude perfect|ryan trahan|mark rober|linus tech tips|mkbhd|mrwhosetheboss|flamingo|kreekcraft|unspeakable|grian|mumbo jumbo|xisumavoid|goodtimeswithscar"),
  ],
  internet:[
    task("internet_social","Wymień serwisy społecznościowe lub komunikatory","facebook|instagram|tiktok|youtube|discord|messenger|whatsapp|snapchat|reddit|twitch|x|twitter|telegram|pinterest|linkedin|threads|signal|bereal|tumblr|wykop|gadu-gadu|gg|teamspeak|skype|meet|google meet|zoom|teams|facetime"),
    task("internet_shopping","Wymień sklepy internetowe lub aplikacje zakupowe","allegro|olx|amazon|temu|shein|vinted|ebay|etsy|zalando|aliexpress|booking|airbnb|pyszne|glovo|uber eats|paypal|revolut|shopify|groupon|facebook marketplace"),
    task("internet_memes","Wymień popularne memy internetowe","doge|cheems|pepe|pepe the frog|wojak|trollface|troll face|rage guy|forever alone|success kid|bad luck brian|nyan cat|keyboard cat|grumpy cat|rickroll|rick roll|harlem shake|gangnam style|coffin dance|stonks|not stonks|gigachad|giga chad|sigma|sigma male|sigma boy|chad|virgin vs chad|distracted boyfriend|drake hotline bling|woman yelling at cat|surprised pikachu|this is fine|hide the pain harold|disaster girl|salt bae|blinking white guy|galaxy brain|expanding brain|change my mind|two buttons|gru plan|uno draw 25|is this a pigeon|always has been|they don't know|trade offer|press f|f in the chat|among us|amogus|sus|impostor|noot noot|pogchamp|pog|kappa|pepega|monkas|bing chilling|uncanny mr incredible|quandale dingle|grimace shake|skibidi toilet|skibidi|ohio|rizz|gyatt|fanum tax|mewing|looksmaxxing|mogging|aura|aura points|negative aura|aura farming|pacu jalur|indonesian boat racing kid|aura farming kid|npc live|npc stream|hawk tuah|brat summer|chill guy|just a chill guy|low taper fade|italian brainrot|brainrot|tralalero tralala|tralalero tralalá|bombardiro crocodilo|ballerina cappuccina|ballerina cappuccino|cappuccino assassino|lirili larila|brr brr patapim|tung tung tung sahur|tung tung sahur|triple t|boneca ambalabu|chimpanzini bananini|bombardini gusini|chicken jockey|flint and steel|i am steve|the nether|100 men vs 1 gorilla|100 men vs. 1 gorilla|100 ludzi kontra goryl|67|6-7|six seven|67 kid|mason 67|scp-067|nosacz|nosacz sundajski|somsiad|panie areczku|paweł jumper|pawel jumper|ale urwał|ale urwal|forfiter|co ja pacze|chytra baba z radomia|jestem hardkorem|mięsny jeż|miesny jez|bober|bober kurwa|janusz|typowy janusz|mirek handlarz|złodziej czasu|heheszki"),
    task("internet_brainrots","Wymień brainroty albo Italian brainroty","noobini pizzanini|lirili larila|lirilì larilà|tim cheese|fluriflura|talpa di fero|noobini santanini|svinina bombardino|pipi kiwi|tartaragno|pipi corni|holy arepa|trippi troppi|gangster footera|bandito bobritto|boneca ambalabu|cacto hipopotamo|ta ta ta ta sahur|tric trac baraboom|frogo elfo|pipi avocado|pengolino nuvoletto|pinealotto fruttarino|cappuccino assassino|bandito axolito|brr brr patapim|avocadini antilopini|trulimero trulicina|bambini crostini|malame amarele|bananita dolphinita|perochello lemonchello|brri brri bicus dicus bombicus|avocadini guffo|ti ti ti sahur|mangolini parrocini|frogato pirato|gato celesto|salamino penguino|doi doi do|penguin tree|wombo rollo|penguino cocosino|mummio rappitto|chimpanzini bananini|tirilikalika tirilikalako|ballerina cappuccina|burbaloni loliloli|chef crabracadabra|lionel cactuseli|glorbo fruttodrillo|quivoli ameleoni|blueberrinni octopusini|caramello filtrello|pipi potato|strawberrelli flamingelli|cocosini mama|pandaccini bananini|quackula|pi pi watermelon|signore carapace|buho del cielo|sigma boy|chocco bunny|puffaball|sigma girl|sealo regalo|buho de fuego|seraphino gruyero|frigo camelo|orangutini ananassini|rhino toasterino|bombardiro crocodilo|spioniro golubiro|bombombini gusini|zibra zubra zibralini|tigrilini watermelini|avocadorilla|mythic lucky block|cavallo virtuoso|gorillo subwoofero|gorillo watermelondrillo|stoppo luminino|ganganzelli trulala|tob tobi tobi|lerulerulerule|te te te sahur|rhino helicopterino|magi ribbitini|tracoducotulu delapeladustuz|jingle jingle sahur|los noobinis|spongini quackini|cachorrito melonito|carloo|harpuccino|elefanto frigo|carrotini brainini|centrucci nuclucci|toiletto focaccino|jacko spaventosa|bananito bandito|tree tree tree sahur|fizzy soda|berenjello angello|cocofanto elefanto|antonio|girafa celestre|gattatino neonino|gattatino nyanino|chihuanini taconini|matteo|tralalero tralala|los crocodillitos|tigroligre frutonni|odin din din dun|money money man|alessio|statutino libertino|tipi topi taco|unclito samito|tralalita tralala|tukanno bananno|vampira cappucina|espresso signora|orcalero orcala|jacko jack jack|urubini flamenguini|trippi troppi troppa trippa|capi taco|divino platypio|los chihuaninis|gattito tacoto|las capuchinas|bulbito bandito traktorito|ballerino lololo|los tungtungtungcitos|ballerina peppermintina|pakrahmatmamat|brr es teh patipum|piccione macchina|los bombinitos|tractoro dinosauro|los orcalitos|cacasito satalito|orcalita orcala|corn corn corn sahur|mummy ambalabu|snailenzo|squalanana|tartaruga cisterna|ginger globo|yeti claus|crabbo limonetta|granchiello spiritell|los tipi tacos|frio ninja|boba panda|piccionetta macchina|bambu bambu sahur|los gattitos|mastodontico telepiedone|astrolero cervalero|anpali babel|luv luv luv|cappuccino clownino|bombardini tortinii|brasilini berimbini|patteo|beluga beluga|krupuk pagi pagi|skull skull skull|cocoa assassino|tentacolo tecnico|ginger cisterna|pandanini frostini|dolphini jetskini|pop pop sahur|noo la polizia|dumborino miracello|la vacca saturno saturnita|bisonte giuppitere|sammyni spyderini|blackhole goat|jackorilla|agarrini la palini|chachechi|chimpanzini spiderini|los matteos|los tortus|los tralaleritos|la cucaracha|vulturino skeletono|boatito auratito|torrtuginni dragonfrutini|los spyderinis|extinct tralalero|fragola la la la|zombie tralala|guerriro digitale|las tralaleritas|la karkerkar combinasion|la vacca prese presente|reindeer tralala|pumpkini spyderini|los trios|frankentteo|job job job sahur|karker sahur|las vaquitas saturnitas|los karkeritos|santteo|fishboard|triplito tralaleritos|paradiso axolottino|trickolino|goat|giftini spyderini|love love love sahur|graipuss medussi|perrito burrito|tung tung tung sahur|la sahur combinasion|list list list sahur|telemorte|to to to sahur|pirulitoita bicicleteira|chicleteira bicicleteira|brunito marsito|quesadillo vampiro|burrito bandito|chill puppy|los quesadillas|arcadopus|serafinna medusella|la grande combinasion|guest 666|rang ring bus|los mi gatitos|los chicleteiras|67|donkeyturbo express|los burritos|mariachi corazoni|swag soda|nuclearo dinossauro|dj panda|las sis|los bros|celularcini viciosini|gobblino uniciclino|cigno fulgoro|tralaledon|esok sekolah|la jolly grande|eviledon|orcaledon|rossetti tualetti|spaghetti tualetti|ventoliero pavonero|sammyni fattini|hokka horloge|spooky and pumpky|lavadorito spinito|la food combinasion|la casa boo|los amigos|dragon cannelloni|hydra dragon cannelloni|griffin|cerberus|celestial pegasus"),
  ],
  brands:[
    task("brands_clothing","Wymień marki odzieżowe lub obuwnicze","nike|adidas|puma|reebok|new balance|vans|converse|zara|h&m|reserved|cropp|house|bershka|pull&bear|stradivarius|uniqlo|calzedonia|intimissimi|victoria's secret|under armour|the north face|columbia|patagonia|timberland|dr martens|crocs|birkenstock|skechers|asics|mizuno|umbro|fila|champion|supreme|off-white|carhartt|lacoste|gucci|dior|chanel|versace"),
    task("brands_tech","Wymień marki technologiczne","apple|samsung|xiaomi|sony|lg|lenovo|asus|acer|hp|dell|huawei|motorola|nokia|microsoft|google|intel|amd|nvidia|razer|logitech|corsair|steelseries|hyperx|msi|gigabyte|jbl|bose|marshall|anker|garmin|gopro|canon|nikon|fujifilm|adobe"),
  ],
  cities:[
    task("cities_capitals","Wymień stolice państw","warszawa|berlin|paryż|madryt|lizbona|rzym|praga|wiedeń|bratysława|budapeszt|bukareszt|sofia|ateny|belgrad|zagrzeb|sarajewo|podgorica|tirana|skopje|lublana|kijów|wilno|ryga|tallinn|helsinki|sztokholm|oslo|kopenhaga|reykjavik|dublin|londyn|moskwa|ankara|waszyngton|ottawa|meksyk|hawana|panama|lima|quito|caracas|santiago|buenos aires|montevideo|brasilia|tokio|seul|pekin|bangkok|hanoi|singapur|kuala lumpur|dżakarta|delhi|islamabad|katmandu|abu zabi|doha|rijad|amman|bejrut|teheran|bagdad|kair|tunis|algier|dakar|akra|abuja|nairobi|addis abeba|pretoria|canberra|wellington"),
  ],
  sport:[
    task("sport_disciplines","Wymień dyscypliny sportowe","piłka nożna|koszykówka|siatkówka|tenis|pływanie|bieganie|lekkoatletyka|skoki narciarskie|narciarstwo|snowboard|boks|mma|judo|karate|gimnastyka|hokej|golf|rugby|kolarstwo|wspinaczka|surfing|badminton|tenis stołowy|ping pong|piłka ręczna|baseball|futbol amerykański|krykiet|szachy|esport|łyżwiarstwo|kajakarstwo|wioślarstwo|żeglarstwo|triathlon|maraton|formuła 1|rajdy|motocross|skateboarding|jazda konna|strzelectwo|łucznictwo|szermierka|zapasy|kickboxing|taekwondo|curling|biathlon|parkour|squash|dart|bilard|padel"),
    task("sport_clubs","Wymień kluby piłkarskie","real madryt|barcelona|arsenal|chelsea|liverpool|manchester city|manchester united|juventus|inter mediolan|ac milan|bayern monachium|psg|legia warszawa|lech poznań|wisła kraków|widzew łódź|raków częstochowa|jagiellonia białystok|borussia dortmund|ajax|fc porto|benfica|sporting|atletico madryt|tottenham|newcastle|roma|lazio|napoli|atalanta|sevilla|valencia|monaco|lyon|marsylia|celtic|rangers"),
  ],
  music:[
    task("music_instruments","Wymień instrumenty muzyczne","gitara|gitara elektryczna|gitara basowa|bas|pianino|fortepian|keyboard|syntezator|perkusja|skrzypce|altówka|wiolonczela|kontrabas|flet|saksofon|trąbka|puzon|tuba|klarnet|obój|fagot|harfa|ukulele|akordeon|harmonijka|tamburyn|marakasy|ksylofon|dzwonki|bęben|banjo|mandolina|lutnia|organy|kalimba"),
    task("music_genres","Wymień gatunki muzyczne","pop|rock|rap|hip hop|metal|jazz|blues|reggae|disco polo|elektroniczna|techno|house|klasyczna|country|indie|k-pop|folk|punk|trap|drill|r&b|soul|funk|disco|dubstep|hardstyle|ambient|lofi|dance|edm|reggaeton|latino|opera|musical"),
  ],
  movies:[
    task("movies_animated","Wymień filmy animowane lub bajki","shrek|król lew|the lion king|toy story|auta|cars|kraina lodu|frozen|minionki|despicable me|kung fu panda|madagaskar|jak wytresować smoka|how to train your dragon|gravity falls|wodogrzmoty małe|pora na przygodę|adventure time|regular show|gumball|fineasz i ferb|rick and morty|simpsonowie|the simpsons|pokemon|digimon|avatar legenda aanga|avatar the last airbender|korra|sailor moon|disenchantment|futurama|bojack horseman|spider-man uniwersum|spider-man into the spider-verse|vaiana|moana|encanto|coco|ratatuj|ratatouille|wall-e|odlot|up|potwory i spółka|monsters inc|gdzie jest nemo|finding nemo|iniemamocni|the incredibles|zaplątani|tangled|zwierzogród|zootopia|epoka lodowcowa|ice age|hotel transylwania|hotel transylvania|jak ukraść księżyc|minions|megamocny|megamind|w głowie się nie mieści|inside out|co w duszy gra|soul|czerwony|turning red|merida waleczna|brave|kubo i dwie struny|kubo and the two strings|mitchellowie kontra maszyny|the mitchells vs the machines|lilo i stitch|lilo and stitch|aladyn|aladdin|piękna i bestia|beauty and the beast|mała syrenka|the little mermaid|mulan|tarzan|bambi|pinokio|pinocchio|dumbo|garfield|psi patrol|paw patrol|spongebob|sponge bob|spongebob kanciastoporty"),
    task("movies_series","Wymień seriale aktorskie","stranger things|breaking bad|better call saul|wednesday|the office|biuro|friends|przyjaciele|game of thrones|gra o tron|the witcher|wiedźmin|squid game|black mirror|czarne lustro|peaky blinders|money heist|la casa de papel|dom z papieru|narcos|dark|chernobyl|the walking dead|żywe trupy|cobra kai|lucifer|dexter|house|dr house|sherlock|the boys|fallout|the bear|shogun|house of the dragon|ród smoka|arrow|flash|gotham|titans|sex education|riverdale|outer banks|you|ozark|mindhunter|true detective|fargo|succession|sukcesja|modern family|brooklyn nine-nine|how i met your mother|jak poznałem waszą matkę|the big bang theory|teoria wielkiego podrywu|grey's anatomy|anatomia greya|the handmaid's tale|opowieść podręcznej|lost|zagubieni|prison break|desperate housewives|gotowe na wszystko|house of cards|the crown|bridgertonowie|euphoria|elite|the last of us|yellowstone|the white lotus|community|parks and recreation|seinfeld|supernatural|vikings|mr robot|hannibal|the mandalorian|andor|loki|daredevil|the punisher|jessica jones|moon knight|umbrella academy|sandman|one piece|anne with an e|american horror story|the gentlemen|rings of power|pierścienie władzy"),
    task("movies_films","Wymień filmy fabularne","harry potter|star wars|gwiezdne wojny|the lord of the rings|władca pierścieni|hobbit|pirates of the caribbean|piraci z karaibów|avatar|titanic|tytanic|matrix|john wick|james bond|jurassic park|jurassic world|transformers|mission impossible|fast and furious|szybcy i wściekli|deadpool|iron man|thor|hulk|kapitan ameryka|captain america|guardians of the galaxy|strażnicy galaktyki|joker|batman|superman|aquaman|spider-man|avengers|infinity war|endgame|doctor strange|black panther|czarna pantera|ant-man|venom|x-men|top gun|dune|diuna|interstellar|inception|incepcja|oppenheimer|barbie|the godfather|ojciec chrzestny|alien|obcy|predator|back to the future|powrót do przyszłości|the hunger games|igrzyska śmierci|fantastic beasts|fantastyczne zwierzęta|the green mile|zielona mila|the wolf of wall street|wilk z wall street|forrest gump|fight club|gladiator|green book|arrival|blade runner|casino royale|ghostbusters|godzilla|jumanji|karate kid|nietykalni|the intouchables|borat|american pie|kiler|chłopaki nie płaczą|asterix i obelix|conjuring|obecność|it|to|klątwa|smile|furiosa|dunkierka|cruella|sonic|ricky stanicky|poor things|saltburn"),
  ],
  vegetables:[
    task("vegetables_root","Wymień warzywa korzeniowe","ziemniak|marchewka|burak|pietruszka|seler|rzodkiewka|rzodkiew|rzepa|batat|pasternak|topinambur|maniok|chrzan|brukiew|skorzonera"),
    task("vegetables_leafy","Wymień warzywa liściaste lub sałaty","sałata|rukola|roszponka|szpinak|jarmuż|cykoria|boćwina|kapusta|kapusta pekińska|pak choi|endywia|radicchio|sałata lodowa|sałata rzymska|sałata masłowa"),
    task("vegetables_green","Wymień zielone warzywa","ogórek|brokuł|cukinia|groszek|fasolka szparagowa|szpinak|jarmuż|sałata|rukola|roszponka|brukselka|szparagi|por|seler naciowy|bób|okra|edamame|kapusta|kalarepa"),
  ],
  games:[
    task("games_mobile","Wymień gry mobilne","brawl stars|clash royale|clash of clans|pokemon go|subway surfers|temple run|angry birds|candy crush|geometry dash|stumble guys|among us|roblox|minecraft|pubg mobile|call of duty mobile|genshin impact|honkai star rail|hay day|plants vs zombies|fruit ninja|jetpack joyride|hill climb racing|the battle cats|plague inc|monopoly go|8 ball pool|crossy road|cut the rope|my talking tom"),
    task("games_multiplayer","Wymień gry multiplayer","minecraft|roblox|fortnite|valorant|league of legends|counter strike|counter strike 2|csgo|among us|rocket league|overwatch|apex legends|fall guys|pubg|dota 2|world of warcraft|dead by daylight|phasmophobia|rust|ark|rainbow six siege|destiny|warframe|helldivers|gta online|sea of thieves|palworld|terraria|stardew valley|team fortress 2|war thunder|world of tanks|fifa|ea fc|mario kart|super smash bros|splatoon"),
    task("games_classics","Wymień klasyczne gry komputerowe lub konsolowe","tetris|pac-man|pong|snake|super mario|mario kart|zelda|doom|quake|diablo|warcraft|starcraft|half-life|portal|the sims|counter strike|gta|gta san andreas|minecraft|terraria|skyrim|need for speed|heroes 3|worms|age of empires|simcity|rollercoaster tycoon|mortal kombat|tekken|street fighter|sonic|pokemon|metroid|castlevania"),
  ],
  roblox:[
    task("roblox_horror","Wymień straszne gry na Robloxie","doors|pressure|piggy|apeirophobia|rainbow friends|the mimic|flee the facility|dead silence|bear alpha|breaking point|murder mystery 2|3008|evade|nico's nextbots|specter|identity fraud|the maze|cheese escape|short creepy stories|forgotten memories|residence massacre|dandy's world"),
    task("roblox_roleplay","Wymień gry roleplay lub symulatory na Robloxie","brookhaven|adopt me|bloxburg|welcome to bloxburg|livetopia|berry avenue|meepcity|royale high|work at a pizza place|restaurant tycoon 2|theme park tycoon 2|pet simulator 99|pet simulator x|bee swarm simulator|vehicle simulator|driving empire|greenville|jailbreak|mad city|dress to impress|fisch"),
    task("roblox_action","Wymień gry akcji lub zręcznościowe na Robloxie","arsenal|bedwars|tower of hell|obby but you're on a bike|natural disaster survival|blade ball|blox fruits|anime adventures|the strongest battlegrounds|combat warriors|phantom forces|frontlines|jailbreak|mad city|murder mystery 2|evade|obby creator|speed run 4|epic minigames|super bomb survival"),
  ],
  everyday:[
    task("everyday_bathroom","Wymień rzeczy, które można znaleźć w łazience","ręcznik|szczoteczka do zębów|pasta do zębów|mydło|szampon|odżywka|żel pod prysznic|papier toaletowy|pralka|kosz na pranie|lustro|umywalka|wanna|prysznic|toaleta|sedes|szczotka do toalety|gąbka|grzebień|szczotka|suszarka|maszynka do golenia|dezodorant|perfumy|płyn do płukania ust|nić dentystyczna|waciki|patyczki kosmetyczne"),
    task("everyday_bedroom","Wymień rzeczy, które można znaleźć w sypialni","łóżko|poduszka|kołdra|koc|prześcieradło|szafa|komoda|stolik nocny|lampka|budzik|lustro|dywan|zasłona|firanka|wieszak|biurko|krzesło|książka|telefon|ładowarka|kapcie|ubrania|kosz na pranie|roślina|obraz|plakat|półka"),
  ],
  transport:[
    task("transport_land","Wymień środki transportu poruszające się po lądzie","samochód|autobus|tramwaj|pociąg|metro|rower|motocykl|skuter|hulajnoga|taksówka|ciężarówka|tir|furgonetka|kamper|quad|traktor|kombajn|limuzyna|karetka|radiowóz|wóz strażacki|autokar|trolejbus|kolejka linowa|segway|deskorolka|rolki"),
    task("transport_air_water","Wymień środki transportu wodnego lub powietrznego","samolot|helikopter|śmigłowiec|balon|sterowiec|szybowiec|odrzutowiec|rakieta|statek|prom|łódź|motorówka|kajak|żaglówka|jacht|tratwa|gondola|katamaran|skuter wodny|okręt|łódź podwodna|poduszkowiec"),
  ],
  clothes:[
    task("clothes_footwear","Wymień rodzaje obuwia","buty|trampki|adidasy|sneakersy|kozaki|botki|kalosze|sandały|klapki|japonki|kapcie|szpilki|mokasyny|półbuty|glany|martensy|korki|łyżwy|rolki|buty trekkingowe"),
    task("clothes_accessories","Wymień dodatki do ubioru","czapka|kapelusz|szalik|rękawiczki|pasek|krawat|muszka|zegarek|bransoletka|naszyjnik|kolczyki|pierścionek|okulary|okulary przeciwsłoneczne|torebka|plecak|portfel|parasolka|opaska|spinka|gumka do włosów|apaszka|beret"),
  ],
  nature:[
    task("nature_weather","Wymień zjawiska pogodowe","deszcz|śnieg|grad|burza|piorun|grzmot|tęcza|mgła|wiatr|wichura|huragan|tornado|trąba powietrzna|zamieć|mżawka|ulewa|szron|rosa|gołoledź|upał|susza|przymrozek|lawina|chmura"),
    task("nature_plants","Wymień drzewa, kwiaty lub inne rośliny","dąb|brzoza|sosna|świerk|jodła|klon|kasztanowiec|wierzba|topola|buk|lipa|jarzębina|róża|tulipan|stokrotka|słonecznik|fiołek|konwalia|lawenda|orchidea|kaktus|paproć|mech|trawa|bluszcz|bambus|aloes|monstera"),
  ],
  drinks:[
    task("drinks_hot","Wymień ciepłe napoje","herbata|kawa|espresso|americano|cappuccino|latte|macchiato|flat white|kakao|gorąca czekolada|grzane wino|grzaniec|yerba mate|matcha|chai latte|napar|rumianek|mięta"),
    task("drinks_cold","Wymień zimne napoje bezalkoholowe","woda|woda gazowana|lemoniada|cola|pepsi|sprite|fanta|oranżada|sok|nektar|ice tea|mrożona herbata|mrożona kawa|shake|koktajl|smoothie|energetyk|izotonik|tonik|kwas chlebowy|kompot"),
  ],
  body:[
    task("body_organs","Wymień narządy człowieka","serce|mózg|płuca|wątroba|nerki|żołądek|jelito|jelito cienkie|jelito grube|trzustka|śledziona|pęcherz|skóra|oko|ucho|język|gardło|tarczyca|wyrostek robaczkowy|przepona"),
    task("body_bones","Wymień kości lub części szkieletu człowieka","czaszka|kręgosłup|żebro|miednica|łopatka|obojczyk|mostek|kość ramienna|kość promieniowa|kość łokciowa|kość udowa|rzepka|piszczel|strzałka|żuchwa|szczęka|paliczek|kość ogonowa|kość krzyżowa"),
  ],
};

const addSpecificTasks = (category, items) => {
  specificTasks[category] = [...(specificTasks[category] || []), ...items];
};

addSpecificTasks("jobs", [
  task("jobs_medical","Wymien zawody medyczne","lekarz|pielegniarka|ratownik medyczny|chirurg|dentysta|ortodonta|farmaceuta|fizjoterapeuta|psycholog|psychiatra|radiolog|anestezjolog|polozna|dietetyk|optometrysta"),
  task("jobs_school","Wymien zawody zwiazane ze szkola","nauczyciel|dyrektor|pedagog|psycholog szkolny|bibliotekarz|wozny|sekretarka|korepetytor|wykladowca|profesor|trener|opiekun swietlicy"),
  task("jobs_food","Wymien zawody zwiazane z jedzeniem","kucharz|kelner|barista|cukiernik|piekarz|barman|szef kuchni|dostawca jedzenia|dietetyk|sommelier|rzeznik|sprzedawca"),
  task("jobs_services","Wymien zawody uslugowe","fryzjer|kosmetyczka|mechanik|hydraulik|elektryk|krawiec|szewc|taksowkarz|kurier|ochroniarz|sprzatacz|listonosz|fotograf"),
  task("jobs_art","Wymien zawody kreatywne","aktor|muzyk|piosenkarz|malarz|grafik|projektant|architekt|pisarz|rezyser|montazysta|fotograf|tancerz|ilustrator|designer"),
]);

addSpecificTasks("hobbies", [
  task("hobbies_sport","Wymien hobby zwiazane z ruchem","bieganie|jazda na rowerze|plywanie|silownia|taniec|wspinaczka|rolki|deskorolka|joga|pilka nozna|koszykowka|siatkowka|tenis"),
  task("hobbies_home","Wymien hobby, ktore mozna robic w domu","czytanie|rysowanie|gotowanie|pieczenie|gry planszowe|gry komputerowe|ukladanie puzzli|modelarstwo|szydelkowanie|ogladanie filmow|pisanie|kolekcjonowanie"),
  task("hobbies_creative","Wymien kreatywne hobby","fotografia|malowanie|rysowanie|pisanie|spiewanie|gra na gitarze|taniec|robienie bizuterii|origami|ceramika|montaz filmow|grafika komputerowa"),
  task("hobbies_collecting","Wymien rzeczy, ktore ludzie kolekcjonuja","znaczki|monety|karty pokemon|figurki|ksiazki|plyty|winyle|komiksy|buty|magnesy|kamienie|modele samochodow|plakaty"),
  task("hobbies_outdoor","Wymien hobby na dworze","wedkowanie|biwakowanie|spacery|geocaching|ogrodnictwo|jazda konna|obserwacja ptakow|kajaki|narty|snowboard|grillowanie|fotografia przyrody"),
]);

addSpecificTasks("travel", [
  task("travel_places","Wymien miejsca, do ktorych mozna pojechac na wakacje","morze|gory|jezioro|las|miasto|stolica|wyspa|camping|hotel|apartament|park rozrywki|aquapark|zamek|muzeum"),
  task("travel_items","Wymien rzeczy, ktore pakuje sie na wyjazd","walizka|plecak|paszport|dowod osobisty|bilet|ladowarka|powerbank|recznik|kosmetyczka|ubrania|buty|okulary przeciwsloneczne|krem z filtrem|aparat"),
  task("travel_transport","Wymien sposoby podrozowania","samolot|pociag|autobus|samochod|prom|rower|autostop|kamper|metro|tramwaj|taksowka|statek|motocykl"),
  task("travel_city","Wymien rzeczy, ktore zwiedza sie w miescie","rynek|muzeum|zamek|kosciol|katedra|pomnik|park|stare miasto|galeria|teatr|most|wieza widokowa|fontanna"),
  task("travel_hotel","Wymien rzeczy kojarzace sie z hotelem","recepcja|pokoj|karta do pokoju|winda|sniadanie|basen|spa|recznik|lobby|walizka|klimatyzacja|mini bar|room service"),
]);

addSpecificTasks("transport", [
  task("transport_city","Wymien pojazdy komunikacji miejskiej","autobus|tramwaj|metro|trolejbus|pociag|kolejka|taxi|hulajnoga|rower miejski|minibus|bus|skm|kolej podmiejska"),
  task("transport_emergency","Wymien pojazdy sluzb ratunkowych","karetka|radiowoz|woz strazacki|helikopter ratunkowy|ambulans|motocykl policyjny|lodz ratunkowa|samochod strazy miejskiej|samochod techniczny"),
  task("transport_parts","Wymien czesci samochodu","kierownica|silnik|opona|felga|hamulec|sprzeglo|skrzynia biegow|lusterko|szyba|drzwi|bagaznik|maska|reflektor|zderzak"),
  task("transport_station","Wymien rzeczy na dworcu lub lotnisku","peron|tor|biletomat|tablica odjazdow|bramka|odprawa|bagaz|walizka|kontrola bezpieczenstwa|terminal|hala|poczekalnia|kasownik"),
]);

addSpecificTasks("clothes", [
  task("clothes_winter","Wymien ubrania zimowe","kurtka|plaszcz|czapka|szalik|rekawiczki|sweter|bluza|kozaki|termoaktywna koszulka|komin|nauszniki|snowboots"),
  task("clothes_summer","Wymien ubrania letnie","koszulka|t-shirt|spodenki|sukienka|sandaly|klapki|czapka z daszkiem|okulary przeciwsloneczne|top|stroj kapielowy|kapielowki|lniana koszula"),
  task("clothes_formal","Wymien eleganckie ubrania","garnitur|koszula|marynarka|krawat|muszka|sukienka|spodnica|plaszcz|eleganckie buty|szpilki|kamizelka|garsonka"),
  task("clothes_patterns","Wymien wzory na ubraniach","paski|kratka|kropki|panterka|moro|kwiaty|nadruk|logo|zygzak|pepita|tie dye|geometryczny wzor"),
]);

addSpecificTasks("nature", [
  task("nature_landforms","Wymien formy terenu","gora|dolina|wzgorze|plaza|klif|jaskinia|kanion|wyspa|polwysep|rownina|pustynia|wydma|wulkan"),
  task("nature_water","Wymien naturalne zbiorniki lub cieki wodne","rzeka|jezioro|morze|ocean|staw|strumien|potok|wodospad|zatoka|laguna|bagno|mokradlo"),
  task("nature_animals_places","Wymien miejsca, gdzie zyja zwierzeta","las|sawanna|dzungla|ocean|rzeka|gory|pustynia|farma|laka|jaskinia|rafa koralowa|bagno|arktyka"),
  task("nature_seasons","Wymien rzeczy kojarzace sie z porami roku","snieg|liscie|kwiaty|upal|deszcz|mroz|kasztany|wakacje|ferie|grzyby|burza|tulipany|dynia"),
]);

addSpecificTasks("drinks", [
  task("drinks_energy","Wymien energetyki albo napoje izotoniczne","monster|red bull|tiger|black|burn|rockstar|oshee|powerade|gatorade|4move|be power|dzik|hell|prime"),
  task("drinks_fruit","Wymien smaki sokow lub napojow owocowych","pomaranczowy|jablkowy|multiwitamina|porzeczkowy|winogronowy|ananasowy|brzoskwiniowy|mango|truskawkowy|malinowy|wisniowy|grejpfrutowy"),
  task("drinks_coffee","Wymien rodzaje kawy","espresso|americano|latte|cappuccino|flat white|macchiato|mocha|cold brew|frappe|kawa mrozona|ristretto|lungo"),
  task("drinks_bar","Wymien napoje, ktore mozna zamowic w barze","cola|lemoniada|woda|sok|herbata|kawa|mocktail|tonik|piwo bezalkoholowe|shake|smoothie|ice tea|oranzada"),
]);

addSpecificTasks("body", [
  task("body_face","Wymien czesci twarzy","oko|nos|usta|warga|broda|policzek|czolo|brew|rzesa|ucho|zab|jezyk|podbrodek"),
  task("body_limbs","Wymien czesci rak lub nog","ramie|lokiec|nadgarstek|dlon|palec|kciuk|udo|kolano|lydka|kostka|stopa|pieta|paznokiec"),
  task("body_senses","Wymien zmysly albo rzeczy z nimi zwiazane","wzrok|sluch|smak|wech|dotyk|oko|ucho|jezyk|nos|skora|zapach|dzwiek|kolor"),
  task("body_muscles","Wymien miesnie albo partie treningowe","biceps|triceps|klatka piersiowa|plecy|brzuch|nogi|lydki|barki|posladki|przedramie|czworoglowy|dwuglowy"),
]);

addSpecificTasks("countries", [
  task("countries_europe","Wymien panstwa Europy","polska|niemcy|francja|hiszpania|portugalia|wlochy|czechy|slowacja|ukraina|litwa|lotwa|estonia|norwegia|szwecja|finlandia|dania|grecja|chorwacja|rumunia|bulgaria|austria|szwajcaria|belgia|holandia|irlandia"),
  task("countries_asia","Wymien panstwa Azji","chiny|japonia|korea poludniowa|indie|tajlandia|wietnam|indonezja|malezja|singapur|filipiny|turcja|iran|irak|izrael|arabia saudyjska|katar|zjednoczone emiraty arabskie|mongolia|nepal"),
  task("countries_africa","Wymien panstwa Afryki","egipt|maroko|tunezja|algieria|rpa|kenia|nigeria|ghana|etiopia|senegal|kamerun|tanzania|uganda|madagaskar|libia|sudan|somalia|angola"),
  task("countries_americas","Wymien panstwa obu Ameryk","usa|kanada|meksyk|brazylia|argentyna|chile|peru|kolumbia|wenezuela|urugwaj|paragwaj|boliwia|ekwador|kuba|panama|kostaryka|jamajka"),
]);

addSpecificTasks("cities", [
  task("cities_poland","Wymien polskie miasta","warszawa|krakow|lodz|wroclaw|poznan|gdansk|szczecin|bydgoszcz|lublin|bialystok|katowice|gdynia|czestochowa|radom|torun|rzeszow|kielce|gliwice|zabrze|olsztyn"),
  task("cities_europe","Wymien europejskie miasta poza Polska","berlin|paryz|londyn|rzym|madryt|barcelona|lizbona|praga|wieden|budapeszt|amsterdam|bruksela|dublin|oslo|sztokholm|helsinki|ateny|wenecja|mediolan"),
  task("cities_usa","Wymien miasta w USA","nowy jork|los angeles|chicago|houston|phoenix|filadelfia|san antonio|san diego|dallas|san francisco|las vegas|miami|boston|seattle|atlanta|detroit"),
  task("cities_world","Wymien wielkie miasta swiata","tokio|seul|pekin|szanghaj|bangkok|singapur|dubaj|delhi|mumbai|sydney|melbourne|kair|meksyk|sao paulo|rio de janeiro|toronto"),
]);

addSpecificTasks("brands", [
  task("brands_food","Wymien marki jedzenia lub napojow","coca cola|pepsi|sprite|fanta|lays|pringles|kinder|milka|nestle|mcdonalds|kfc|burger king|subway|starbucks|dominos|pizza hut|wedel|tymbark"),
  task("brands_cars","Wymien marki samochodow","toyota|volkswagen|bmw|audi|mercedes|ford|opel|skoda|kia|hyundai|renault|peugeot|citroen|fiat|tesla|porsche|ferrari|lamborghini|volvo"),
  task("brands_games","Wymien marki lub firmy zwiazane z grami","sony|playstation|xbox|nintendo|steam|epic games|riot games|blizzard|ubisoft|ea|rockstar|mojang|roblox|supercell|valve|activision"),
  task("brands_shops","Wymien sklepy lub sieci handlowe","biedronka|lidl|zabka|kaufland|carrefour|auchan|netto|rossmann|hebe|media expert|rtv euro agd|empik|ikea|decathlon|action"),
]);

addSpecificTasks("tech", [
  task("tech_phone_apps","Wymien aplikacje na telefon","instagram|tiktok|youtube|messenger|whatsapp|discord|spotify|netflix|gmail|maps|google maps|snapchat|telegram|allegro|vinted|revolut"),
  task("tech_parts","Wymien czesci komputera","procesor|karta graficzna|ram|dysk ssd|dysk hdd|plyta glowna|zasilacz|obudowa|chlodzenie|wentylator|monitor|klawiatura|mysz|karta sieciowa"),
  task("tech_gadgets","Wymien gadzety technologiczne","smartwatch|sluchawki bezprzewodowe|powerbank|dron|kamera sportowa|czytnik ebookow|tablet graficzny|gimbal|lokalizator|opaska sportowa|projektor|vr"),
  task("tech_websites","Wymien znane strony internetowe","google|youtube|facebook|wikipedia|reddit|twitch|netflix|allegro|olx|amazon|spotify|x|twitter|discord|github|onet|wp"),
]);

addSpecificTasks("games", [
  task("games_sandbox","Wymien gry sandbox albo survival","minecraft|terraria|roblox|gmod|garry's mod|rust|ark|the forest|sons of the forest|subnautica|valheim|dont starve|project zomboid"),
  task("games_shooters","Wymien strzelanki","counter strike|cs2|valorant|fortnite|call of duty|battlefield|apex legends|overwatch|rainbow six siege|pubg|doom|halo|destiny|team fortress 2"),
  task("games_party","Wymien gry imprezowe lub do grania ze znajomymi","among us|jackbox|gartic phone|scribbl|fall guys|stumble guys|overcooked|gang beasts|pummel party|mario party|keep talking and nobody explodes"),
  task("games_rpg","Wymien gry RPG lub z otwartym swiatem","skyrim|the witcher|wiedzmin|fallout|elden ring|dark souls|baldur's gate|cyberpunk|gta|red dead redemption|zelda|genshin impact|diablo"),
]);

addSpecificTasks("roblox", [
  task("roblox_popular","Wymien popularne gry Roblox","adopt me|brookhaven|blox fruits|doors|dress to impress|blade ball|pet simulator 99|arsenal|jailbreak|murder mystery 2|tower of hell|fisch|bedwars"),
  task("roblox_simulators","Wymien symulatory na Robloxie","bee swarm simulator|pet simulator x|pet simulator 99|vehicle simulator|restaurant tycoon 2|theme park tycoon 2|anime simulator|clicker simulator|strongman simulator|speed simulator"),
  task("roblox_anime","Wymien gry Roblox z anime lub walkami","blox fruits|anime adventures|anime defenders|anime fighters|the strongest battlegrounds|shindo life|king legacy|all star tower defense|jujutsu shenanigans"),
  task("roblox_fashion","Wymien gry Roblox o modzie lub avatarach","dress to impress|royale high|catalog avatar creator|fashion famous|avatar outfit creator|berry avenue|brookhaven|adopt me"),
]);

addSpecificTasks("minecraft", [
  task("minecraft_ores","Wymien rudy lub surowce w Minecraft","wegiel|zelazo|miedz|zloto|redstone|lapis lazuli|diament|emerald|szmaragd|netherite|kwarc|ametyst|obsydian"),
  task("minecraft_tools","Wymien narzedzia w Minecraft","kilof|lopata|siekiera|motyka|miecz|wedka|nozyce|krzesiwo|kompas|mapa|luk|kusza|tarcza|wiadro"),
  task("minecraft_food","Wymien jedzenie w Minecraft","chleb|jablko|zlote jablko|marchewka|ziemniak|stek|kurczak|wieprzowina|baranina|ciastko|ciasto|arbuz|dyniowe ciasto|zupa grzybowa"),
  task("minecraft_redstone","Wymien rzeczy zwiazane z redstonem","redstone|pochodnia redstone|repeater|komparator|tlok|lepki tlok|dzwignia|przycisk|plyta naciskowa|obserwator|dozownik|wyrzutnik|hopper"),
]);

addSpecificTasks("internet", [
  task("internet_video","Wymien platformy do ogladania filmow lub streamow","youtube|twitch|netflix|disney plus|hbo max|max|prime video|canal plus|player|polsat box go|tiktok|kick|viaplay"),
  task("internet_chat","Wymien aplikacje do pisania lub rozmow","messenger|whatsapp|discord|telegram|signal|snapchat|teamspeak|skype|google meet|zoom|teams|facetime|slack"),
  task("internet_terms","Wymien slowa kojarzace sie z internetem","link|hashtag|post|komentarz|like|subskrypcja|stream|czat|profil|avatar|login|haslo|ban|spam|mem|viral"),
  task("internet_games","Wymien rzeczy kojarzace sie z graniem online","ping|lag|serwer|lobby|matchmaking|ranked|skin|nick|klan|voice chat|ban|cheater|update|patch|battle pass"),
]);

addSpecificTasks("animals", [
  task("animals_pets","Wymien zwierzeta domowe","pies|kot|chomik|swinka morska|krolik|papuga|kanarek|zolw|rybka|fretka|szczur|mysz|gekon|agama|szynszyla"),
  task("animals_dangerous","Wymien niebezpieczne zwierzeta","lew|tygrys|niedzwiedz|rekin|krokodyl|waz|anakonda|skorpion|pajak|hipopotam|nosorozec|wilk|hiena|komar"),
]);

addSpecificTasks("fruits", [
  task("fruits_yellow","Wymien zolte lub pomaranczowe owoce","banan|cytryna|pomarancza|mandarynka|mango|ananas|morela|brzoskwinia|nektarynka|papaja|marakuja|melon"),
  task("fruits_stone","Wymien owoce pestkowe","sliwka|brzoskwinia|morela|nektarynka|wisnia|czeresnia|mango|awokado|daktyl|oliwka"),
]);

addSpecificTasks("food", [
  task("food_breakfast","Wymien rzeczy jedzone na sniadanie","kanapka|jajecznica|platki|owsianka|tost|jajko|parowka|jogurt|musli|omlet|nalesniki|twarozek|bulka|ser|szynka"),
  task("food_pizza","Wymien dodatki do pizzy","ser|pepperoni|szynka|pieczarki|cebula|papryka|oliwki|kukurydza|ananas|kurczak|salami|boczek|rukola|jalapeno|pomidor"),
]);

addSpecificTasks("school", [
  task("school_exams","Wymien rzeczy kojarzace sie z egzaminem","test|kartkowka|sprawdzian|matura|egzamin osmioklasisty|arkusz|odpowiedz|punkt|ocena|sciaga|dzwonek|stres"),
  task("school_rooms","Wymien pomieszczenia w szkole","klasa|sala gimnastyczna|biblioteka|sekretariat|gabinet dyrektora|swietlica|korytarz|szatnia|stolowka|toaleta|pracownia|boisko"),
]);

addSpecificTasks("music", [
  task("music_polish","Wymien polskich wykonawcow muzycznych","sanah|dawid podsiadlo|mata|taco hemingway|quebonafide|kizo|bedoes|doda|mrozu|kwiat jabloni|margaret|lanberry|smolasty|young leosia"),
  task("music_popstars","Wymien zagranicznych wykonawcow pop","taylor swift|ariana grande|billie eilish|dua lipa|the weeknd|ed sheeran|justin bieber|rihanna|beyonce|lady gaga|bruno mars|olivia rodrigo"),
]);

addSpecificTasks("sport", [
  task("sport_equipment","Wymien sprzet sportowy","pilka|rakieta|kij|bramka|siatka|hantle|sztanga|mata|kask|rolki|lyzwy|narty|deskorolka|rower|rekawice bokserskie"),
  task("sport_events","Wymien wydarzenia sportowe","mundial|euro|liga mistrzow|olimpiada|igrzyska olimpijskie|super bowl|wimbledon|tour de france|fame mma|k_sw|nba finals|grand prix"),
]);

addSpecificTasks("movies", [
  task("movies_superheroes","Wymien superbohaterow filmowych","spider-man|batman|superman|iron man|thor|hulk|kapitan ameryka|wonder woman|aquaman|flash|doctor strange|black panther|deadpool"),
  task("movies_horror","Wymien horrory lub postacie z horrorow","it|pennywise|krzyk|scream|freddy krueger|jason|michael myers|annabelle|obecnosc|the conjuring|smile|laleczka chucky|saw"),
]);

addSpecificTasks("everyday", [
  task("everyday_kitchen","Wymien rzeczy, ktore mozna znalezc w kuchni","garnek|patelnia|talerz|kubek|szklanka|widelec|noz|lyzka|lodowka|piekarnik|mikrofalowka|czajnik|blender|deska do krojenia"),
  task("everyday_bag","Wymien rzeczy, ktore nosi sie w plecaku lub torbie","telefon|portfel|klucze|ladowarka|sluchawki|zeszyt|dlugopis|butelka wody|kanapka|chusteczki|powerbank|legitymacja"),
]);

addSpecificTasks("vegetables", [
  task("vegetables_soup","Wymien warzywa dobre do zupy","marchewka|pietruszka|seler|por|ziemniak|cebula|czosnek|kapusta|pomidor|brokul|kalafior|burak|groszek|fasolka"),
  task("vegetables_salad","Wymien warzywa do salatki","pomidor|ogorek|salata|papryka|cebula|kukurydza|oliwki|rukola|roszponka|rzodkiewka|marchewka|kapusta|awokado"),
]);

addSpecificTasks("pokemon", [
  task("pokemon_electric","Wymien elektryczne Pokemony","pikachu|raichu|pichu|magnemite|magneton|voltorb|electrode|electabuzz|jolteon|zapdos|mareep|flaaffy|ampharos|luxray|rotom"),
  task("pokemon_water","Wymien wodne Pokemony","squirtle|wartortle|blastoise|psyduck|golduck|poliwag|poliwhirl|poliwrath|tentacool|tentacruel|slowpoke|slowbro|magikarp|gyarados|lapras|vaporeon|totodile|mudkip"),
]);

// Dodatkowe, jednoznaczne odpowiedzi dla węższych pytań. Trzymamy je osobno,
// żeby łatwo było uzupełniać konkretne pule bez rozluźniania walidacji.
const additionalAnswers = {
  animals_dangerous: "lis|gepard|puma|jaguar|dzik|bawół|orka|meduza|osa|szerszeń|kleszcz|tarantula|waran|lew morski",
  fruits_yellow: "gruszka|kumkwat|pomelo|karambola|liczi|kokos|melon miodowy|gruszka azjatycka|żółte jabłko",
  fruits_stone: "mirabelka|renkloda|śliwka japońska|brzoskwinia płaska|kokos|śliwka kalifornijska",
  games_sandbox: "minecraft dungeons|minecraft legends|conan exiles|starbound|astroneer|empyrion|grounded|raft|stranded deep|7 days to die|dayz|scum",
  games_shooters: "cs go|counter strike 2|call of duty warzone|warzone|battlebit|the finals|xdefiant|quake|wolfenstein|left 4 dead|splitgate|paladins",
  games_party: "human fall flat|it takes two|phasmophobia|lethal company|content warning|plateup|moving out|we were here|ultimate chicken horse|worms|trivia murder party",
  games_rpg: "baldur's gate 3|dragon age|mass effect|monster hunter|kingdom come deliverance|assassin's creed|horizon|god of war|path of exile|starfield|divinity original sin|persona 5",
  tech_parts: "cpu|gpu|pamięć ram|karta sieciowa|karta dźwiękowa|dysk nvme|dysk sata|złącze usb|zasilacz awaryjny|radiator|pasta termoprzewodząca",
  tech_gadgets: "smartfon|tablet|smart ring|słuchawki|głośnik bluetooth|e-czytnik|smart tv|konsola przenośna|kamera|aparat|powerbank solarny|lokalizator gps",
  school_exams: "ściąga|długopis|ołówek|gumka|kalkulator|komisja|sala|ławka|pytanie|zadanie|wynik|poprawa|termin|przygotowanie",
  school_rooms: "laboratorium|pracownia komputerowa|pracownia chemiczna|aula|gabinet pedagoga|pokój nauczycielski|magazyn|archiwum|portiernia|winda|schody|boisko szkolne",
  music_polish: "pro8l3m|oki|otsochodzi|szpaku|paluch|sobel|roxie|vito bambino|nosowska|kasia lins|daria zawiałow|young igi|sanah",
  music_popstars: "katy perry|kesha|selena gomez|miley cyrus|adele|sia|harry styles|shawn mendes|charlie puth|camila cabello|maroon 5|p!nk|kylie minogue",
  sport_events: "mistrzostwa świata|mistrzostwa europy|euro 2024|igrzyska paraolimpijskie|giro d'italia|rajd dakar|us open|australian open|roland garros|ufc|ksw",
  movies_superheroes: "wolverine|profesor x|magneto|venom|groot|ant-man|wasp|captain marvel|shazam|green lantern|cyborg|robin|joker|catwoman|harley quinn",
  movies_horror: "egzorcysta|klątwa|ring|the ring|obecność 2|insidious|naznaczony|paranormal activity|jigsaw|candyman|sierota|midsommar|dziedzictwo|hereditary",
  everyday_kitchen: "miska|łyżeczka|rondel|mikser|toster|tarka|durszlak|sitko|ręcznik kuchenny|folia|pojemnik|słoik|zlew",
  everyday_bag: "gumka|kalendarz|notes|kosmetyczka|parasol|czapka|okulary|przekąska|tablet|laptop|karta płatnicza|bilet|maseczka",
  vegetables_soup: "dynia|cukinia|fasola|kalarepa|brukselka|jarmuż|szpinak|rabarbar|rzodkiewka|soczewica|ciecierzyca",
  vegetables_salad: "szczypiorek|seler|burak|brokuł|kalafior|fasola|groszek|jajko|ser feta|kapusta pekińska|cebula dymka|papryczka",
  internet_video: "youtube shorts|vimeo|dailymotion|hulu|apple tv+|skyshowtime|tvp vod|vod.pl|facebook watch|rumble",
  internet_chat: "gadu-gadu|instagram|reddit|viber|line|wechat|kakao talk|mumble|element|whatsapp",
  minecraft_ores: "coal|iron|copper|gold|redstone|lapis|diamond|emerald|netherite|quartz|amethyst|ancient debris|prismarine|glowstone",
  minecraft_tools: "kilof diamentowy|kilof netheritowy|łopata diamentowa|siekiera|motyka|wędka|nożyce|krzesiwo|kompas|mapa|wiadro|szczotka|maczuga",
  minecraft_food: "stek wołowy|pieczony kurczak|pieczona wieprzowina|pieczona baranina|ryba|łosoś|dorsz|królik|złota marchewka|burak|suszone wodorosty|miód|jagody",
  minecraft_redstone: "lampa redstone|tor redstone|blok redstone|czujnik światła|repeater|komparator|tłok|lepki tłok|dźwignia|przycisk|obserwator|lej|dozownik|wyrzutnik",
  roblox_popular: "grow a garden|steal a brainrot|99 nights in the forest|rivals|pls donate|piggy|natural disaster survival|tower defense simulator|pet simulator x",
  roblox_simulators: "mining simulator|bubble gum simulator|fishing simulator|lifting simulator|car dealership tycoon|restaurant tycoon|lumber tycoon|my farm|muscle legends",
  roblox_anime: "anime vanguards|anime last stand|anime dimensions|fruit battlegrounds|type soul|peroxide|demonfall|jujutsu infinite|grand piece online",
  roblox_fashion: "fashion runway|my avatar|avatar creator|design it|barbie dreamhouse|livetopia|high school 2|catalog avatar creator",
  jobs_school: "woźna|woźny|pedagożka|nauczycielka|nauczyciel wspomagający|doradca zawodowy|logopeda|pielęgniarka szkolna|informatyk szkolny|sprzątaczka",
  jobs_food: "pizzaiolo|kucharz sushi|masarz|garmażer|kelnerka|dostawca|kierownik restauracji|inspektor sanitarny",
  jobs_services: "manikiurzystka|fizjoterapeuta|weterynarz|dentysta|lekarz|pielęgniarka|sprzedawca|recepcjonista|konsultant|agent nieruchomości|szklarz",
  jobs_art: "fotografka|aktorka|wokalistka|kompozytor|scenarzysta|charakteryzator|choreograf|animator|twórca treści|ilustratorka|rzeźbiarz|kurator",
  transport_city: "autobus miejski|pociąg podmiejski|kolej miejska|autobus przegubowy|autobus elektryczny|melex|rower publiczny|hulajnoga elektryczna|kolejka linowa",
  transport_emergency: "wóz policyjny|samochód pożarniczy|samochód ratowniczy|śmigłowiec medyczny|samolot ratowniczy|wóz pogotowia technicznego|wóz straży granicznej|ambulans lotniczy",
  transport_parts: "akumulator|alternator|wał napędowy|zawieszenie|amortyzator|sprężyna|pasek rozrządu|filtr oleju|chłodnica|wycieraczka",
  transport_station: "torowisko|rozkład jazdy|bilet|rozkład|tablica informacyjna|kontrola paszportowa|odprawa|stanowisko|przejście podziemne|schody ruchome",
  clothes_winter: "kaptur|komin|nauszniki|kalesony|bielizna termiczna|spodnie narciarskie|buty śniegowe|puchówka|kamizelka|rękawice",
  clothes_summer: "krótkie spodenki|koszula z krótkim rękawem|kapelusz|japonki|tunika|pareo|strój plażowy|narzutka|lniane spodnie",
  clothes_formal: "frak|tuxedo|garsonka|suknia wieczorowa|elegancka koszula|eleganckie spodnie|mokasyny|lakierki|żakiet|apaszka|zegarek",
  clothes_patterns: "krata|kwiatowy|geometryczny|zwierzęcy|paisley|wężowy|tie-dye|ombre|kamuflaż|groszki|jodełka",
  nature_landforms: "płaskowyż|nizina|wyżyna|kotlina|archipelag|wąwóz|przełęcz|delta|klif|półwysep",
  nature_water: "źródło|delta|cieśnina|lodowiec|laguna|mokradło|strumień|potok|wodospad|zatoka",
  nature_animals_places: "gniazdo|nora|ul|mrowisko|kopiec|buda|obora|stajnia|kurnik|akwarium|terrarium|głębia oceanu",
  nature_seasons: "wiosna|lato|jesień|zima|sanki|bałwan|parasolka|upał|mróz|liście|kwiaty|wakacje|ferie",
  hobbies_sport: "jazda na rolkach|nurkowanie|kajakarstwo|surfing|narciarstwo|snowboard|łyżwy|fitness|crossfit|parkour|paintball|airsoft",
  hobbies_home: "sudoku|krzyżówki|szycie|haftowanie|kaligrafia|majsterkowanie|programowanie|medytacja|joga|układanie lego",
  hobbies_creative: "lepienie z gliny|szydełkowanie|szycie|haftowanie|kaligrafia|rzeźbienie|produkcja muzyki|montaż wideo|cosplay|tworzenie biżuterii",
  hobbies_collecting: "karty piłkarskie|maskotki|modele|samochodziki|zegarki|mangę|perfumy|gry|płyty|figurki",
  hobbies_outdoor: "kemping|trekking|wspinaczka|grzybobranie|żeglarstwo|survival|nurkowanie|fotografia przyrody|jazda konna|spacer",
  drinks_energy: "volt|n-gine|level up|izotonik|monster energy|red bull|napój energetyczny|shot energetyczny",
  drinks_fruit: "cytrynowy|bananowy|marchewkowy|aroniowy|gruszkowy|koktajl owocowy|nektar|smoothie owocowe",
  drinks_coffee: "doppio|cortado|café au lait|kawa po turecku|kawa po wiedeńsku|kawa przelewowa|kawa rozpuszczalna",
  drinks_bar: "piwo|cydr|wino|mojito|aperol spritz|margarita|whisky|rum|drinki|koktajl",
  body_face: "twarz|skroń|powieka|nozdrza|dziąsło|podniebienie|szczęka|policzek|czoło|brwi",
  body_limbs: "bark|przedramię|ręka|noga|staw|ramię|łokieć|palec|udo|kolano",
  body_senses: "ból|temperatura|równowaga|wzrok|słuch|smak|węch|dotyk|oko|ucho",
  body_muscles: "łydka|grzbiet|kaptury|trapez|pośladki|przedramię|czworogłowy|dwugłowy|barki|brzuch",
  travel_places: "plaża|ocean|uzdrowisko|kurort|wieś|park narodowy|wulkan|rezerwat|jaskinia|wybrzeże",
  travel_items: "mapa|przewodnik|pieniądze|karta płatnicza|leki|czapka|kurtka|parasol|butelka|adapter podróżny",
  travel_transport: "łódź|jacht|skuter|helikopter|pieszo|carsharing|kolejka linowa|tuk-tuk|samochód terenowy",
  travel_city: "ratusz|stadion|dworzec|zoo|cmentarz|mury miejskie|wieżowiec|opera|biblioteka|targ",
  travel_hotel: "restauracja|bar|siłownia|parking|sejf|sprzątanie|rezerwacja|meldunek|wymeldowanie|klucz",
};

for (const [id, answers] of Object.entries(additionalAnswers)) {
  const target = Object.values(specificTasks).flat().find(([taskId]) => taskId === id);
  if (target) target[2].push(...list(answers));
}
