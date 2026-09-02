import { avatarHtml, escapeHtml } from "./utils.js?v=20260822-1";
import { inGamePurchaseById } from "./gamePasses.js?v=20260901-13";
import { Audio } from "./audio.js?v=20260902-1";
import { musicCatalogForRegion, musicPreviewCatalog, musicRegionLabel, musicRegionOptions, musicRegionPicker } from "./music.js?v=20260903-1";

const array = value => Array.isArray(value) ? value : [];
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
};
const deadline = seconds => Date.now() + Math.max(1, Number(seconds) || 10) * 1000;
const cleanMetric = value => ["listeners", "artistListeners"].includes(value) ? value : "views";
const normalizedText = value => String(value || "").trim().toLocaleLowerCase("pl-PL");
const POPULARITY_SNAPSHOT_DATE = "02.09.2026";

// Dane są celowo zapisane jako snapshot. Dzięki temu każdy gracz dostaje
// identyczne porównanie, nawet gdy publiczne API jest chwilowo niedostępne.
// Wartości są orientacyjne i służą rozgrywce, a nie jako ranking platformy.
const snapshotRows = [
  ["blinding-lights", "Blinding Lights", "The Weeknd", 4300000000, 108000000],
  ["shape-of-you", "Shape of You", "Ed Sheeran", 6200000000, 82000000],
  ["despacito", "Despacito", "Luis Fonsi", 8600000000, 52000000],
  ["uptown-funk", "Uptown Funk", "Mark Ronson ft. Bruno Mars", 5600000000, 57000000],
  ["see-you-again", "See You Again", "Wiz Khalifa ft. Charlie Puth", 6500000000, 49000000],
  ["perfect", "Perfect", "Ed Sheeran", 3900000000, 83000000],
  ["gangnam-style", "Gangnam Style", "PSY", 5600000000, 31000000],
  ["sugar", "Sugar", "Maroon 5", 4000000000, 47000000],
  ["counting-stars", "Counting Stars", "OneRepublic", 4100000000, 53000000],
  ["believer", "Believer", "Imagine Dragons", 2700000000, 59000000],
  ["dance-monkey", "Dance Monkey", "Tones and I", 2400000000, 37000000],
  ["someone-you-loved", "Someone You Loved", "Lewis Capaldi", 2500000000, 51000000],
  ["stay", "Stay", "The Kid LAROI & Justin Bieber", 2800000000, 67000000],
  ["bad-guy", "bad guy", "Billie Eilish", 1500000000, 82000000],
  ["heat-waves", "Heat Waves", "Glass Animals", 3500000000, 64000000],
  ["sunflower", "Sunflower", "Post Malone & Swae Lee", 2600000000, 61000000],
  ["lovely", "lovely", "Billie Eilish & Khalid", 2100000000, 82000000],
  ["levitating", "Levitating", "Dua Lipa", 1000000000, 68000000],
  ["as-it-was", "As It Was", "Harry Styles", 1100000000, 75000000],
  ["calm-down", "Calm Down", "Rema & Selena Gomez", 1000000000, 49000000],
  ["seven-nation-army", "Seven Nation Army", "The White Stripes", 1100000000, 33000000],
  ["thunder", "Thunder", "Imagine Dragons", 2400000000, 59000000],
  ["radioactive", "Radioactive", "Imagine Dragons", 1800000000, 59000000],
  ["demons", "Demons", "Imagine Dragons", 1600000000, 59000000],
  ["whatever-it-takes", "Whatever It Takes", "Imagine Dragons", 1500000000, 59000000],
  ["natural", "Natural", "Imagine Dragons", 900000000, 59000000],
  ["wolves", "Wolves", "Selena Gomez & Marshmello", 1300000000, 62000000],
  ["faded", "Faded", "Alan Walker", 3700000000, 43000000],
  ["alone", "Alone", "Marshmello", 2200000000, 66000000],
  ["happier", "Happier", "Marshmello & Bastille", 1900000000, 66000000],
  ["closer", "Closer", "The Chainsmokers", 3100000000, 62000000],
  ["something-just-like-this", "Something Just Like This", "The Chainsmokers & Coldplay", 2400000000, 62000000],
  ["dont-let-me-down", "Don't Let Me Down", "The Chainsmokers", 2100000000, 62000000],
  ["roses", "Roses", "The Chainsmokers", 900000000, 62000000],
  ["stereo-hearts", "Stereo Hearts", "Gym Class Heroes", 1100000000, 11000000],
  ["cheap-thrills", "Cheap Thrills", "Sia", 1800000000, 48000000],
  ["chandelier", "Chandelier", "Sia", 2800000000, 48000000],
  ["elastic-heart", "Elastic Heart", "Sia", 1300000000, 48000000],
  ["snowman", "Snowman", "Sia", 800000000, 48000000],
  ["firework", "Firework", "Katy Perry", 1700000000, 52000000],
  ["roar", "Roar", "Katy Perry", 3900000000, 52000000],
  ["dark-horse", "Dark Horse", "Katy Perry", 3500000000, 52000000],
  ["california-gurls", "California Gurls", "Katy Perry", 1600000000, 52000000],
  ["teenage-dream", "Teenage Dream", "Katy Perry", 900000000, 52000000],
  ["halo", "Halo", "Beyoncé", 1900000000, 43000000],
  ["single-ladies", "Single Ladies", "Beyoncé", 1000000000, 43000000],
  ["crazy-in-love", "Crazy in Love", "Beyoncé", 900000000, 43000000],
  ["love-on-top", "Love On Top", "Beyoncé", 800000000, 43000000],
  ["rolling-in-the-deep", "Rolling in the Deep", "Adele", 3000000000, 62000000],
  ["someone-like-you", "Someone Like You", "Adele", 2300000000, 62000000],
  ["hello", "Hello", "Adele", 3300000000, 62000000],
  ["set-fire-to-the-rain", "Set Fire to the Rain", "Adele", 1900000000, 62000000],
  ["easy-on-me", "Easy On Me", "Adele", 1200000000, 62000000],
  ["stressed-out", "Stressed Out", "Twenty One Pilots", 2500000000, 30000000],
  ["ride", "Ride", "Twenty One Pilots", 1500000000, 30000000],
  ["heathens", "Heathens", "Twenty One Pilots", 1900000000, 30000000],
  ["ride-it", "Ride It", "Regard", 1000000000, 27000000],
  ["my-universe", "My Universe", "Coldplay & BTS", 800000000, 72000000],
  ["a-sky-full-of-stars", "A Sky Full of Stars", "Coldplay", 1700000000, 72000000],
  ["yellow", "Yellow", "Coldplay", 800000000, 72000000],
  ["paradise", "Paradise", "Coldplay", 1500000000, 72000000],
  ["viva-la-vida", "Viva La Vida", "Coldplay", 1800000000, 72000000],
  ["fix-you", "Fix You", "Coldplay", 900000000, 72000000],
  ["radio", "Radio", "Lana Del Rey", 500000000, 47000000],
  ["summertime-sadness", "Summertime Sadness", "Lana Del Rey", 950000000, 47000000],
  ["young-and-beautiful", "Young and Beautiful", "Lana Del Rey", 800000000, 47000000],
  ["video-games", "Video Games", "Lana Del Rey", 600000000, 47000000],
  ["starboy", "Starboy", "The Weeknd", 2600000000, 108000000],
  ["save-your-tears", "Save Your Tears", "The Weeknd", 1500000000, 108000000],
  ["the-hills", "The Hills", "The Weeknd", 2300000000, 108000000],
  ["cant-feel-my-face", "Can't Feel My Face", "The Weeknd", 1700000000, 108000000],
  ["i-feel-it-coming", "I Feel It Coming", "The Weeknd", 1300000000, 108000000],
  ["one-dance", "One Dance", "Drake", 2400000000, 80000000],
  ["hotline-bling", "Hotline Bling", "Drake", 2400000000, 80000000],
  ["god-plan", "God's Plan", "Drake", 1800000000, 80000000],
  ["in-my-feelings", "In My Feelings", "Drake", 1300000000, 80000000],
  ["passionfruit", "Passionfruit", "Drake", 700000000, 80000000],
  ["rockstar", "rockstar", "Post Malone ft. 21 Savage", 1300000000, 61000000],
  ["circles", "Circles", "Post Malone", 1600000000, 61000000],
  ["congratulations", "Congratulations", "Post Malone", 1400000000, 61000000],
  ["better-now", "Better Now", "Post Malone", 1000000000, 61000000],
  ["wow", "Wow.", "Post Malone", 1100000000, 61000000],
  ["new-rules", "New Rules", "Dua Lipa", 3200000000, 68000000],
  ["dont-start-now", "Don't Start Now", "Dua Lipa", 2700000000, 68000000],
  ["one-kiss", "One Kiss", "Calvin Harris & Dua Lipa", 1000000000, 68000000],
  ["physical", "Physical", "Dua Lipa", 900000000, 68000000],
  ["idgaf", "IDGAF", "Dua Lipa", 1700000000, 68000000],
  ["watermelon-sugar", "Watermelon Sugar", "Harry Styles", 1200000000, 75000000],
  ["sign-of-the-times", "Sign of the Times", "Harry Styles", 1000000000, 75000000],
  ["golden", "Golden", "Harry Styles", 600000000, 75000000],
  ["late-night-talking", "Late Night Talking", "Harry Styles", 700000000, 75000000],
  ["treat-you-better", "Treat You Better", "Shawn Mendes", 2500000000, 39000000],
  ["stitches", "Stitches", "Shawn Mendes", 1900000000, 39000000],
  ["senorita", "Señorita", "Shawn Mendes & Camila Cabello", 2100000000, 39000000],
  ["theres-nothing-holdin-me-back", "There's Nothing Holdin' Me Back", "Shawn Mendes", 1600000000, 39000000],
  ["havanna", "Havana", "Camila Cabello", 2100000000, 52000000],
  ["never-be-the-same", "Never Be the Same", "Camila Cabello", 700000000, 52000000],
  ["my-oh-my", "My Oh My", "Camila Cabello", 600000000, 52000000],
  ["dont-go-yet", "Don't Go Yet", "Camila Cabello", 500000000, 52000000],
  ["bad-habits", "Bad Habits", "Ed Sheeran", 900000000, 83000000],
  ["photograph", "Photograph", "Ed Sheeran", 1500000000, 83000000],
  ["thinking-out-loud", "Thinking Out Loud", "Ed Sheeran", 3800000000, 83000000],
  ["castle-on-the-hill", "Castle on the Hill", "Ed Sheeran", 1200000000, 83000000],
  ["i-dont-care", "I Don't Care", "Ed Sheeran & Justin Bieber", 1100000000, 83000000],
  ["what-makes-you-beautiful", "What Makes You Beautiful", "One Direction", 1500000000, 17000000],
  ["story-of-my-life", "Story of My Life", "One Direction", 1100000000, 17000000],
  ["night-changes", "Night Changes", "One Direction", 900000000, 17000000],
  ["drag-me-down", "Drag Me Down", "One Direction", 700000000, 17000000],
  ["belly-dancer", "Belly Dancer", "Imanbek", 500000000, 14000000],
  ["head-shoulders-knees-toes", "Head Shoulders Knees & Toes", "Ofenbach & Quarterhead", 800000000, 12000000],
  ["head-down", "Head Down", "Lost Frequencies", 500000000, 14000000],
  ["where-are-you-now", "Where Are Ü Now", "Jack Ü & Justin Bieber", 1500000000, 72000000],
  ["sorry", "Sorry", "Justin Bieber", 3900000000, 72000000],
  ["love-yourself", "Love Yourself", "Justin Bieber", 2200000000, 72000000],
  ["what-do-you-mean", "What Do You Mean?", "Justin Bieber", 2300000000, 72000000],
  ["peaches", "Peaches", "Justin Bieber ft. Daniel Caesar & Giveon", 900000000, 72000000],
  ["baby", "Baby", "Justin Bieber", 3100000000, 72000000],
  ["dont-stop-the-music", "Don't Stop the Music", "Rihanna", 1000000000, 58000000],
  ["diamonds", "Diamonds", "Rihanna", 2200000000, 58000000],
  ["umbrella", "Umbrella", "Rihanna", 1100000000, 58000000],
  ["work", "Work", "Rihanna ft. Drake", 1600000000, 58000000],
  ["only-girl", "Only Girl (In the World)", "Rihanna", 1100000000, 58000000],
  ["tik-tok", "TiK ToK", "Kesha", 700000000, 17000000],
  ["party-in-the-usa", "Party In The U.S.A.", "Miley Cyrus", 1000000000, 36000000],
  ["flowers", "Flowers", "Miley Cyrus", 900000000, 36000000],
  ["wrecking-ball", "Wrecking Ball", "Miley Cyrus", 1200000000, 36000000],
  ["midnight-sky", "Midnight Sky", "Miley Cyrus", 500000000, 36000000],
  ["drivers-license", "drivers license", "Olivia Rodrigo", 900000000, 65000000],
  ["good-4-u", "good 4 u", "Olivia Rodrigo", 1100000000, 65000000],
  ["vampire", "vampire", "Olivia Rodrigo", 500000000, 65000000],
  ["deja-vu", "deja vu", "Olivia Rodrigo", 600000000, 65000000],
  ["espresso", "Espresso", "Sabrina Carpenter", 500000000, 73000000],
  ["please-please-please", "Please Please Please", "Sabrina Carpenter", 350000000, 73000000],
  ["taste", "Taste", "Sabrina Carpenter", 1500000000, 68000000],
  ["feather", "Feather", "Sabrina Carpenter", 300000000, 73000000],
  ["strawberry-blond", "Strawberry Blond", "Mitski", 200000000, 18000000],
  ["running-up-that-hill", "Running Up That Hill", "Kate Bush", 800000000, 11000000],
  ["take-on-me", "Take On Me", "a-ha", 1900000000, 18000000],
  ["never-gonna-give-you-up", "Never Gonna Give You Up", "Rick Astley", 1700000000, 15000000],
  ["everybody-wants-to-rule-the-world", "Everybody Wants to Rule the World", "Tears for Fears", 900000000, 13000000],
  ["africa", "Africa", "TOTO", 900000000, 15000000],
  ["sweet-child-o-mine", "Sweet Child O' Mine", "Guns N' Roses", 1800000000, 25000000],
  ["smells-like-teen-spirit", "Smells Like Teen Spirit", "Nirvana", 2000000000, 25000000],
  ["hotel-california", "Hotel California", "Eagles", 1600000000, 20000000],
  ["dreams", "Dreams", "Fleetwood Mac", 800000000, 19000000],
  ["another-one-bites-the-dust", "Another One Bites the Dust", "Queen", 700000000, 23000000],
  ["bohemian-rhapsody", "Bohemian Rhapsody", "Queen", 1900000000, 23000000],
  ["we-will-rock-you", "We Will Rock You", "Queen", 800000000, 23000000],
  ["the-final-countdown", "The Final Countdown", "Europe", 800000000, 9000000],
  ["thats-life", "That's Life", "Frank Sinatra", 300000000, 9000000],
  ["what-a-wonderful-world", "What a Wonderful World", "Louis Armstrong", 600000000, 10000000],
  ["cant-help-falling-in-love", "Can't Help Falling in Love", "Elvis Presley", 800000000, 12000000],
  ["love-me-tender", "Love Me Tender", "Elvis Presley", 300000000, 12000000],
  ["stayin-alive", "Stayin' Alive", "Bee Gees", 900000000, 18000000],
  ["how-deep-is-your-love", "How Deep Is Your Love", "Bee Gees", 600000000, 18000000],
  ["mamma-mia", "Mamma Mia", "ABBA", 700000000, 22000000],
  ["dancing-queen", "Dancing Queen", "ABBA", 800000000, 22000000],
  ["gimme-gimme-gimme", "Gimme! Gimme! Gimme!", "ABBA", 500000000, 22000000],
  ["waterloo", "Waterloo", "ABBA", 300000000, 22000000],
  ["macarena", "Macarena", "Los del Río", 800000000, 9000000],
  ["la-bamba", "La Bamba", "Ritchie Valens", 600000000, 8000000],
  ["bailando", "Bailando", "Enrique Iglesias", 3800000000, 27000000],
  ["subeme-la-radio", "Súbeme la Radio", "Enrique Iglesias", 1600000000, 27000000],
  ["despacito-remix", "Despacito (Remix)", "Luis Fonsi & Daddy Yankee", 1900000000, 52000000],
  ["taki-taki", "Taki Taki", "DJ Snake", 2600000000, 30000000],
  ["turn-down-for-what", "Turn Down for What", "DJ Snake & Lil Jon", 1300000000, 30000000],
  ["get-lucky", "Get Lucky", "Daft Punk ft. Pharrell Williams", 1500000000, 29000000],
  ["one-more-time", "One More Time", "Daft Punk", 600000000, 29000000],
  ["harder-better-faster-stronger", "Harder, Better, Faster, Stronger", "Daft Punk", 800000000, 29000000],
  ["animals", "Animals", "Martin Garrix", 1800000000, 24000000],
  ["scared-to-be-lonely", "Scared to Be Lonely", "Martin Garrix & Dua Lipa", 1000000000, 24000000],
  ["in-the-name-of-love", "In the Name of Love", "Martin Garrix & Bebe Rexha", 1100000000, 24000000],
  ["this-is-what-you-came-for", "This Is What You Came For", "Calvin Harris & Rihanna", 1400000000, 30000000],
  ["summer", "Summer", "Calvin Harris", 1200000000, 30000000],
  ["feel-so-close", "Feel So Close", "Calvin Harris", 700000000, 30000000],
  ["outside", "Outside", "Calvin Harris & Ellie Goulding", 900000000, 30000000],
  ["rather-be", "Rather Be", "Clean Bandit ft. Jess Glynne", 1700000000, 28000000],
  ["rockabye", "Rockabye", "Clean Bandit ft. Sean Paul & Anne-Marie", 3100000000, 28000000],
  ["symphony", "Symphony", "Clean Bandit ft. Zara Larsson", 1100000000, 28000000],
  ["headlines", "Headlines", "Drake", 400000000, 80000000],
  ["lovely-day", "Lovely Day", "Bill Withers", 500000000, 12000000],
  ["aint-no-sunshine", "Ain't No Sunshine", "Bill Withers", 500000000, 12000000],
  ["superstition", "Superstition", "Stevie Wonder", 700000000, 17000000],
  ["isnt-she-lovely", "Isn't She Lovely", "Stevie Wonder", 500000000, 17000000],
  ["lets-get-it-started", "Let's Get It Started", "The Black Eyed Peas", 1000000000, 17000000],
  ["i-gotta-feeling", "I Gotta Feeling", "The Black Eyed Peas", 1400000000, 17000000],
  ["boom-boom-pow", "Boom Boom Pow", "The Black Eyed Peas", 700000000, 17000000],
  ["just-the-way-you-are", "Just the Way You Are", "Bruno Mars", 2200000000, 60000000],
  ["locked-out-of-heaven", "Locked Out of Heaven", "Bruno Mars", 1500000000, 60000000],
  ["when-i-was-your-man", "When I Was Your Man", "Bruno Mars", 1300000000, 60000000],
  ["24k-magic", "24K Magic", "Bruno Mars", 1600000000, 60000000],
  ["thats-what-i-like", "That's What I Like", "Bruno Mars", 1800000000, 60000000],
  ["treasure", "Treasure", "Bruno Mars", 900000000, 60000000],
  ["kiss-me-more", "Kiss Me More", "Doja Cat & SZA", 2100000000, 75000000],
  ["say-so", "Say So", "Doja Cat", 2200000000, 75000000],
  ["woman", "Woman", "Doja Cat", 1400000000, 75000000],
  ["paint-the-town-red", "Paint The Town Red", "Doja Cat", 1500000000, 75000000],
  ["snooze", "Snooze", "SZA", 500000000, 57000000],
  ["kill-bill", "Kill Bill", "SZA", 600000000, 57000000],
  ["all-the-stars", "All The Stars", "Kendrick Lamar & SZA", 700000000, 57000000],
  ["humble", "HUMBLE.", "Kendrick Lamar", 1000000000, 34000000],
  ["not-like-us", "Not Like Us", "Kendrick Lamar", 700000000, 34000000],
  ["lose-yourself", "Lose Yourself", "Eminem", 900000000, 40000000],
  ["without-me", "Without Me", "Eminem", 900000000, 40000000],
  ["mockingbird", "Mockingbird", "Eminem", 700000000, 40000000],
  ["rap-god", "Rap God", "Eminem", 1700000000, 40000000],
  ["lovestory", "Love Story", "Taylor Swift", 700000000, 100000000],
  ["blank-space", "Blank Space", "Taylor Swift", 3400000000, 100000000],
  ["shake-it-off", "Shake It Off", "Taylor Swift", 3700000000, 100000000],
  ["anti-hero", "Anti-Hero", "Taylor Swift", 800000000, 100000000],
  ["cruel-summer", "Cruel Summer", "Taylor Swift", 700000000, 100000000],
  ["fortnight", "Fortnight", "Taylor Swift ft. Post Malone", 200000000, 100000000],
  ["party-4-u", "party 4 u", "Charli xcx", 200000000, 26000000],
  ["360", "360", "Charli xcx", 300000000, 26000000],
  ["boom-clap", "Boom Clap", "Charli xcx", 900000000, 26000000],
  ["unwritten", "Unwritten", "Natasha Bedingfield", 800000000, 15000000],
  ["pumped-up-kicks", "Pumped Up Kicks", "Foster the People", 1900000000, 18000000],
  ["little-talks", "Little Talks", "Of Monsters and Men", 900000000, 15000000],
  ["riptide", "Riptide", "Vance Joy", 700000000, 16000000],
  ["ho-hey", "Ho Hey", "The Lumineers", 700000000, 16000000],
  ["take-me-to-church", "Take Me to Church", "Hozier", 1600000000, 30000000],
  ["too-sweet", "Too Sweet", "Hozier", 300000000, 30000000],
  ["do-i-wanna-know", "Do I Wanna Know?", "Arctic Monkeys", 1100000000, 32000000],
  ["505", "505", "Arctic Monkeys", 600000000, 32000000],
  ["why-d-this-you-only-call-me-when-youre-high", "Why'd You Only Call Me When You're High?", "Arctic Monkeys", 500000000, 32000000],
  ["sweater-weather", "Sweater Weather", "The Neighbourhood", 1300000000, 42000000],
  ["daddy-issues", "Daddy Issues", "The Neighbourhood", 700000000, 42000000],
  ["everybody-talks", "Everybody Talks", "Neon Trees", 700000000, 10000000],
  ["poker-face", "Poker Face", "Lady Gaga", 2100000000, 80000000],
  ["bad-romance", "Bad Romance", "Lady Gaga", 2300000000, 80000000],
  ["shallow", "Shallow", "Lady Gaga & Bradley Cooper", 1800000000, 80000000],
  ["applause", "Applause", "Lady Gaga", 600000000, 55000000],
  ["just-dance", "Just Dance", "Lady Gaga & Colby O'Donis", 1900000000, 80000000],
  ["if-i-aint-got-you", "If I Ain't Got You", "Alicia Keys", 800000000, 26000000],
  ["no-one", "No One", "Alicia Keys", 700000000, 26000000],
  ["fallin", "Fallin'", "Alicia Keys", 500000000, 26000000],
  ["empire-state-of-mind", "Empire State of Mind", "JAY-Z ft. Alicia Keys", 1000000000, 26000000],
  ["ordinary-people", "Ordinary People", "John Legend", 500000000, 21000000],
  ["all-of-me", "All of Me", "John Legend", 2500000000, 21000000],
  ["love-me-like-you-do", "Love Me Like You Do", "Ellie Goulding", 2300000000, 30000000],
  ["burn", "Burn", "Ellie Goulding", 1000000000, 30000000],
  ["lights", "Lights", "Ellie Goulding", 800000000, 30000000],
  ["i-will-always-love-you", "I Will Always Love You", "Whitney Houston", 800000000, 18000000],
  ["greatest-love-of-all", "Greatest Love of All", "Whitney Houston", 400000000, 18000000],
  ["toxic", "Toxic", "Britney Spears", 1000000000, 30000000],
  ["baby-one-more-time", "...Baby One More Time", "Britney Spears", 900000000, 30000000],
  ["oops-i-did-it-again", "Oops!... I Did It Again", "Britney Spears", 600000000, 30000000],
  ["genie-in-a-bottle", "Genie in a Bottle", "Christina Aguilera", 500000000, 14000000],
  ["complicated", "Complicated", "Avril Lavigne", 700000000, 19000000],
  ["sk8er-boi", "Sk8er Boi", "Avril Lavigne", 600000000, 19000000],
  ["girlfriend", "Girlfriend", "Avril Lavigne", 700000000, 19000000],
  ["bring-me-to-life", "Bring Me to Life", "Evanescence", 1700000000, 17000000],
  ["in-the-end", "In the End", "Linkin Park", 1800000000, 36000000],
  ["numb", "Numb", "Linkin Park", 2000000000, 36000000],
  ["what-ive-done", "What I've Done", "Linkin Park", 800000000, 36000000],
  ["somewhere-i-belong", "Somewhere I Belong", "Linkin Park", 500000000, 36000000],
  ["bury-a-friend", "bury a friend", "Billie Eilish", 900000000, 82000000],
  ["when-the-partys-over", "when the party's over", "Billie Eilish", 1300000000, 82000000],
  ["everything-i-wanted", "everything i wanted", "Billie Eilish", 900000000, 82000000],
  ["ocean-eyes", "ocean eyes", "Billie Eilish", 1100000000, 82000000],
  ["therefore-i-am", "Therefore I Am", "Billie Eilish", 700000000, 82000000],
  ["sweet-but-psycho", "Sweet but Psycho", "Ava Max", 900000000, 25000000],
  ["kings-and-queens", "Kings & Queens", "Ava Max", 700000000, 25000000],
  ["my-head-my-heart", "My Head & My Heart", "Ava Max", 500000000, 25000000],
  ["happier-than-ever", "Happier Than Ever", "Billie Eilish", 800000000, 82000000],
  ["positions", "positions", "Ariana Grande", 1500000000, 95200000],
  ["7-rings", "7 rings", "Ariana Grande", 1900000000, 95200000],
  ["thank-u-next", "thank u, next", "Ariana Grande", 2300000000, 95200000],
  ["no-tears-left-to-cry", "No Tears Left to Cry", "Ariana Grande", 1800000000, 95200000],
  ["into-you", "Into You", "Ariana Grande", 1000000000, 86000000],
  ["we-cant-stop", "We Can't Stop", "Miley Cyrus", 1200000000, 36000000],
  ["aint-it-fun", "Ain't It Fun", "Paramore", 700000000, 15000000],
  ["still-into-you", "Still Into You", "Paramore", 700000000, 15000000],
  ["misery-business", "Misery Business", "Paramore", 600000000, 15000000],
  ["the-night-we-met", "The Night We Met", "Lord Huron", 800000000, 15000000],
  ["way-down-we-go", "Way Down We Go", "KALEO", 800000000, 10000000],
  ["little-dark-age", "Little Dark Age", "MGMT", 500000000, 18000000],
  ["kids", "Kids", "MGMT", 500000000, 18000000],
  ["electric-feel", "Electric Feel", "MGMT", 400000000, 18000000],
  ["midnight-city", "Midnight City", "M83", 400000000, 17000000],
  ["on-top-of-the-world", "On Top of the World", "Imagine Dragons", 700000000, 59000000],
  ["walking-on-a-dream", "Walking on a Dream", "Empire of the Sun", 500000000, 13000000],
  ["pursuit-of-happiness", "Pursuit of Happiness", "Kid Cudi", 700000000, 20000000],
  ["day-n-night", "Day 'N' Nite", "Kid Cudi", 600000000, 20000000],
  ["goosebumps", "goosebumps", "Travis Scott", 1300000000, 44000000],
  ["sicko-mode", "SICKO MODE", "Travis Scott", 1200000000, 44000000],
  ["highest-in-the-room", "HIGHEST IN THE ROOM", "Travis Scott", 700000000, 44000000],
  ["lovely-island", "Island in the Sun", "Weezer", 400000000, 12000000],
  ["mr-brightside", "Mr. Brightside", "The Killers", 800000000, 19000000],
  ["somebody-told-me", "Somebody Told Me", "The Killers", 400000000, 19000000],
  ["use-somebody", "Use Somebody", "Kings of Leon", 700000000, 15000000],
  ["sex-on-fire", "Sex on Fire", "Kings of Leon", 700000000, 15000000],
  ["are-you-gonna-be-my-girl", "Are You Gonna Be My Girl", "Jet", 500000000, 10000000],
  ["feel-it-still", "Feel It Still", "Portugal. The Man", 900000000, 16000000],
  ["sit-next-to-me", "Sit Next to Me", "Foster the People", 400000000, 18000000],
  ["good-days", "Good Days", "SZA", 700000000, 57000000],
  ["loving-you", "Loving You", "Minnie Riperton", 300000000, 7000000],
  ["back-to-black", "Back to Black", "Amy Winehouse", 500000000, 17000000],
  ["valerie", "Valerie", "Amy Winehouse", 700000000, 17000000],
  ["rehab", "Rehab", "Amy Winehouse", 600000000, 17000000],
  ["dog-days-are-over", "Dog Days Are Over", "Florence + The Machine", 900000000, 21000000],
  ["shake-it-out", "Shake It Out", "Florence + The Machine", 400000000, 21000000],
  ["youve-got-the-love", "You've Got the Love", "Florence + The Machine", 400000000, 21000000],
  ["the-less-i-know-the-better", "The Less I Know The Better", "Tame Impala", 800000000, 29000000],
  ["borderline", "Borderline", "Tame Impala", 300000000, 29000000],
  ["let-it-happen", "Let It Happen", "Tame Impala", 500000000, 29000000],
  ["space-song", "Space Song", "Beach House", 600000000, 25000000],
  ["my-kind-of-woman", "My Kind of Woman", "Mac DeMarco", 400000000, 14000000],
  ["sunsetz", "Sunsetz", "Cigarettes After Sex", 300000000, 18000000],
  ["apocalypse", "Apocalypse", "Cigarettes After Sex", 300000000, 18000000],
  ["nothing-breaks-like-a-heart", "Nothing Breaks Like a Heart", "Mark Ronson ft. Miley Cyrus", 700000000, 57000000],
  ["dont-you-worry-child", "Don't You Worry Child", "Swedish House Mafia", 900000000, 12000000],
  ["greyhound", "Greyhound", "Swedish House Mafia", 400000000, 12000000],
  ["calling", "Calling (Lose My Mind)", "Sebastian Ingrosso & Alesso", 400000000, 9000000],
  ["language", "Language", "Porter Robinson", 300000000, 12000000],
  ["shelter", "Shelter", "Porter Robinson & Madeon", 400000000, 12000000],
  ["strobe", "Strobe", "deadmau5", 400000000, 10000000],
  ["ghosts-n-stuff", "Ghosts 'n' Stuff", "deadmau5", 400000000, 10000000],
  ["levels", "Levels", "Avicii", 1100000000, 29000000],
  ["wake-me-up", "Wake Me Up", "Avicii", 2400000000, 29000000],
  ["the-nights", "The Nights", "Avicii", 1000000000, 29000000],
  ["hey-brother", "Hey Brother", "Avicii", 800000000, 29000000],
  ["waiting-for-love", "Waiting For Love", "Avicii", 900000000, 29000000],
  ["on-the-floor", "On the Floor", "Jennifer Lopez ft. Pitbull", 2300000000, 26000000],
  ["give-me-everything", "Give Me Everything", "Pitbull ft. Ne-Yo", 1600000000, 26000000],
  ["timber", "Timber", "Pitbull ft. Kesha", 1500000000, 26000000],
  ["international-love", "International Love", "Pitbull ft. Chris Brown", 1100000000, 26000000],
  ["rather-be-clean-bandit", "Rather Be", "Clean Bandit", 1700000000, 28000000],
  ["greedy-tate", "greedy", "Tate McRae", 1200000000, 78000000],
  ["exes-tate", "exes", "Tate McRae", 350000000, 78000000],
  ["beautiful-things", "Beautiful Things", "Benson Boone", 800000000, 70000000],
  ["a-bar-song", "A Bar Song (Tipsy)", "Shaboozey", 700000000, 55000000],
  ["i-had-some-help", "I Had Some Help", "Post Malone & Morgan Wallen", 1000000000, 65000000],
  ["last-night", "Last Night", "Morgan Wallen", 700000000, 65000000],
  ["you-proof", "You Proof", "Morgan Wallen", 650000000, 65000000],
  ["whiskey-glasses", "Whiskey Glasses", "Morgan Wallen", 800000000, 65000000],
  ["good-luck-babe", "Good Luck, Babe!", "Chappell Roan", 1200000000, 48000000],
  ["pink-pony-club", "Pink Pony Club", "Chappell Roan", 450000000, 50000000],
  ["hot-to-go", "HOT TO GO!", "Chappell Roan", 700000000, 50000000],
  ["red-wine-supernova", "Red Wine Supernova", "Chappell Roan", 300000000, 50000000],
  ["end-of-beginning", "End of Beginning", "Djo", 650000000, 40000000],
  ["golden-hour", "golden hour", "JVKE", 1200000000, 25000000],
  ["until-i-found-you", "Until I Found You", "Stephen Sanchez", 700000000, 30000000],
  ["heather", "Heather", "Conan Gray", 900000000, 22000000],
  ["maniac-conan", "Maniac", "Conan Gray", 450000000, 22000000],
  ["from-the-start", "From The Start", "Laufey", 450000000, 35000000],
  ["valentine-laufey", "Valentine", "Laufey", 250000000, 35000000],
  ["i-like-the-way-you-kiss-me", "i like the way you kiss me", "Artemas", 450000000, 32000000],
  ["birds-of-a-feather", "BIRDS OF A FEATHER", "Billie Eilish", 900000000, 82000000],
  ["lunch", "LUNCH", "Billie Eilish", 450000000, 82000000],
  ["am-i-wrong", "Am I Wrong", "Nico & Vinz", 1000000000, 18000000],
  ["old-town-road", "Old Town Road", "Lil Nas X", 2700000000, 35000000],
  ["montero", "MONTERO (Call Me By Your Name)", "Lil Nas X", 1100000000, 35000000],
  ["industry-baby", "INDUSTRY BABY", "Lil Nas X & Jack Harlow", 1000000000, 35000000],
  ["the-real-slim-shady", "The Real Slim Shady", "Eminem", 900000000, 40000000],
  ["stan", "Stan", "Eminem", 800000000, 40000000],
  ["godzilla", "Godzilla", "Eminem ft. Juice WRLD", 1000000000, 40000000],
  ["super-bass", "Super Bass", "Nicki Minaj", 700000000, 30000000],
  ["starships", "Starships", "Nicki Minaj", 1000000000, 30000000],
  ["anaconda", "Anaconda", "Nicki Minaj", 1000000000, 30000000],
  ["mood", "Mood", "24kGoldn ft. iann dior", 1200000000, 30000000],
  ["provenza", "PROVENZA", "Karol G", 1300000000, 50000000],
  ["tusa", "Tusa", "Karol G & Nicki Minaj", 1800000000, 50000000],
  ["qlona", "QLONA", "Karol G & Peso Pluma", 800000000, 50000000],
  ["mi-gente", "Mi Gente", "J Balvin & Willy William", 3200000000, 55000000],
  ["ginza", "Ginza", "J Balvin", 1100000000, 55000000],
  ["ay-vamos", "Ay Vamos", "J Balvin", 1400000000, 55000000],
  ["waka-waka", "Waka Waka (This Time for Africa)", "Shakira", 4000000000, 45000000],
  ["hips-dont-lie", "Hips Don't Lie", "Shakira ft. Wyclef Jean", 1800000000, 45000000],
  ["chantaje", "Chantaje", "Shakira ft. Maluma", 2800000000, 45000000],
  ["te-felicito", "Te Felicito", "Shakira & Rauw Alejandro", 700000000, 45000000],
  ["x-nicky-jam", "X", "Nicky Jam & J Balvin", 2200000000, 35000000],
  ["felices-los-4", "Felices los 4", "Maluma", 2000000000, 40000000],
  ["hawai", "Hawái", "Maluma", 1200000000, 40000000],
  ["me-porto-bonito", "Me Porto Bonito", "Bad Bunny & Chencho Corleone", 1200000000, 75000000],
  ["dakiti", "DÁKITI", "Bad Bunny & Jhayco", 1200000000, 75000000],
  ["titi-me-pregunto", "Tití Me Preguntó", "Bad Bunny", 700000000, 75000000],
  ["un-x100to", "un x100to", "Grupo Frontera & Bad Bunny", 600000000, 75000000],
  ["despecha", "DESPECHÁ", "ROSALÍA", 700000000, 30000000],
  ["con-altura", "Con Altura", "ROSALÍA & J Balvin", 1000000000, 30000000],
  ["malamente", "MALAMENTE", "ROSALÍA", 700000000, 30000000],
  ["todo-de-ti", "Todo de Ti", "Rauw Alejandro", 1000000000, 50000000],
  ["se-preparo", "Se Preparó", "Ozuna", 1000000000, 45000000],
  ["la-modelo", "La Modelo", "Ozuna & Cardi B", 1000000000, 45000000],
  ["dynamite", "Dynamite", "BTS", 2100000000, 35000000],
  ["butter", "Butter", "BTS", 900000000, 35000000],
  ["boy-with-luv", "Boy With Luv", "BTS ft. Halsey", 1700000000, 35000000],
  ["fake-love", "FAKE LOVE", "BTS", 1400000000, 35000000],
  ["on-bts", "ON", "BTS", 600000000, 35000000],
  ["how-you-like-that", "How You Like That", "BLACKPINK", 1500000000, 45000000],
  ["ddu-du-ddu-du", "DDU-DU DDU-DU", "BLACKPINK", 2200000000, 45000000],
  ["kill-this-love", "Kill This Love", "BLACKPINK", 2000000000, 45000000],
  ["pink-venom", "Pink Venom", "BLACKPINK", 900000000, 45000000],
  ["lovesick-girls", "Lovesick Girls", "BLACKPINK", 800000000, 45000000],
  ["super-shy", "Super Shy", "NewJeans", 300000000, 40000000],
  ["hype-boy", "Hype Boy", "NewJeans", 350000000, 40000000],
  ["ditto", "Ditto", "NewJeans", 300000000, 40000000],
  ["magnetic", "Magnetic", "ILLIT", 200000000, 30000000],
  ["queencard", "Queencard", "(G)I-DLE", 300000000, 28000000],
  ["love-dive", "LOVE DIVE", "IVE", 300000000, 35000000],
  ["after-like", "After LIKE", "IVE", 250000000, 35000000],
  ["gods-menu", "God's Menu", "Stray Kids", 500000000, 30000000],
  ["maniac-stray-kids", "MANIAC", "Stray Kids", 400000000, 30000000],
  ["s-class", "S-Class", "Stray Kids", 250000000, 30000000],
  ["eight", "eight", "IU ft. SUGA", 300000000, 25000000],
  ["love-wins-all", "Love wins all", "IU", 250000000, 25000000],
  ["smoke-on-the-water", "Smoke on the Water", "Deep Purple", 700000000, 8000000],
  ["sweet-dreams-eurythmics", "Sweet Dreams (Are Made of This)", "Eurythmics", 1000000000, 10000000],
  ["dont-stop-me-now", "Don't Stop Me Now", "Queen", 1400000000, 23000000],
  ["we-are-the-champions", "We Are the Champions", "Queen", 900000000, 23000000],
  ["under-pressure", "Under Pressure", "Queen & David Bowie", 1000000000, 23000000],
  ["fluorescent-adolescent", "Fluorescent Adolescent", "Arctic Monkeys", 500000000, 32000000],
  ["r-u-mine", "R U Mine?", "Arctic Monkeys", 700000000, 32000000],
  ["the-adults-are-talking", "The Adults Are Talking", "The Strokes", 300000000, 22000000],
  ["reptilia", "Reptilia", "The Strokes", 250000000, 22000000],
  ["sound-of-silence-disturbed", "The Sound of Silence", "Disturbed", 800000000, 9000000],
  ["my-immortal", "My Immortal", "Evanescence", 800000000, 17000000],
  ["wake-me-up-when-september-ends", "Wake Me Up When September Ends", "Green Day", 800000000, 14000000],
  ["boulevard-of-broken-dreams", "Boulevard of Broken Dreams", "Green Day", 1200000000, 14000000],
  ["american-idiot", "American Idiot", "Green Day", 600000000, 14000000],
  ["crawling", "Crawling", "Linkin Park", 800000000, 36000000],
  ["faint", "Faint", "Linkin Park", 700000000, 36000000],
  ["given-up", "Given Up", "Linkin Park", 500000000, 36000000],
  ["last-resort", "Last Resort", "Papa Roach", 900000000, 13000000],
  ["the-reason", "The Reason", "Hoobastank", 800000000, 12000000],
  ["iris", "Iris", "Goo Goo Dolls", 1000000000, 12000000],
  ["chasing-cars", "Chasing Cars", "Snow Patrol", 900000000, 11000000],
  ["somebody-else", "Somebody Else", "The 1975", 500000000, 25000000],
  ["robbers", "Robbers", "The 1975", 250000000, 25000000],
  ["tongue-tied", "Tongue Tied", "Grouplove", 600000000, 12000000],
  ["malomiasteczkowy", "Małomiasteczkowy", "Dawid Podsiadło", 160000000, 2500000],
  ["nie-ma-fal", "Nie ma fal", "Dawid Podsiadło", 130000000, 2500000],
  ["trojkaty-i-kwadraty", "Trójkąty i kwadraty", "Dawid Podsiadło", 110000000, 2500000],
  ["pastempomat", "Pastempomat", "Dawid Podsiadło", 90000000, 2500000],
  ["w-dobra-strone", "W dobrą stronę", "Dawid Podsiadło", 75000000, 2500000],
  ["szampan", "Szampan", "sanah", 180000000, 3200000],
  ["ale-jazz", "Ale jazz!", "sanah", 140000000, 3200000],
  ["ten-stan", "ten Stan", "sanah", 100000000, 3200000],
  ["dwie-zero-zero", "2:00", "sanah", 80000000, 3200000],
  ["kolonska-i-szlugi", "kolońska i szlugi", "sanah", 80000000, 3200000],
  ["melodia-sanah", "Melodia", "sanah", 80000000, 3200000],
  ["krolowa-dram", "Królowa dram", "sanah", 50000000, 3200000],
  ["ostatnia-nadzieja", "Ostatnia nadzieja", "sanah & Dawid Podsiadło", 55000000, 3200000],
  ["polskie-tango", "Polskie Tango", "Taco Hemingway", 90000000, 1500000],
  ["nostalgia-taco", "Nostalgia", "Taco Hemingway", 90000000, 1500000],
  ["deszcz-na-betonie", "Deszcz na betonie", "Taco Hemingway", 70000000, 1500000],
  ["fiji-taco", "Fiji", "Taco Hemingway", 60000000, 1500000],
  ["moj-czy-twoj", "Mój czy twój?", "Quebonafide", 80000000, 1800000],
  ["candy-quebonafide", "Candy", "Quebonafide", 70000000, 1800000],
  ["bubbletea", "Bubbletea", "Quebonafide", 60000000, 1800000],
  ["szubienicapestycydybron", "SZUBIENICAPESTYCYDYBROŃ", "Quebonafide", 50000000, 1800000],
  ["patointeligencja", "Patointeligencja", "Mata", 110000000, 1200000],
  ["kiss-cam", "Kiss cam (podryw roku)", "Mata", 70000000, 1200000],
  ["100-dni-do-matury", "100 dni do matury", "Mata", 55000000, 1200000],
  ["papuga", "PAPUGA", "Quebonafide ft. Malik Montana", 80000000, 1800000],
  ["gombao-33", "GOMBAO 33", "Quebonafide", 75000000, 1800000],
  ["mniej-niz-zero", "Mniej niż zero", "Lady Pank", 80000000, 900000],
  ["zawsze-tam-gdzie-ty", "Zawsze tam, gdzie Ty", "Lady Pank", 80000000, 900000],
  ["dmuchawce-latawce-wiatr", "Dmuchawce, latawce, wiatr", "Urszula", 50000000, 600000],
  ["biala-armia", "Biała armia", "Bajm", 60000000, 700000],
  ["jest-taki-dzien", "Jest taki dzień", "Czerwone Gitary", 70000000, 600000],
  ["nie-pytaj-o-polske", "Nie pytaj o Polskę", "Obywatel G.C.", 40000000, 500000],
  ["dlugosc-dzwieku-samotnosci", "Długość dźwięku samotności", "Myslovitz", 100000000, 900000],
  ["zanim-pojde", "Zanim pójdę", "Happysad", 100000000, 800000],
  ["bby-wow", "BbY WOW", "KAROL G, Judeline & rusowsky", 80000000, 52000000],
  ["dai-dai", "Dai Dai", "Shakira & Burna Boy", 90000000, 52000000],
  ["ordinary", "Ordinary", "Alex Warren", 1400000000, 57000000],
  ["swim", "SWIM", "BTS", 90000000, 41000000],
  ["petal", "petal", "Ariana Grande", 102000000, 95200000],
  ["hate-that-i-made-you-love-me", "hate that i made you love me", "Ariana Grande", 440000000, 95200000],
  ["like-i-do", "like i do", "Ariana Grande", 410000000, 95200000],
  ["kiss-me-ariana", "kiss me", "Ariana Grande", 350000000, 95200000],
  ["one-last-time", "One Last Time", "Ariana Grande", 1700000000, 95200000],
  ["streets", "Streets", "Doja Cat", 1300000000, 75000000],
  ["agora-hills", "Agora Hills", "Doja Cat", 850000000, 75000000],
  ["need-to-know", "Need To Know", "Doja Cat", 1050000000, 75000000],
  ["you-right", "You Right", "Doja Cat & The Weeknd", 900000000, 75000000],
  ["paparazzi", "Paparazzi", "Lady Gaga", 1400000000, 80000000],
  ["abracadabra", "Abracadabra", "Lady Gaga", 400000000, 80000000],
  ["always-remember-us-this-way", "Always Remember Us This Way", "Lady Gaga", 1300000000, 80000000],
  ["telephone", "Telephone", "Lady Gaga & Beyoncé", 1200000000, 80000000],
];

const polishMusicCatalog = musicCatalogForRegion("polish");
const polishTrackKeys = new Set(polishMusicCatalog.map(track => normalizedText(`${track.title} ${track.artist}`)));
function splitArtistCredits(value) {
  const source = String(value || "").trim();
  if (!source) return [];
  const normalized = source.replace(/\s+(?:feat\.?|ft\.?|featuring|with)\s+/gi, " & ");
  return [...new Set(normalized.split(/\s*(?:&|,)\s*/).map(item => item.trim()).filter(Boolean))];
}
const polishArtistKeys = new Set(polishMusicCatalog.flatMap(track => splitArtistCredits(track.artist)).map(normalizedText));
const hasPolishArtistCredit = artist => splitArtistCredits(artist).some(item => polishArtistKeys.has(normalizedText(item)));
const basePopularityTracks = snapshotRows.map(([id, title, artist, views, listeners, region]) => ({
  id, title, artist, views, listeners, region:region === "polish" || polishTrackKeys.has(normalizedText(`${title} ${artist}`)) || hasPolishArtistCredit(artist) ? "polish" : "global",
  query: `${title} ${artist}`,
}));
const existingPopularityKeys = new Set(basePopularityTracks.map(track => normalizedText(`${track.title} ${track.artist}`)));
const extraGlobalPopularityTracks = musicCatalogForRegion("global")
  .filter(track => String(track.id || "").startsWith("itunes-") && !existingPopularityKeys.has(normalizedText(`${track.title} ${track.artist}`)))
  .map((track, index) => ({
    id:`global-pop-${index}`,
    title:track.title,
    artist:track.artist,
    // To ten sam stały, lokalny snapshot używany przez grę — nie udaje
    // bieżącego odczytu statystyk z zewnętrznego API.
    views:Math.max(18000000, 1500000000 - index * 9100000),
    listeners:Math.max(900000, 88000000 - index * 470000),
    region:"global",
    query:`${track.title} ${track.artist}`,
  }));
const extraPolishPopularityTracks = polishMusicCatalog.filter(track => !existingPopularityKeys.has(normalizedText(`${track.title} ${track.artist}`))).map((track, index) => ({
  id:`polish-pop-${index}`,
  title:track.title,
  artist:track.artist,
  // Statystyki są stałym, lokalnym snapshotem do gry; ich proporcje są
  // celowo wiarygodne, ale nie udają bieżącego odczytu z API.
  views:Math.max(12000000, 138000000 - index * 870000),
  listeners:Math.max(180000, 4200000 - index * 22000),
  region:"polish",
  query:`${track.title} ${track.artist}`,
}));
export const popularityTracks = [...basePopularityTracks, ...extraGlobalPopularityTracks, ...extraPolishPopularityTracks];

export const popularityLibrarySize = popularityTracks.length;
function artistEntryTrack(track, artist) {
  return { ...track, id:`${track.id}::${encodeURIComponent(normalizedText(artist))}`, artist };
}
const artistIndex = new Map();
popularityTracks.forEach(track => {
  splitArtistCredits(track.artist).forEach(artist => {
    const key = normalizedText(artist), artistTrack = artistEntryTrack(track, artist), current = artistIndex.get(key);
    if (!current) {
      artistIndex.set(key, { id:`artist-${encodeURIComponent(key)}`, artist, listeners:Number(track.listeners) || 0, region:track.region || "global", topTrack:artistTrack });
      return;
    }
    artistIndex.set(key, {
      ...current,
      listeners:Math.max(Number(current.listeners) || 0, Number(track.listeners) || 0),
      region:current.region === "polish" || track.region === "polish" ? "polish" : "global",
      topTrack:Number(track.views) > Number(current.topTrack?.views) ? artistTrack : current.topTrack,
    });
  });
});
export const popularityArtists = [...artistIndex.values()].map(artist => ({
  ...artist,
  query: `${artist.topTrack.title} ${artist.topTrack.artist}`,
}));
export const popularityArtistLibrarySize = popularityArtists.length;
export const popularityDefaults = { rounds: 10, choiceTime: 10, metric: "views", reversed: false, region: "global" };

export function sanitizePopularitySettings(settings = {}) {
  return {
    rounds: clamp(settings.rounds, 3, 30, popularityDefaults.rounds),
    choiceTime: clamp(settings.choiceTime ?? settings.answerTime, 5, 30, popularityDefaults.choiceTime),
    metric: cleanMetric(settings.metric),
    reversed: settings.reversed === true || String(settings.reversed) === "true",
    region: settings.region === "polish" ? "polish" : "global",
  };
}

function trackById(id) { return popularityTracks.find(track => track.id === id) || null; }
function cloneTrack(track) { return track ? { id:track.id, title:track.title, artist:track.artist, views:track.views, listeners:track.listeners, region:track.region || "global" } : null; }
function cloneCompetitionItem(item, metric = "views") {
  if (!item) return null;
  if (cleanMetric(metric) === "artistListeners") return { id:item.id, artist:item.artist, listeners:item.listeners, region:item.region || item.topTrack?.region || "global", topTrack:cloneTrack(item.topTrack), query:item.query || trackQuery(item.topTrack) };
  return cloneTrack(item);
}
function trackQuery(track) { return String(track?.query || `${track?.title || ""} ${track?.artist || ""}`).trim(); }
function pairKey(pair) { return array(pair).map(track => track?.id || "").sort().join("|"); }
function nextPair(usedIds = [], metric = "views", region = "global") {
  const selectedRegion = region === "polish" ? "polish" : "global";
  const pool = (cleanMetric(metric) === "artistListeners" ? popularityArtists : popularityTracks).filter(item => (item.region || item.topTrack?.region || "global") === selectedRegion);
  const used = new Set(array(usedIds));
  let available = pool.filter(track => !used.has(track.id));
  if (available.length < 2) available = pool;
  const left = available[Math.floor(Math.random() * available.length)] || pool[0] || popularityTracks[0];
  const rightPool = available.filter(track => track.id !== left.id && (cleanMetric(metric) !== "listeners" || track.artist !== left.artist));
  const safeRightPool = rightPool.length ? rightPool : available.filter(track => track.id !== left.id);
  const right = safeRightPool[Math.floor(Math.random() * safeRightPool.length)] || pool[1] || pool[0] || popularityTracks[1];
  return [cloneCompetitionItem(left, metric), cloneCompetitionItem(right, metric)];
}

function valueFor(track, metric) { const clean = cleanMetric(metric); return Number(track?.[clean === "artistListeners" ? "listeners" : clean] || 0); }
function correctSide(pair, metric, reversed = false) {
  const left = valueFor(pair?.[0], metric), right = valueFor(pair?.[1], metric);
  return left === right ? "tie" : reversed ? (left < right ? "left" : "right") : (left > right ? "left" : "right");
}

function resolveRound(game) {
  const pair = array(game.pair).slice(0, 2).map(item => cloneCompetitionItem(item, game.metric));
  const choices = object(game.choices), answer = correctSide(pair, game.metric, game.reversed), awarded = [];
  game.scores = object(game.scores);
  game.players.forEach(uid => {
    const choice = choices[uid];
    if (!choice) return;
    if (answer === "tie" || choice === answer) {
      game.scores[uid] = Number(game.scores[uid] || 0) + 1;
      awarded.push(uid);
    }
  });
  game.roundResult = {
    round: Number(game.round) || 1,
    resultId: `popularity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    pair,
    metric: cleanMetric(game.metric),
    reversed: Boolean(game.reversed),
    choices: { ...choices },
    correctSide: answer,
    awarded,
  };
  game.phase = "roundResult";
  game.phaseEndsAt = Date.now() + 10000;
}

export function createPopularityGame(players, settings = {}) {
  const clean = sanitizePopularitySettings(settings);
  const list = [...new Set(array(players).map(String).filter(Boolean))].slice(0, 8);
  const pair = nextPair([], clean.metric, clean.region);
  return {
    mode: "popularnosc-hitow",
    phase: "choosing",
    round: 1,
    totalRounds: clean.rounds,
    players: list,
    metric: clean.metric,
    reversed: clean.reversed,
    region: clean.region,
    pair,
    usedIds: pair.map(track => track.id),
    choices: {},
    scores: Object.fromEntries(list.map(uid => [uid, 0])),
    roundResult: null,
    purchaseUses: {},
    privateHints: {},
    finished: false,
    phaseEndsAt: deadline(clean.choiceTime),
  };
}

export const PopularityEngine = {
  choose(game, uid, side) {
    if (game.phase !== "choosing") return "Wybór w tej rundzie jest już zamknięty.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej grze.";
    if (!["left", "right"].includes(side)) return "Wybierz jedną z dwóch opcji.";
    game.choices = object(game.choices);
    if (uid in game.choices) return "Twój wybór jest już zapisany.";
    game.choices[uid] = side;
    if (game.players.every(player => player in game.choices)) resolveRound(game);
  },
  timeout(game) {
    if (game.phase !== "choosing") return;
    game.choices = object(game.choices);
    game.players.forEach(uid => { if (!(uid in game.choices)) game.choices[uid] = null; });
    resolveRound(game);
  },
  nextRound(game, settings = {}) {
    if (game.phase !== "roundResult") return "Podsumowanie rundy nie jest jeszcze gotowe.";
    const clean = sanitizePopularitySettings({ ...settings, metric:game.metric, reversed:game.reversed, region:game.region });
    if (Number(game.round) >= Number(game.totalRounds || clean.rounds)) {
      game.phase = "gameSummary";
      game.finished = true;
      game.phaseEndsAt = null;
      return;
    }
    const usedIds = [...new Set([...array(game.usedIds), ...array(game.pair).map(track => track?.id).filter(Boolean)])];
    const pair = nextPair(usedIds, clean.metric, clean.region);
    game.round = Number(game.round || 1) + 1;
    game.pair = pair;
    game.usedIds = [...new Set([...usedIds, ...pair.map(track => track.id)])].slice(-popularityPoolSize(clean.metric, clean.region));
    game.choices = {};
    game.roundResult = null;
    game.phase = "choosing";
    game.phaseEndsAt = deadline(clean.choiceTime);
  },
  botChoice(game, difficulty = "normal") {
    const answer = correctSide(game.pair, game.metric, game.reversed);
    if (answer === "tie") return Math.random() < .5 ? "left" : "right";
    const accuracy = { easy:.5, normal:.7, hard:.86, expert:.97 }[difficulty] ?? .7;
    return Math.random() < accuracy ? answer : answer === "left" ? "right" : "left";
  },
};

function isArtistMetric(metric) { return cleanMetric(metric) === "artistListeners"; }
function metricLabel(metric) { return isArtistMetric(metric) ? "miesięcznych słuchaczy artysty" : cleanMetric(metric) === "listeners" ? "miesięcznych słuchaczy piosenki" : "wyświetleń"; }
function metricShortLabel(metric) { return isArtistMetric(metric) ? "SŁUCHACZY ART." : cleanMetric(metric) === "listeners" ? "SŁUCHACZY PIOS." : "WYŚWIETLEŃ"; }
function metricQuantity(metric) { return cleanMetric(metric) === "views" ? "wyświetleń" : "miesięcznych słuchaczy"; }
function metricEntity(metric) { return isArtistMetric(metric) ? "artysta" : "piosenka"; }
function popularityPoolSize(metric, region = "global") {
  const selectedRegion = region === "polish" ? "polish" : "global";
  const pool = isArtistMetric(metric) ? popularityArtists : popularityTracks;
  return Math.max(2, pool.filter(item => (item.region || item.topTrack?.region || "global") === selectedRegion).length);
}
function popularityItemName(item, metric) { return isArtistMetric(metric) ? item?.artist || "artysta" : item?.title || "piosenka"; }
function formatPopularityExact(value, metric) {
  const number = Number(value) || 0;
  return `${new Intl.NumberFormat("pl-PL").format(number)} ${metricQuantity(metric)}`;
}
export function formatPopularityValue(value, metric) {
  const number = Number(value) || 0;
  return `${new Intl.NumberFormat("pl-PL", { notation:"compact", maximumFractionDigits:1 }).format(number)} ${cleanMetric(metric) === "views" ? "wyśw." : "słuch."}`;
}
function metricQuestion(metric, reversed = false) {
  const question = isArtistMetric(metric) ? "Który artysta ma" : cleanMetric(metric) === "listeners" ? "Która piosenka ma" : "Która piosenka ma";
  return `${question} ${reversed ? "mniej" : "więcej"} ${metricQuantity(metric)}?`;
}
function metricSource(metric) { return isArtistMetric(metric) ? `Spotify · miesięczni słuchacze artystów · dane z ${POPULARITY_SNAPSHOT_DATE}` : cleanMetric(metric) === "listeners" ? "Spotify · snapshot słuchaczy piosenek" : "YouTube · snapshot wyświetleń"; }
function hashColor(value) {
  let hash = 0;
  for (const char of String(value || "")) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}
function safeNick(accounts, uid) { return accounts?.[uid]?.nick || accounts?.[uid]?.displayName || "Gracz"; }
function userProfile(accounts, room, uid) { return { ...(room?.playerProfiles?.[uid] || {}), ...(accounts?.[uid] || {}), nick:safeNick(accounts, uid), uid }; }
function popularityArt(track, side, reveal = false, metric = "views") {
  if (!track) return "";
  const artistMode = isArtistMetric(metric), hue = hashColor(track.artist), query = artistMode ? normalizedText(track.artist) : trackQuery(track.topTrack || track);
  const note = artistMode ? "" : `<span class="popularity-art-note">♫</span>`;
  return `<div class="popularity-art is-loading ${reveal ? "is-revealed" : ""}" data-popularity-artwork data-artwork-query="${escapeHtml(query)}" style="--popularity-hue:${hue}">${note}<small>${escapeHtml(track.artist || "Artysta")}</small></div>`;
}
function popularityTrackCard(track, side, { selected = false, reveal = false, correct = false, metric = "views" } = {}) {
  const artistMode = isArtistMetric(metric), title = artistMode ? track?.artist || "Brak artysty" : track?.title || "Brak utworu", subtitle = artistMode ? (reveal && track?.topTrack?.title ? `Top utwór: ${track.topTrack.title}` : "") : track?.artist || "", entity = artistMode ? "artystę" : "piosenkę", value = reveal ? `<strong class="popularity-value" data-popularity-number="${valueFor(track, metric)}" data-popularity-metric="${cleanMetric(metric)}">${formatPopularityValue(0, metric)}</strong>` : `<span class="popularity-hidden-value">???</span>`;
  return `<button class="popularity-choice popularity-${side} ${selected ? "is-selected" : ""} ${reveal && correct ? "is-correct" : ""} ${reveal && !correct ? "is-wrong" : ""}" data-popularity-choice="${side}" aria-label="${escapeHtml(`Wybierz ${entity} ${side === "left" ? "A" : "B"}: ${title}`)}" aria-pressed="${selected ? "true" : "false"}" ${reveal || selected ? "disabled" : ""}><span class="popularity-side-label">${side === "left" ? "A" : "B"}</span>${popularityArt(track, side, reveal, metric)}<span class="popularity-track-copy"><b>${escapeHtml(title)}</b>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}${value}</span>${reveal ? `<span class="popularity-reveal-mark">${correct ? "✓" : "×"}</span>` : ""}</button>`;
}
function popularityRanking(game, accounts, room) {
  return [...array(game.players)].sort((a, b) => Number(game.scores?.[b] || 0) - Number(game.scores?.[a] || 0)).map((uid, index) => `<div class="popularity-ranking-row"><span class="popularity-ranking-player">${avatarHtml(userProfile(accounts, room, uid), "popularity-avatar", { disableIdle:true })}<b>${index + 1}. ${escapeHtml(safeNick(accounts, uid))}</b></span><strong>${Number(game.scores?.[uid] || 0)} pkt</strong></div>`).join("");
}
function popularityPlayerPicks(game, accounts, room) {
  const result = game.roundResult || {};
  return array(game.players).map(uid => {
    const choice = result.choices?.[uid];
    const profile = userProfile(accounts, room, uid);
    const awarded = array(result.awarded).includes(uid);
    const entity = isArtistMetric(result.metric || game.metric) ? "artystę" : "piosenkę";
    return `<div class="popularity-pick-row ${awarded ? "is-awarded" : ""}">${avatarHtml(profile, "popularity-avatar", { disableIdle:true })}<span><b>${escapeHtml(safeNick(accounts, uid))}</b><small>${choice ? `wybrał ${entity} ${choice === "left" ? "A" : "B"}` : "nie oddał głosu"}</small></span><strong>${awarded ? "+1 pkt" : "—"}</strong></div>`;
  }).join("");
}
function popularityHeader(game, solo = false) {
  const round = Number(game.round || 1), total = Number(game.totalRounds || 1);
  const region = musicRegionOptions.find(([id]) => id === game.region) || musicRegionOptions[0];
  return `<div class="popularity-heading"><div><p class="eyebrow">${solo ? "TRYB SOLO" : "KTO MA WIĘCEJ?"} · ${region[1]} ${escapeHtml(region[2])}</p><h1>${solo ? (isArtistMetric(game.metric) ? "Najpopularniejszy artysta" : "Najpopularniejszy numer") : metricQuestion(game.metric, game.reversed)}</h1><p class="muted">${solo ? "Zbuduj jak najdłuższy streak, wybierając właściwą liczbę." : "Masz chwilę na wybór. Potem sprawdzimy, kto miał rację."}</p></div><div class="popularity-round-badge"><b>${solo ? "STREAK" : `RUNDA ${round}/${total}`}</b><strong>${solo ? Number(game.streak || 0) : metricShortLabel(game.metric)}</strong></div></div>`;
}

let popularityTimer = 0;
let popularityInterval = 0;
let popularityAnimationFrame = 0;
let popularityKeyHandler = null;
let popularityPreviewAudio = null;
let popularityPreviewGeneration = 0;
function stopPopularityPreview() {
  popularityPreviewGeneration += 1;
  if (!popularityPreviewAudio) return;
  popularityPreviewAudio.dataset.rerenderPause = "1";
  popularityPreviewAudio.pause();
  delete popularityPreviewAudio.dataset.rerenderPause;
  popularityPreviewAudio = null;
}
export function stopPopularityTimer() {
  window.clearTimeout(popularityTimer);
  window.clearInterval(popularityInterval);
  if (popularityAnimationFrame) window.cancelAnimationFrame(popularityAnimationFrame);
  if (popularityKeyHandler) window.removeEventListener("keydown", popularityKeyHandler);
  popularityTimer = 0;
  popularityInterval = 0;
  popularityAnimationFrame = 0;
  popularityKeyHandler = null;
  stopPopularityPreview();
}
function schedulePopularityTimer(game, actions, expected) {
  stopPopularityTimer();
  if (game.phase !== "choosing" || !Number(game.phaseEndsAt)) return;
  const update = () => {
    const element = document.querySelector("[data-popularity-time]");
    if (element) element.textContent = `${Math.max(0, Math.ceil((Number(game.phaseEndsAt) - Date.now()) / 1000))}s`;
  };
  update();
  popularityInterval = window.setInterval(update, 1000);
  popularityTimer = window.setTimeout(() => actions.popularityTimeout(expected), Math.max(100, Number(game.phaseEndsAt) - Date.now() + 50));
}

const mediaCache = new Map();
function localTrackMedia(query, region = "global") {
  const normalizedQuery = normalizedText(query);
  const regionCatalog = musicCatalogForRegion(region);
  const catalog = [...regionCatalog, ...musicPreviewCatalog.filter(item => !regionCatalog.some(local => local.id === item.id))];
  const match = catalog.find(item => {
    const normalizedTitle = normalizedText(item.title);
    const normalizedFull = normalizedText(`${item.title} ${item.artist}`);
    return normalizedFull === normalizedQuery || (normalizedTitle.length >= 4 && normalizedQuery.startsWith(`${normalizedTitle} `));
  });
  return match ? {
    artworkUrl: match.coverUrl?.replace(/100x100/g, "600x600") || match.coverUrl || "",
    previewUrl: match.previewUrl || "",
  } : { artworkUrl:"", previewUrl:"" };
}
async function findTrackMedia(query, region = "global") {
  const value = normalizedText(query);
  const fallback = localTrackMedia(query, region);
  if (!value || typeof fetch !== "function") return fallback;
  const cacheKey = `${region}:${value}`;
  if (mediaCache.has(cacheKey)) return mediaCache.get(cacheKey);
  // Katalog utworów zawiera już zweryfikowane previewy. Nie nadpisuj ich
  // przypadkowym pierwszym wynikiem wyszukiwarki iTunes.
  if (fallback.previewUrl) {
    mediaCache.set(cacheKey, fallback);
    return fallback;
  }
  try {
    const country = region === "polish" ? "PL" : "US";
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8&country=${country}`);
    if (!response.ok) throw new Error(`iTunes returned ${response.status}`);
    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    const exact = results.find(candidate => normalizedText(`${candidate?.trackName || ""} ${candidate?.artistName || ""}`) === value || normalizedText(`${candidate?.artistName || ""} ${candidate?.trackName || ""}`) === value);
    const item = exact || results.find(candidate => candidate?.previewUrl && normalizedText(candidate?.trackName || "").length >= 4 && value.includes(normalizedText(candidate.trackName))) || results.find(candidate => candidate?.previewUrl || candidate?.artworkUrl100) || {};
    const media = {
      artworkUrl: item?.artworkUrl100?.replace(/100x100/g, "600x600") || fallback.artworkUrl,
      previewUrl: item?.previewUrl || fallback.previewUrl,
    };
    mediaCache.set(cacheKey, media);
    return media;
  } catch {
    mediaCache.set(cacheKey, fallback);
    return fallback;
  }
}
async function findArtistMedia(artist) {
  const value = normalizedText(artist), cacheKey = `artist:${value}`;
  if (!value || typeof fetch !== "function") return { artworkUrl:"", previewUrl:"" };
  if (mediaCache.has(cacheKey)) return mediaCache.get(cacheKey);
  // Najpierw pytamy serwis muzyczny. Sam tytuł strony Wikipedii bywa
  // niejednoznaczny — np. "Pitbull" prowadzi do rasy psa, a nie rapera.
  let deezerArtworkUrl = "";
  try { deezerArtworkUrl = await findArtistPhotoJsonp(artist); } catch {}
  if (deezerArtworkUrl) {
    const media = { artworkUrl:deezerArtworkUrl, previewUrl:"" };
    mediaCache.set(cacheKey, media);
    return media;
  }
  const wikipediaAliases = { pitbull:"Pitbull (rapper)" };
  try {
    const wikipediaTitle = wikipediaAliases[value] || String(artist).trim().replace(/\s+/g, "_");
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikipediaTitle)}`);
    if (!response.ok) throw new Error("artist profile not found");
    const data = await response.json();
    const summary = `${data?.description || ""} ${data?.extract || ""}`;
    if (/\b(?:dog|animal|breed|species|reptile|fish|bird)\b/i.test(summary) || !/\b(?:singer|rapper|musician|songwriter|vocalist|band|duo|group|dj|producer|composer|performer|actor|actress)\b/i.test(summary)) throw new Error("not an artist profile");
    let artworkUrl = data?.originalimage?.source || data?.thumbnail?.source || "";
    if (!artworkUrl) throw new Error("artist artwork not found");
    const media = { artworkUrl, previewUrl:"" };
    mediaCache.set(cacheKey, media);
    return media;
  } catch {
    const fallback = { artworkUrl:"", previewUrl:"" };
    mediaCache.set(cacheKey, fallback);
    return fallback;
  }
}
let artistPhotoCallbackId = 0;
function findArtistPhotoJsonp(artist) {
  if (typeof document === "undefined" || typeof window === "undefined") return Promise.resolve("");
  return new Promise(resolve => {
    const callback = `__grygrupoweArtistPhoto${++artistPhotoCallbackId}`;
    const script = document.createElement("script");
    let settled = false;
    const finish = payload => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      script.remove();
      try { delete window[callback]; } catch { window[callback] = undefined; }
      const value = normalizedText(artist), exact = array(payload?.data).find(item => normalizedText(item?.name) === value), item = exact || payload?.data?.[0] || {};
      const artworkUrl = String(item?.picture_xl || item?.picture_big || item?.picture_medium || "");
      resolve(/^https?:\/\//i.test(artworkUrl) ? artworkUrl : "");
    };
    window[callback] = finish;
    script.async = true;
    script.onerror = () => finish(null);
    script.src = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}&limit=5&output=jsonp&callback=${callback}`;
    const timeout = window.setTimeout(() => finish(null), 5000);
    document.head.append(script);
  });
}
function updatePopularityPreview(root, query, media, metric, token, previewGeneration) {
  if (("isConnected" in root && !root.isConnected) || root.dataset.popularityArtToken !== token || previewGeneration !== popularityPreviewGeneration) return;
  const preview = root.querySelector("[data-popularity-preview]");
  if (!preview || preview.dataset.previewQuery !== query) return;
  const audio = preview.querySelector("[data-popularity-preview-audio]"), status = preview.querySelector("[data-popularity-preview-status]"), spotify = preview.querySelector("[data-popularity-preview-spotify]");
  if (spotify) spotify.href = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  if (!audio || !media.previewUrl) {
    if (audio) audio.hidden = true;
    if (status) status.textContent = "Brak dostępnego preview — otwórz utwór w Spotify.";
    preview.classList.add("is-unavailable");
    return;
  }
  audio.hidden = false;
  // Nie używaj samego query jako klucza. Gdy gracz wcześniej ręcznie
  // zatrzymał ten utwór, Audio mogłoby przywrócić stan "paused" zamiast
  // automatycznie uruchomić nowy wynik rundy.
  const playbackKey = `popularity:${query}:${previewGeneration}`;
  Audio.setTrackAudioSource(audio, playbackKey, media.previewUrl, { autoplay:true });
  popularityPreviewAudio = audio;
  audio.addEventListener("play", () => { if (status) status.textContent = isArtistMetric(metric) ? "Fragment utworu artysty jest odtwarzany." : "Fragment zwycięskiej piosenki jest odtwarzany."; }, { once:true });
  audio.addEventListener("error", () => { preview.classList.add("autoplay-blocked"); if (status) status.textContent = "Nie udało się odtworzyć preview — otwórz utwór w Spotify."; }, { once:true });
}
function hydratePopularityArtwork(root, tracks, metric = "views") {
  const dataset = root.dataset || (root.dataset = {});
  const token = dataset.popularityArtToken = String((Number(dataset.popularityArtToken) || 0) + 1);
  const previewGeneration = popularityPreviewGeneration;
  array(tracks).filter(Boolean).forEach(track => {
    const artistMode = isArtistMetric(metric), trackRegion = track.region === "polish" ? "polish" : "global", artworkQuery = artistMode ? normalizedText(track.artist) : trackQuery(track?.topTrack || track), previewQuery = trackQuery(artistMode ? track.topTrack || track : track);
    const artworkMedia = artistMode ? findArtistMedia(track.artist) : findTrackMedia(artworkQuery, trackRegion);
    artworkMedia.then(media => {
      if (("isConnected" in root && !root.isConnected) || dataset.popularityArtToken !== token || previewGeneration !== popularityPreviewGeneration) return;
      [...root.querySelectorAll("[data-artwork-query]")].filter(element => element.dataset.artworkQuery === artworkQuery).forEach(element => {
        element.classList.remove("is-loading");
        if (media.artworkUrl) {
          element.style.backgroundImage = `linear-gradient(135deg, hsla(${hashColor(track.artist)}, 80%, 40%, .22), rgba(2, 6, 23, .56)), url("${media.artworkUrl}")`;
          element.classList.add("has-artwork");
        }
      });
    });
    if (artistMode) findTrackMedia(previewQuery, trackRegion).then(media => updatePopularityPreview(root, previewQuery, media, metric, token, previewGeneration));
    else artworkMedia.then(media => updatePopularityPreview(root, previewQuery, media, metric, token, previewGeneration));
  });
}

function popularityPreviewHtml(track, metric = "views") {
  if (!track) return `<section class="popularity-preview popularity-preview-tie"><span class="popularity-preview-icon">♫</span><div><b>Remis — bez zwycięskiego utworu</b><small>Oba numery mają tę samą wartość.</small></div></section>`;
  const artistMode = isArtistMetric(metric), song = artistMode ? track.topTrack : track, query = trackQuery(song), title = song?.title, subtitle = artistMode ? `${track.artist} · najpopularniejszy utwór` : song?.artist;
  return `<section class="popularity-preview" data-popularity-preview data-preview-query="${escapeHtml(query)}"><span class="popularity-preview-icon">♫</span><div class="popularity-preview-copy"><p class="eyebrow">${artistMode ? "FRAGMENT PO ODPOWIEDZI" : "FRAGMENT ZWYCIĘSKIEJ PIOSENKI"}</p><b>${escapeHtml(title || "—")}</b><small>${escapeHtml(subtitle || "")}</small></div><audio data-popularity-preview-audio data-track-audio controls preload="none" hidden aria-label="${artistMode ? "Fragment utworu artysty" : "Fragment zwycięskiej piosenki"}"></audio>${Audio.trackVolumeControlHtml({ compact:true })}<p class="popularity-preview-status" data-popularity-preview-status>Ładuję publiczny preview…</p><a class="ghost popularity-preview-spotify" data-popularity-preview-spotify href="https://open.spotify.com/search/${encodeURIComponent(query)}" target="_blank" rel="noreferrer">Otwórz w Spotify</a></section>`;
}

function popularityReadyPlayers(game, accounts, room) {
  const choices = object(game.choices), ready = array(game.players).filter(uid => uid in choices);
  if (!ready.length) return "";
  return `<div class="popularity-ready-avatars" aria-label="${ready.length} graczy już wybrało"><span>${ready.length}</span>${ready.slice(0, 8).map(uid => avatarHtml(userProfile(accounts, room, uid), "popularity-avatar", { disableIdle:true })).join("")}</div>`;
}
function popularityInsightHtml(game, accounts, currentUser, room, pair) {
  const item = inGamePurchaseById("popularity-insight");
  if (!item || game.phase !== "choosing") return "";
  const user = accounts?.[currentUser] || {}, used = Boolean(game.purchaseUses?.[currentUser]?.[item.id]);
  const hint = game.privateHints?.[currentUser];
  if (hint?.round === Number(game.round || 1) && ["left", "right"].includes(hint.side)) {
    const selected = pair[hint.side === "left" ? 0 : 1];
    return `<section class="popularity-insight popularity-insight-result"><div class="popularity-insight-heading"><span>🔎</span><div><p class="eyebrow">TWOJA PRYWATNA WSKAZÓWKA</p><b>${escapeHtml(popularityItemName(selected, game.metric))}</b></div></div><strong>${escapeHtml(formatPopularityExact(hint.value, game.metric))}</strong><small>Ta informacja jest widoczna tylko dla Ciebie.</small></section>`;
  }
  if (used || game.choices?.[currentUser] || room.settings?.gamePurchases === false || user.nickOnly) return "";
  return `<section class="popularity-insight"><div class="popularity-insight-heading"><span>🔎</span><div><p class="eyebrow">BRAKUJE CI PEWNOŚCI?</p><b>Wskazówka popularności</b><small>Raz w meczu poznasz dokładną wartość jednej opcji. Tylko Ty ją zobaczysz.</small></div><strong>${Number(item.price).toLocaleString("pl-PL")}$</strong></div><div class="popularity-insight-options">${["left", "right"].map(side => { const selected = pair[side === "left" ? 0 : 1]; return `<button type="button" class="ghost popularity-insight-option" data-popularity-insight="${side}"><span>${side === "left" ? "A" : "B"}</span><b>${escapeHtml(popularityItemName(selected, game.metric))}</b><small>Pokaż ${metricShortLabel(game.metric).toLocaleLowerCase("pl-PL")}</small></button>`; }).join("")}</div></section>`;
}
function popularityMargin(pair, metric) {
  const left = valueFor(pair?.[0], metric), right = valueFor(pair?.[1], metric);
  return left === right ? "identyczny wynik" : `przewaga ${formatPopularityValue(Math.abs(left - right), metric)}`;
}
function bindPopularityKeyboard(root, actions, expected, solo = false) {
  const handler = event => {
    if (!root.isConnected || ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    const key = String(event.key || "").toLowerCase();
    const side = key === "a" || event.key === "ArrowLeft" ? "left" : key === "d" || event.key === "ArrowRight" ? "right" : "";
    if (!side) return;
    event.preventDefault();
    if (solo) actions.popularitySoloChoose(side); else actions.popularityChoose(side, expected);
  };
  popularityKeyHandler = handler;
  window.addEventListener("keydown", handler);
}
function animatePopularityValues(root) {
  const values = [...root.querySelectorAll("[data-popularity-number]")];
  if (!values.length) return;
  const startedAt = performance.now();
  const duration = 1000;
  const tick = now => {
    const progress = Math.min(1, (now - startedAt) / duration), eased = 1 - Math.pow(1 - progress, 3);
    values.forEach(element => {
      const target = Number(element.dataset.popularityNumber) || 0;
      const metric = element.dataset.popularityMetric || "views";
      element.textContent = formatPopularityValue(target * eased, metric);
    });
    if (progress < 1) popularityAnimationFrame = window.requestAnimationFrame(tick);
    else popularityAnimationFrame = 0;
  };
  popularityAnimationFrame = window.requestAnimationFrame(tick);
}

export function renderPopularityGame(root, { room, accounts, currentUser }, actions) {
  const game = room.game, result = game.roundResult || {}, selected = game.choices?.[currentUser], expected = { phase:game.phase, phaseEndsAt:game.phaseEndsAt };
  const pair = array(game.phase === "roundResult" ? result.pair : game.pair).slice(0, 2);
  let content = popularityHeader(game);
  if (game.phase === "choosing") {
    const choiceCount = Object.keys(game.choices || {}).length, chosen = selected ? `<div class="popularity-choice-status"><span>✓</span><div><b>Twój wybór został zapisany</b><small>Czekamy na resztę graczy: ${choiceCount}/${game.players.length}.</small></div>${popularityReadyPlayers(game, accounts, room)}</div>` : `<div class="popularity-choice-status"><span>⚡</span><div><b>Wybierz stronę</b><small>${choiceCount ? `${choiceCount}/${game.players.length} graczy już wybrało.` : "Nie pokazujemy liczb, dopóki wszyscy nie odpowiedzą."}</small></div>${popularityReadyPlayers(game, accounts, room)}</div>`;
    const librarySize = popularityPoolSize(game.metric, game.region), libraryEntity = isArtistMetric(game.metric) ? "artystów" : "utworów";
    content += `<section class="popularity-question"><span>📊</span><div><b>${escapeHtml(metricQuestion(game.metric, game.reversed))}</b><small>${escapeHtml(metricSource(game.metric))} · ${librarySize} ${libraryEntity} w bazie</small></div></section><div class="popularity-key-hint"><span>A / D albo ← / →</span><small>Możesz też kliknąć kartę</small></div><div class="popularity-duel-stage" data-popularity-round="${Number(game.round || 1)}">${popularityTrackCard(pair[0], "left", { selected:selected === "left", metric:game.metric })}<div class="popularity-vs"><span>VS</span><i></i></div>${popularityTrackCard(pair[1], "right", { selected:selected === "right", metric:game.metric })}</div>${popularityInsightHtml(game, accounts, currentUser, room, pair)}<div class="popularity-live-timer">Zaznacz do końca <b data-popularity-time></b></div>${chosen}`;
  } else if (game.phase === "roundResult") {
    const correct = result.correctSide, leftCorrect = correct === "tie" || correct === "left", rightCorrect = correct === "tie" || correct === "right";
    const winningTrack = correct === "left" ? pair[0] : correct === "right" ? pair[1] : null;
    const revealEntity = metricEntity(game.metric), revealQuantity = metricQuantity(game.metric), revealDirection = game.reversed ? "Mniej" : "Więcej";
    content += `<section class="popularity-reveal-banner"><span class="popularity-reveal-icon">${correct === "tie" ? "=" : "✦"}</span><div><p class="eyebrow">UJAWNIENIE</p><h2>${correct === "tie" ? "Remis — oba wybory były trafione" : `${revealDirection} ${escapeHtml(revealQuantity)} ma ${revealEntity} ${correct === "left" ? "A" : "B"}`}</h2><p>${escapeHtml(metricSource(game.metric))} · ${escapeHtml(popularityMargin(pair, game.metric))}</p></div></section><div class="popularity-duel-stage popularity-reveal-stage" data-popularity-round="${Number(game.round || 1)}">${popularityTrackCard(pair[0], "left", { selected:Object.values(result.choices || {}).includes("left"), reveal:true, correct:leftCorrect, metric:game.metric })}<div class="popularity-vs"><span>VS</span><i></i></div>${popularityTrackCard(pair[1], "right", { selected:Object.values(result.choices || {}).includes("right"), reveal:true, correct:rightCorrect, metric:game.metric })}</div>${popularityPreviewHtml(winningTrack, game.metric)}<section class="popularity-picks-panel"><div class="section-heading"><div><p class="eyebrow">WASZE WYBORY</p><h2>Kto trafił?</h2></div><span class="badge">${array(result.awarded).length}/${game.players.length}</span></div><div class="popularity-picks-list">${popularityPlayerPicks(game, accounts, room)}</div></section><section class="popularity-ranking"><p class="eyebrow">AKTUALNY RANKING</p>${popularityRanking(game, accounts, room)}</section><button class="primary big" id="popularity-next">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż końcowy ranking" : "Następna para"}</button>`;
  } else {
    const top = Math.max(0, ...game.players.map(uid => Number(game.scores?.[uid] || 0))), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<section class="popularity-final"><span class="popularity-trophy">🏆</span><p class="eyebrow">KONIEC GRY</p><h2>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(safeNick(accounts, uid))).join(", ")}!` : "Tym razem bez zwycięzcy"}</h2><p class="muted">Każdy trafny wybór dawał punkt.</p><section class="popularity-ranking">${popularityRanking(game, accounts, room)}</section><button class="primary big" id="popularity-lobby">Zagraj ponownie</button></section>`;
  }
  root.innerHTML = `<main class="page popularity-page enter"><section class="panel popularity-panel">${content}<p class="popularity-snapshot-note">Liczby są stałym snapshotem rundy — wszyscy grają na tych samych danych.</p></section><button id="popularity-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelectorAll("[data-popularity-choice]").forEach(button => button.addEventListener("click", () => actions.popularityChoose(button.dataset.popularityChoice, expected)));
  root.querySelectorAll("[data-popularity-insight]").forEach(button => button.addEventListener("click", () => actions.popularityUseInsight(button.dataset.popularityInsight)));
  root.querySelector("#popularity-next")?.addEventListener("click", actions.popularityNext);
  root.querySelector("#popularity-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#popularity-leave")?.addEventListener("click", () => actions.leaveRoom("music-select"));
  schedulePopularityTimer(game, actions, expected);
  if (game.phase === "choosing") bindPopularityKeyboard(root, actions, expected);
  if (game.phase === "roundResult") animatePopularityValues(root);
  Audio.bindTrackVolumeControls(root);
  hydratePopularityArtwork(root, pair, game.metric);
}

const SOLO_METRICS = ["views", "listeners", "artistListeners"];
const SOLO_REGIONS = ["global", "polish"];
const soloStorageKey = playerId => `grygrupowe-popularity-solo-v1:${String(playerId || "guest")}`;
const emptySoloMetricStats = () => Object.fromEntries(SOLO_METRICS.map(metric => [metric, { streak:0, best:0 }]));
const emptySoloRegionStats = () => Object.fromEntries(SOLO_REGIONS.map(region => [region, emptySoloMetricStats()]));
function normalizeSoloState(raw, playerId) {
  const owner = String(playerId || raw?.playerId || "guest"), source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const metric = cleanMetric(source.metric), storedStats = object(source.metricStats);
  const status = ["idle", "playing", "reveal", "over"].includes(source.status) ? source.status : "idle";
  const selectedRegion = source.region === "polish" ? "polish" : "global";
  const storedRegionStats = object(source.regionStats || source.metricStatsByRegion);
  const regionStats = emptySoloRegionStats();
  SOLO_REGIONS.forEach(region => {
    const regionSource = object(storedRegionStats[region]);
    // Dane sprzed rozdzielenia topki były płaskie. Zachowaj je w Globalnych,
    // aby aktualne rekordy nie zniknęły po aktualizacji aplikacji.
    const legacySource = Object.keys(storedStats).length ? storedStats : { [metric]: { streak:Number(source.streak) || 0, best:Number(source.best) || 0 } };
    const fallbackSource = region === selectedRegion && !Object.keys(regionSource).length ? legacySource : {};
    SOLO_METRICS.forEach(key => {
      const entry = object(regionSource[key] || fallbackSource[key]);
      regionStats[region][key] = { streak:Math.max(0, Number(entry.streak) || 0), best:Math.max(0, Number(entry.best) || 0) };
      regionStats[region][key].best = Math.max(regionStats[region][key].best, regionStats[region][key].streak);
    });
  });
  const current = regionStats[selectedRegion][metric], hasSavedStreak = Object.prototype.hasOwnProperty.call(source, "streak");
  const savedStreak = Math.max(0, Number(hasSavedStreak ? source.streak : current.streak) || 0);
  // `metricStats.streak` used to survive a stopped/failed run. Treat idle and
  // over states as finished runs, so an old cached value cannot be added to
  // the first answer of the next run.
  if (status === "idle" || status === "over") current.streak = 0;
  else current.streak = savedStreak;
  return {
    status,
    playerId:owner,
    region:selectedRegion,
    metric,
    metricStats:regionStats[selectedRegion],
    regionStats,
    streak:status === "over" ? savedStreak : status === "idle" ? 0 : current.streak,
    best:Math.max(current.best, savedStreak),
    round:Math.max(0, Number(source.round) || 0),
    usedIds:array(source.usedIds),
    pair:array(source.pair),
    lastResult:source.lastResult && typeof source.lastResult === "object" ? source.lastResult : null,
  };
}
let soloState = null;
let soloOwner = "";
function readSoloState(playerId) {
  const owner = String(playerId || "guest"), key = soloStorageKey(owner);
  if (soloOwner === owner && soloState) return soloState;
  try { soloState = normalizeSoloState(JSON.parse(localStorage.getItem(key) || "null"), owner); }
  catch { soloState = normalizeSoloState(null, owner); }
  soloOwner = owner;
  return soloState;
}
function readStoredSoloState(playerId) {
  const owner = String(playerId || "guest");
  if (typeof localStorage === "undefined") return normalizeSoloState(null, owner);
  try { return normalizeSoloState(JSON.parse(localStorage.getItem(soloStorageKey(owner)) || "null"), owner); }
  catch { return normalizeSoloState(null, owner); }
}
function ensureSoloMetricStats(state) {
  const normalized = normalizeSoloState(state, state?.playerId);
  state.region = normalized.region;
  state.metric = normalized.metric;
  state.regionStats = normalized.regionStats;
  state.metricStats = state.regionStats[state.region] || emptySoloMetricStats();
  state.streak = normalized.streak;
  state.best = normalized.best;
  return state.metricStats;
}
function saveSoloState(state) {
  try { localStorage.setItem(soloStorageKey(state.playerId), JSON.stringify(state)); } catch {}
}
function createSoloPair(usedIds, metric, region = "global") { return nextPair(usedIds, metric, region); }
export function startPopularitySolo(playerId, metric = "views", region = "global") {
  const owner = String(playerId || "guest"), previous = readSoloState(owner), clean = cleanMetric(metric), selectedRegion = region === "polish" ? "polish" : "global", regionStats = previous.regionStats || emptySoloRegionStats(), stats = regionStats[selectedRegion] || emptySoloMetricStats(), pair = createSoloPair([], clean, selectedRegion);
  stats[clean] = { ...(stats[clean] || { best:0 }), streak:0 };
  const best = Math.max(0, Number(stats[clean]?.best) || 0);
  soloState = { status:"playing", playerId:owner, region:selectedRegion, metric:clean, metricStats:stats, regionStats, streak:0, best, round:1, usedIds:pair.map(track => track.id), pair, lastResult:null };
  soloOwner = owner; saveSoloState(soloState); return soloState;
}
export function stopPopularitySolo(playerId) {
  const state = readSoloState(playerId);
  const stats = ensureSoloMetricStats(state);
  stats[state.metric] = { ...(stats[state.metric] || { best:0 }), streak:0 };
  state.status = "idle"; state.pair = []; state.round = 0; state.streak = 0; state.best = Math.max(0, Number(stats[state.metric]?.best) || 0); state.lastResult = null; saveSoloState(state); return state;
}
export function getPopularitySoloState(playerId) { return { ...readSoloState(playerId) }; }
export function setPopularitySoloRegion(playerId, region) {
  const state = readSoloState(playerId);
  if (state.status !== "idle") return state;
  state.region = region === "polish" ? "polish" : "global";
  state.metricStats = state.regionStats?.[state.region] || emptySoloMetricStats();
  state.streak = 0;
  state.best = Math.max(0, Number(state.metricStats?.[state.metric]?.best) || 0);
  saveSoloState(state);
  return state;
}
export function setPopularitySoloMetric(playerId, metric) {
  const state = readSoloState(playerId), nextMetric = cleanMetric(metric), stats = ensureSoloMetricStats(state);
  if (state.metric !== nextMetric && state.status === "playing") {
    state.metric = nextMetric;
    stats[nextMetric] = { ...(stats[nextMetric] || { best:0 }), streak:0 };
    state.streak = 0;
    state.best = Math.max(0, Number(stats[nextMetric]?.best) || 0);
    state.round = 1;
    state.usedIds = [];
    state.pair = createSoloPair([], nextMetric, state.region);
    state.usedIds = state.pair.map(item => item.id);
  } else {
    state.metric = nextMetric;
    state.streak = state.status === "idle" ? 0 : Math.max(0, Number(stats[nextMetric]?.streak) || 0);
    state.best = Math.max(0, Number(stats[nextMetric]?.best) || 0);
  }
  saveSoloState(state); return state;
}
export function choosePopularitySolo(playerId, side) {
  const state = readSoloState(playerId);
  if (state.status !== "playing") return state;
  const stats = ensureSoloMetricStats(state), metricStats = stats[state.metric];
  const answer = correctSide(state.pair, state.metric), correct = answer === "tie" || side === answer;
  state.lastResult = { pair:state.pair.map(item => cloneCompetitionItem(item, state.metric)), metric:state.metric, selected:side, correctSide:answer, correct };
  if (!correct) { state.status = "over"; state.best = Math.max(Number(state.best) || 0, Number(state.streak) || 0); metricStats.streak = 0; saveSoloState(state); return state; }
  state.streak = Number(state.streak || 0) + 1; state.best = Math.max(Number(state.best) || 0, state.streak); metricStats.streak = state.streak; metricStats.best = state.best; state.status = "reveal";
  saveSoloState(state); return state;
}
export function continuePopularitySolo(playerId) {
  const state = readSoloState(playerId);
  if (state.status !== "reveal") return state;
  ensureSoloMetricStats(state);
  state.round = Number(state.round || 0) + 1;
  const usedIds = [...new Set([...array(state.usedIds), ...array(state.pair).map(track => track?.id).filter(Boolean)])];
  state.pair = createSoloPair(usedIds, state.metric, state.region); state.usedIds = [...new Set([...usedIds, ...state.pair.map(track => track.id)])].slice(-popularityPoolSize(state.metric, state.region)); state.lastResult = null; state.status = "playing"; saveSoloState(state); return state;
}
export const PopularitySoloEngine = { start:startPopularitySolo, stop:stopPopularitySolo, get:getPopularitySoloState, choose:choosePopularitySolo, next:continuePopularitySolo, setMetric:setPopularitySoloMetric, setRegion:setPopularitySoloRegion };

function storedSoloBest(playerId, metric, region = "global") {
  const state = readStoredSoloState(playerId), selectedRegion = region === "polish" ? "polish" : "global";
  return Number(state.regionStats?.[selectedRegion]?.[cleanMetric(metric)]?.best) || 0;
}
function soloMetricLabel(metric) {
  return metric === "views" ? "Wyświetlenia" : metric === "listeners" ? "Słuchacze piosenek" : "Słuchacze artystów";
}
function soloRegionButtons(state) {
  return `<div class="popularity-region-switch" role="radiogroup" aria-label="Katalog utworów">${musicRegionOptions.map(([id, icon, label, description]) => `<button type="button" class="music-region-option ${state.region === id ? "is-selected" : ""}" data-popularity-solo-region="${id}" aria-pressed="${state.region === id ? "true" : "false"}"><span class="music-region-option-icon">${icon}</span><span><b>${escapeHtml(label)}</b><small>${escapeHtml(description)}</small></span></button>`).join("")}</div>`;
}
function popularityRegionRecords(remote, region) {
  const records = object(remote?.records), nested = object(records[region]);
  // Stare wpisy miały płaskie records. Odczytujemy je jako Globalne, ale
  // nigdy nie dokładamy ich do polskiej topki.
  return Object.keys(nested).length ? nested : region === "global" ? records : {};
}
function popularitySoloLeaderboard(accounts = {}, playerId, state = {}, currentProfile = null, leaderboard = {}) {
  const currentId = String(playerId || "guest"), accountIds = Object.keys(object(accounts)), remoteIds = Object.keys(object(leaderboard));
  const ids = [...new Set([...accountIds, ...remoteIds, currentId])].filter(Boolean);
  const selectedRegion = state.region === "polish" ? "polish" : "global";
  const stateRegionStats = object(state.regionStats);
  const renderRows = (region, metric) => {
    const currentStats = object(stateRegionStats[region]);
    const ranked = ids.map(uid => {
      const isCurrent = uid === currentId, account = accounts?.[uid] || {}, remote = leaderboard?.[uid] || {}, remoteRecords = popularityRegionRecords(remote, region);
      const best = isCurrent ? Math.max(Number(currentStats?.[metric]?.best) || 0, storedSoloBest(uid, metric, region), Number(remoteRecords[metric]) || 0) : Math.max(storedSoloBest(uid, metric, region), Number(remoteRecords[metric]) || 0);
      const nick = isCurrent ? (currentProfile?.nick || account.nick || remote.nick || "Ty") : (account.nick || remote.nick || safeNick(accounts, uid));
      const player = Object.keys(account).length ? userProfile(accounts, null, uid) : { ...remote, nick, uid };
      return { uid, best, isCurrent, nick, player };
    }).filter(item => item.best > 0 || item.isCurrent).sort((a, b) => b.best - a.best || a.nick.localeCompare(b.nick, "pl"))
      .map((item, index) => ({ ...item, rank:index + 1 }));
    const visible = ranked.slice(0, 8);
    if (!visible.some(item => item.isCurrent)) {
      const current = ranked.find(item => item.isCurrent);
      if (current) visible[visible.length - 1] = current;
    }
    const rows = visible.length ? visible.map(item => `<div class="popularity-leaderboard-row ${item.isCurrent ? "is-you" : ""}"><span class="popularity-leaderboard-rank">${item.rank}</span>${avatarHtml(item.player, "popularity-avatar", { disableIdle:true })}<span class="popularity-leaderboard-player"><b>${escapeHtml(item.nick)}</b><small>${item.isCurrent ? "Twój rekord" : "Najlepsza seria"}</small></span><strong>${item.best}</strong></div>`).join("") : `<p class="muted">Brak zapisanych serii.</p>`;
    return { count:ranked.length, html:rows };
  };
  const metricTabs = SOLO_METRICS.map(metric => `<button type="button" class="popularity-leaderboard-tab ${state.metric === metric ? "active" : ""}" data-popularity-leaderboard-metric="${metric}" aria-selected="${state.metric === metric ? "true" : "false"}">${soloMetricLabel(metric)}</button>`).join("");
  const regionTabs = SOLO_REGIONS.map(region => {
    const option = musicRegionOptions.find(([id]) => id === region) || [region, "", region];
    return `<button type="button" class="popularity-leaderboard-region ${selectedRegion === region ? "active" : ""}" data-popularity-leaderboard-region="${region}" aria-selected="${selectedRegion === region ? "true" : "false"}">${option[1]} ${escapeHtml(option[2])}</button>`;
  }).join("");
  const panels = SOLO_REGIONS.flatMap(region => SOLO_METRICS.map(metric => {
    const board = renderRows(region, metric), visible = selectedRegion === region && state.metric === metric;
    return `<div class="popularity-leaderboard-panel" data-popularity-leaderboard-panel="${region}:${metric}" ${visible ? "" : "hidden"}><div class="popularity-leaderboard-panel-heading"><b>${soloMetricLabel(metric)} · ${region === "polish" ? "Polskie" : "Globalne"}</b><span>${board.count}</span></div><div class="popularity-leaderboard-list">${board.html}</div></div>`;
  })).join("");
  return `<aside class="panel popularity-leaderboard" aria-label="Rankingi trybu solo"><div class="section-heading"><div><p class="eyebrow">KTO MA WIĘCEJ?</p><h2>Rankingi serii</h2></div><span class="badge">3</span></div><p class="popularity-leaderboard-note">Globalne i Polskie mają osobne rekordy — wyniki nigdy się nie mieszają.</p><div class="popularity-leaderboard-regions" role="tablist" aria-label="Wybierz katalog">${regionTabs}</div><div class="popularity-leaderboard-tabs" role="tablist" aria-label="Wybierz ranking">${metricTabs}</div>${panels}</aside>`;
}
function soloMetricButtons(state) { return `<div class="popularity-metric-switch" role="tablist" aria-label="Rodzaj statystyki">${[["views", "Wyświetlenia piosenek"], ["listeners", "Słuchacze piosenek"], ["artistListeners", "Słuchacze artystów"]].map(([id, label]) => `<button type="button" class="${state.metric === id ? "active" : ""}" data-popularity-solo-metric="${id}">${label}</button>`).join("")}</div>`; }
function soloTrackCard(track, side, state, reveal = false) { return popularityTrackCard(track, side, { selected:reveal && state.lastResult?.selected === side, reveal, correct:reveal && (state.lastResult?.correctSide === "tie" || state.lastResult?.correctSide === side), metric:state.metric }); }

function popularitySoloAnswerLabel(result, metric) {
  if (result?.correctSide === "tie") return "remis";
  const entity = isArtistMetric(metric) ? "artysta" : "piosenka";
  return `${entity} ${result?.correctSide === "left" ? "A" : "B"}`;
}

export function renderPopularitySolo(root, { profile, playerId, accounts = {}, leaderboard = {} }, actions) {
  if (typeof window !== "undefined") stopPopularityTimer();
  const state = readSoloState(playerId), game = { ...state, totalRounds:0 };
  let content = popularityHeader(game, true);
  if (state.status === "idle") {
    content += `<section class="popularity-solo-start"><div class="popularity-solo-icon">♫</div><p class="eyebrow">SZYBKI SOLO RUN</p><h2>Ile trafień zrobisz z rzędu?</h2><p class="muted">Klikasz większą liczbę, następna para pojawia się od razu. Możesz przerwać serię w dowolnym momencie.</p>${soloRegionButtons(state)}${soloMetricButtons(state)}<div class="popularity-best-card"><span>🏆</span><div><small>TWÓJ REKORD</small><b>${Number(state.best || 0)} trafień</b></div></div><button class="primary big" id="popularity-solo-start">Zacznij serię</button></section>`;
  } else if (state.status === "reveal") {
    const result = state.lastResult || {}, metric = result.metric || state.metric, pair = array(result.pair || state.pair).slice(0, 2), winningTrack = result.correctSide === "left" ? pair[0] : result.correctSide === "right" ? pair[1] : null, revealState = { ...state, metric }, selectedEntity = isArtistMetric(metric) ? "artystę" : "piosenkę";
    content += `<section class="popularity-solo-over popularity-solo-reveal ${result.correct ? "is-correct" : "is-wrong"}"><div class="popularity-over-icon">${result.correct ? "✓" : "×"}</div><p class="eyebrow">${result.correct ? "POPRAWNA ODPOWIEDŹ" : "BŁĘDNA ODPOWIEDŹ"}</p><h2>${result.correct ? "Dobra dedukcja!" : "Tym razem nie."}</h2><p class="muted">Wybrano ${selectedEntity} ${result.selected === "left" ? "A" : "B"}. Poprawna odpowiedź: <b>${escapeHtml(popularitySoloAnswerLabel(result, metric))}</b>.</p><div class="popularity-duel-stage popularity-reveal-stage" data-popularity-solo-round="${Number(state.round || 1)}">${soloTrackCard(pair[0], "left", revealState, true)}<div class="popularity-vs"><span>VS</span><i></i></div>${soloTrackCard(pair[1], "right", revealState, true)}</div>${popularityPreviewHtml(winningTrack, metric)}<p class="popularity-solo-reveal-note">Wartości zostaną na ekranie, dopóki nie przejdziesz dalej.</p><div class="popularity-solo-over-actions"><button class="primary big" id="popularity-solo-next">Następna para</button><button class="ghost" id="popularity-solo-stop">Przerwij serię</button></div></section>`;
  } else if (state.status === "over") {
    const result = state.lastResult || {}, pair = result.pair || state.pair;
    const metric = result.metric || state.metric, revealState = { ...state, metric }, winningTrack = result.correctSide === "left" ? pair?.[0] : result.correctSide === "right" ? pair?.[1] : null;
    content += `<section class="popularity-solo-over"><div class="popularity-over-icon">×</div><p class="eyebrow">SERIA ZAKOŃCZONA</p><h2>Streak: ${Number(state.streak || 0)}</h2><p class="muted">Błędna odpowiedź. Poprawna odpowiedź to <b>${escapeHtml(popularitySoloAnswerLabel(result, metric))}</b>.</p><div class="popularity-duel-stage popularity-reveal-stage">${soloTrackCard(pair?.[0], "left", revealState, true)}<div class="popularity-vs"><span>VS</span><i></i></div>${soloTrackCard(pair?.[1], "right", revealState, true)}</div>${popularityPreviewHtml(winningTrack, metric)}<div class="popularity-solo-over-actions"><button class="primary big" id="popularity-solo-restart">Zagraj jeszcze raz</button><button class="ghost" id="popularity-solo-menu">Wróć do muzyki</button></div></section>`;
  } else {
    const pair = array(state.pair).slice(0, 2);
    content += `<section class="popularity-question"><span>🔥</span><div><b>${escapeHtml(metricQuestion(state.metric))}</b><small>${escapeHtml(metricSource(state.metric))} · bez limitu rund</small></div></section><div class="popularity-key-hint"><span>A / D albo ← / →</span><small>Możesz też kliknąć kartę</small></div><div class="popularity-duel-stage" data-popularity-solo-round="${Number(state.round || 1)}">${soloTrackCard(pair[0], "left", state)}<div class="popularity-vs"><span>VS</span><i></i></div>${soloTrackCard(pair[1], "right", state)}</div><div class="popularity-streak-bar"><span>STREAK</span><strong>${Number(state.streak || 0)}</strong><small>Rekord: ${Number(state.best || 0)}</small></div><div class="popularity-solo-controls">${soloMetricButtons(state)}<button class="ghost" id="popularity-solo-stop">Przerwij serię</button></div>`;
  }
  root.innerHTML = `<main class="page popularity-page popularity-solo-page enter"><div class="popularity-solo-layout"><section class="panel popularity-panel popularity-solo-main">${content}<p class="popularity-snapshot-note">Snapshot statystyk jest taki sam dla każdego gracza i nie wymaga połączenia z zewnętrznym API.</p></section>${popularitySoloLeaderboard(accounts, playerId, state, profile, leaderboard)}</div><button id="popularity-solo-home" class="ghost">Wróć do muzyki</button></main>`;
  root.querySelectorAll("[data-popularity-solo-region]").forEach(button => button.addEventListener("click", () => actions.popularitySoloRegion?.(button.dataset.popularitySoloRegion)));
  root.querySelectorAll("[data-popularity-solo-metric]").forEach(button => button.addEventListener("click", () => { actions.popularitySoloMetric(button.dataset.popularitySoloMetric); }));
  root.querySelectorAll("[data-popularity-leaderboard-region]").forEach(button => button.addEventListener("click", () => {
    const region = button.dataset.popularityLeaderboardRegion;
    const metric = root.querySelector("[data-popularity-leaderboard-metric].active")?.dataset.popularityLeaderboardMetric || state.metric;
    root.querySelectorAll("[data-popularity-leaderboard-region]").forEach(tab => { const active = tab.dataset.popularityLeaderboardRegion === region; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", active ? "true" : "false"); });
    root.querySelectorAll("[data-popularity-leaderboard-panel]").forEach(panel => { panel.hidden = panel.dataset.popularityLeaderboardPanel !== `${region}:${metric}`; });
  }));
  root.querySelectorAll("[data-popularity-leaderboard-metric]").forEach(button => button.addEventListener("click", () => {
    const metric = button.dataset.popularityLeaderboardMetric;
    root.querySelectorAll("[data-popularity-leaderboard-metric]").forEach(tab => { const active = tab.dataset.popularityLeaderboardMetric === metric; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", active ? "true" : "false"); });
    const region = root.querySelector("[data-popularity-leaderboard-region].active")?.dataset.popularityLeaderboardRegion || state.region || "global";
    root.querySelectorAll("[data-popularity-leaderboard-panel]").forEach(panel => { panel.hidden = panel.dataset.popularityLeaderboardPanel !== `${region}:${metric}`; });
  }));
  root.querySelector("#popularity-solo-start")?.addEventListener("click", () => actions.popularitySoloStart(state.metric, state.region));
  root.querySelector("#popularity-solo-restart")?.addEventListener("click", () => actions.popularitySoloStart(state.metric, state.region));
  root.querySelector("#popularity-solo-next")?.addEventListener("click", actions.popularitySoloNext);
  root.querySelector("#popularity-solo-stop")?.addEventListener("click", actions.popularitySoloStop);
  root.querySelector("#popularity-solo-menu")?.addEventListener("click", actions.goMusicModes || actions.goPlatform);
  root.querySelector("#popularity-solo-home")?.addEventListener("click", actions.goMusicModes || actions.goPlatform);
  root.querySelectorAll("[data-popularity-choice]").forEach(button => button.addEventListener("click", () => actions.popularitySoloChoose(button.dataset.popularityChoice)));
  if (state.status === "playing") bindPopularityKeyboard(root, actions, {}, true);
  if (["reveal", "over"].includes(state.status)) animatePopularityValues(root);
  Audio.bindTrackVolumeControls(root);
  hydratePopularityArtwork(root, state.pair || state.lastResult?.pair || [], state.metric);
}

export function renderPopularityLobbySettings(room, isHost) {
  const settings = sanitizePopularitySettings(room.settings);
  return `<div class="popularity-settings">${musicRegionPicker(settings.region, "region", isHost, "popularity")}<label class="setting-row"><span>Statystyka do porównania</span><select data-popularity-setting="metric" ${isHost ? "" : "disabled"}><option value="views" ${settings.metric === "views" ? "selected" : ""}>Wyświetlenia piosenek</option><option value="listeners" ${settings.metric === "listeners" ? "selected" : ""}>Miesięczni słuchacze piosenek</option><option value="artistListeners" ${settings.metric === "artistListeners" ? "selected" : ""}>Miesięczni słuchacze artystów</option></select></label><label class="setting-row"><span>Liczba rund</span><select data-popularity-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,7,10,15,20,30].map(value => `<option value="${value}" ${settings.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór</span><select data-popularity-setting="choiceTime" ${isHost ? "" : "disabled"}>${[5,10,15,20,30].map(value => `<option value="${value}" ${settings.choiceTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><label class="setting-row"><span>Reversed<small>Wybierasz element z mniejszą liczbą.</small></span><input type="checkbox" data-popularity-setting="reversed" ${settings.reversed ? "checked" : ""} ${isHost ? "" : "disabled"}></label><p class="tiny">W każdej rundzie pokazujemy dwie opcje. Liczby są ujawniane dopiero po wyborach, a remis daje punkt każdemu trafionemu graczowi.</p></div>`;
}
