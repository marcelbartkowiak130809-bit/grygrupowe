import { avatarHtml, escapeHtml } from "./utils.js?v=20260822-1";

const array = value => Array.isArray(value) ? value : [];
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
};
const deadline = seconds => Date.now() + Math.max(1, Number(seconds) || 10) * 1000;
const cleanMetric = value => value === "listeners" ? "listeners" : "views";
const normalizedText = value => String(value || "").trim().toLocaleLowerCase("pl-PL");

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
  ["taste", "Taste", "Sabrina Carpenter", 300000000, 73000000],
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
  ["kiss-me-more", "Kiss Me More", "Doja Cat ft. SZA", 900000000, 44000000],
  ["say-so", "Say So", "Doja Cat", 1400000000, 44000000],
  ["woman", "Woman", "Doja Cat", 800000000, 44000000],
  ["paint-the-town-red", "Paint The Town Red", "Doja Cat", 600000000, 44000000],
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
  ["poker-face", "Poker Face", "Lady Gaga", 1600000000, 55000000],
  ["bad-romance", "Bad Romance", "Lady Gaga", 1900000000, 55000000],
  ["shallow", "Shallow", "Lady Gaga & Bradley Cooper", 1800000000, 55000000],
  ["applause", "Applause", "Lady Gaga", 600000000, 55000000],
  ["just-dance", "Just Dance", "Lady Gaga", 700000000, 55000000],
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
  ["positions", "positions", "Ariana Grande", 800000000, 86000000],
  ["7-rings", "7 rings", "Ariana Grande", 1500000000, 86000000],
  ["thank-u-next", "thank u, next", "Ariana Grande", 1600000000, 86000000],
  ["no-tears-left-to-cry", "No Tears Left to Cry", "Ariana Grande", 1400000000, 86000000],
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
];

export const popularityTracks = snapshotRows.map(([id, title, artist, views, listeners]) => ({
  id, title, artist, views, listeners,
  query: `${title} ${artist}`,
}));

export const popularityLibrarySize = popularityTracks.length;
export const popularityDefaults = { rounds: 10, choiceTime: 10, metric: "views" };

export function sanitizePopularitySettings(settings = {}) {
  return {
    rounds: clamp(settings.rounds, 3, 30, popularityDefaults.rounds),
    choiceTime: clamp(settings.choiceTime ?? settings.answerTime, 5, 30, popularityDefaults.choiceTime),
    metric: cleanMetric(settings.metric),
  };
}

function trackById(id) { return popularityTracks.find(track => track.id === id) || null; }
function cloneTrack(track) { return track ? { id:track.id, title:track.title, artist:track.artist, views:track.views, listeners:track.listeners } : null; }
function pairKey(pair) { return array(pair).map(track => track?.id || "").sort().join("|"); }
function nextPair(usedIds = [], metric = "views") {
  const used = new Set(array(usedIds));
  let available = popularityTracks.filter(track => !used.has(track.id));
  if (available.length < 2) available = popularityTracks;
  const left = available[Math.floor(Math.random() * available.length)] || popularityTracks[0];
  const rightPool = available.filter(track => track.id !== left.id && (cleanMetric(metric) !== "listeners" || track.artist !== left.artist));
  const safeRightPool = rightPool.length ? rightPool : available.filter(track => track.id !== left.id);
  const right = safeRightPool[Math.floor(Math.random() * safeRightPool.length)] || popularityTracks[1];
  return [cloneTrack(left), cloneTrack(right)];
}

function valueFor(track, metric) { return Number(track?.[cleanMetric(metric)] || 0); }
function correctSide(pair, metric) {
  const left = valueFor(pair?.[0], metric), right = valueFor(pair?.[1], metric);
  return left === right ? "tie" : left > right ? "left" : "right";
}

function resolveRound(game) {
  const pair = array(game.pair).slice(0, 2).map(cloneTrack);
  const choices = object(game.choices), answer = correctSide(pair, game.metric), awarded = [];
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
    pair,
    metric: cleanMetric(game.metric),
    choices: { ...choices },
    correctSide: answer,
    awarded,
  };
  game.phase = "roundResult";
  game.phaseEndsAt = Date.now() + 6500;
}

export function createPopularityGame(players, settings = {}) {
  const clean = sanitizePopularitySettings(settings);
  const list = [...new Set(array(players).map(String).filter(Boolean))].slice(0, 8);
  const pair = nextPair([], clean.metric);
  return {
    mode: "popularnosc-hitow",
    phase: "choosing",
    round: 1,
    totalRounds: clean.rounds,
    players: list,
    metric: clean.metric,
    pair,
    usedIds: pair.map(track => track.id),
    choices: {},
    scores: Object.fromEntries(list.map(uid => [uid, 0])),
    roundResult: null,
    finished: false,
    phaseEndsAt: deadline(clean.choiceTime),
  };
}

export const PopularityEngine = {
  choose(game, uid, side) {
    if (game.phase !== "choosing") return "Wybór w tej rundzie jest już zamknięty.";
    if (!array(game.players).includes(uid)) return "Nie bierzesz udziału w tej grze.";
    if (!["left", "right"].includes(side)) return "Wybierz jedną z dwóch piosenek.";
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
    const clean = sanitizePopularitySettings({ ...settings, metric:game.metric });
    if (Number(game.round) >= Number(game.totalRounds || clean.rounds)) {
      game.phase = "gameSummary";
      game.finished = true;
      game.phaseEndsAt = null;
      return;
    }
    const usedIds = [...new Set([...array(game.usedIds), ...array(game.pair).map(track => track?.id).filter(Boolean)])];
    const pair = nextPair(usedIds, clean.metric);
    game.round = Number(game.round || 1) + 1;
    game.pair = pair;
    game.usedIds = [...new Set([...usedIds, ...pair.map(track => track.id)])].slice(-popularityTracks.length);
    game.choices = {};
    game.roundResult = null;
    game.phase = "choosing";
    game.phaseEndsAt = deadline(clean.choiceTime);
  },
  botChoice(game) {
    const answer = correctSide(game.pair, game.metric);
    if (answer === "tie") return Math.random() < .5 ? "left" : "right";
    return Math.random() < .78 ? answer : answer === "left" ? "right" : "left";
  },
};

function metricLabel(metric) { return cleanMetric(metric) === "listeners" ? "miesięcznych słuchaczy" : "wyświetleń"; }
function metricShortLabel(metric) { return cleanMetric(metric) === "listeners" ? "SŁUCHACZY" : "WYŚWIETLEŃ"; }
export function formatPopularityValue(value, metric) {
  const number = Number(value) || 0;
  return `${new Intl.NumberFormat("pl-PL", { notation:"compact", maximumFractionDigits:1 }).format(number)} ${cleanMetric(metric) === "listeners" ? "słuch." : "wyśw."}`;
}
function metricQuestion(metric) { return cleanMetric(metric) === "listeners" ? "Kto ma więcej miesięcznych słuchaczy?" : "Co ma więcej wyświetleń?"; }
function metricSource(metric) { return cleanMetric(metric) === "listeners" ? "Spotify · snapshot słuchaczy" : "YouTube · snapshot wyświetleń"; }
function hashColor(value) {
  let hash = 0;
  for (const char of String(value || "")) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}
function safeNick(accounts, uid) { return accounts?.[uid]?.nick || accounts?.[uid]?.displayName || "Gracz"; }
function userProfile(accounts, room, uid) { return { ...(room?.playerProfiles?.[uid] || {}), ...(accounts?.[uid] || {}), nick:safeNick(accounts, uid), uid }; }
function popularityArt(track, side, reveal = false) {
  if (!track) return "";
  const hue = hashColor(track.artist);
  return `<div class="popularity-art is-loading ${reveal ? "is-revealed" : ""}" data-popularity-artwork data-artwork-query="${escapeHtml(track.query || `${track.title} ${track.artist}`)}" style="--popularity-hue:${hue}"><span class="popularity-art-note">♫</span><small>${escapeHtml(track.artist)}</small></div>`;
}
function popularityTrackCard(track, side, { selected = false, reveal = false, correct = false, metric = "views" } = {}) {
  const title = track?.title || "Brak utworu", artist = track?.artist || "", value = reveal ? `<strong class="popularity-value" data-popularity-number="${valueFor(track, metric)}" data-popularity-metric="${cleanMetric(metric)}">${formatPopularityValue(0, metric)}</strong>` : `<span class="popularity-hidden-value">???</span>`;
  return `<button class="popularity-choice popularity-${side} ${selected ? "is-selected" : ""} ${reveal && correct ? "is-correct" : ""} ${reveal && !correct ? "is-wrong" : ""}" data-popularity-choice="${side}" aria-label="${escapeHtml(`Wybierz piosenkę ${side === "left" ? "A" : "B"}: ${title} — ${artist}`)}" aria-pressed="${selected ? "true" : "false"}" ${reveal || selected ? "disabled" : ""}><span class="popularity-side-label">${side === "left" ? "A" : "B"}</span>${popularityArt(track, side, reveal)}<span class="popularity-track-copy"><b>${escapeHtml(title)}</b><small>${escapeHtml(artist)}</small>${value}</span>${reveal ? `<span class="popularity-reveal-mark">${correct ? "✓" : "×"}</span>` : ""}</button>`;
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
    return `<div class="popularity-pick-row ${awarded ? "is-awarded" : ""}">${avatarHtml(profile, "popularity-avatar", { disableIdle:true })}<span><b>${escapeHtml(safeNick(accounts, uid))}</b><small>${choice ? `wybrał piosenkę ${choice === "left" ? "A" : "B"}` : "nie oddał głosu"}</small></span><strong>${awarded ? "+1 pkt" : "—"}</strong></div>`;
  }).join("");
}
function popularityHeader(game, solo = false) {
  const round = Number(game.round || 1), total = Number(game.totalRounds || 1);
  return `<div class="popularity-heading"><div><p class="eyebrow">${solo ? "TRYB SOLO" : "KTO MA WIĘCEJ?"}</p><h1>${solo ? "Najpopularniejszy numer" : metricQuestion(game.metric)}</h1><p class="muted">${solo ? "Zbuduj jak najdłuższy streak, wybierając większą liczbę." : "Masz chwilę na wybór. Potem sprawdzimy, kto miał rację."}</p></div><div class="popularity-round-badge"><b>${solo ? "STREAK" : `RUNDA ${round}/${total}`}</b><strong>${solo ? Number(game.streak || 0) : metricShortLabel(game.metric)}</strong></div></div>`;
}

let popularityTimer = 0;
let popularityInterval = 0;
let popularityAnimationFrame = 0;
let popularityKeyHandler = null;
export function stopPopularityTimer() {
  window.clearTimeout(popularityTimer);
  window.clearInterval(popularityInterval);
  if (popularityAnimationFrame) window.cancelAnimationFrame(popularityAnimationFrame);
  if (popularityKeyHandler) window.removeEventListener("keydown", popularityKeyHandler);
  popularityTimer = 0;
  popularityInterval = 0;
  popularityAnimationFrame = 0;
  popularityKeyHandler = null;
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

const artworkCache = new Map();
async function findArtwork(query) {
  const value = normalizedText(query);
  if (!value || typeof fetch !== "function") return "";
  if (artworkCache.has(value)) return artworkCache.get(value);
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=3&country=PL`);
    const data = await response.json();
    const url = data?.results?.find(item => item?.artworkUrl100)?.artworkUrl100?.replace(/100x100/g, "600x600") || "";
    artworkCache.set(value, url);
    return url;
  } catch {
    artworkCache.set(value, "");
    return "";
  }
}
function hydratePopularityArtwork(root, tracks) {
  const dataset = root.dataset || (root.dataset = {});
  const token = dataset.popularityArtToken = String((Number(dataset.popularityArtToken) || 0) + 1);
  array(tracks).filter(Boolean).forEach(track => {
    findArtwork(track.query || `${track.title} ${track.artist}`).then(url => {
      if (("isConnected" in root && !root.isConnected) || dataset.popularityArtToken !== token) return;
      const query = track.query || `${track.title} ${track.artist}`;
      [...root.querySelectorAll("[data-artwork-query]")].filter(element => element.dataset.artworkQuery === query).forEach(element => {
        element.classList.remove("is-loading");
        if (url) {
          element.style.backgroundImage = `linear-gradient(135deg, hsla(${hashColor(track.artist)}, 80%, 40%, .22), rgba(2, 6, 23, .56)), url("${url}")`;
          element.classList.add("has-artwork");
        }
      });
    });
  });
}

function popularityReadyPlayers(game, accounts, room) {
  const choices = object(game.choices), ready = array(game.players).filter(uid => uid in choices);
  if (!ready.length) return "";
  return `<div class="popularity-ready-avatars" aria-label="${ready.length} graczy już wybrało"><span>${ready.length}</span>${ready.slice(0, 8).map(uid => avatarHtml(userProfile(accounts, room, uid), "popularity-avatar", { disableIdle:true })).join("")}</div>`;
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
    content += `<section class="popularity-question"><span>📊</span><div><b>${escapeHtml(metricQuestion(game.metric))}</b><small>${escapeHtml(metricSource(game.metric))} · ${popularityLibrarySize} utworów w bazie</small></div></section><div class="popularity-key-hint"><span>A / D albo ← / →</span><small>Możesz też kliknąć kartę</small></div><div class="popularity-duel-stage" data-popularity-round="${Number(game.round || 1)}">${popularityTrackCard(pair[0], "left", { selected:selected === "left", metric:game.metric })}<div class="popularity-vs"><span>VS</span><i></i></div>${popularityTrackCard(pair[1], "right", { selected:selected === "right", metric:game.metric })}</div><div class="popularity-live-timer">Zaznacz do końca <b data-popularity-time></b></div>${chosen}`;
  } else if (game.phase === "roundResult") {
    const correct = result.correctSide, leftCorrect = correct === "tie" || correct === "left", rightCorrect = correct === "tie" || correct === "right";
    content += `<section class="popularity-reveal-banner"><span class="popularity-reveal-icon">${correct === "tie" ? "=" : "✦"}</span><div><p class="eyebrow">UJAWNIENIE</p><h2>${correct === "tie" ? "Remis — oba wybory były trafione" : `Więcej ${escapeHtml(metricLabel(game.metric))} ma piosenka ${correct === "left" ? "A" : "B"}`}</h2><p>${escapeHtml(metricSource(game.metric))} · ${escapeHtml(popularityMargin(pair, game.metric))}</p></div></section><div class="popularity-duel-stage popularity-reveal-stage" data-popularity-round="${Number(game.round || 1)}">${popularityTrackCard(pair[0], "left", { selected:Object.values(result.choices || {}).includes("left"), reveal:true, correct:leftCorrect, metric:game.metric })}<div class="popularity-vs"><span>VS</span><i></i></div>${popularityTrackCard(pair[1], "right", { selected:Object.values(result.choices || {}).includes("right"), reveal:true, correct:rightCorrect, metric:game.metric })}</div><section class="popularity-picks-panel"><div class="section-heading"><div><p class="eyebrow">WASZE WYBORY</p><h2>Kto trafił?</h2></div><span class="badge">${array(result.awarded).length}/${game.players.length}</span></div><div class="popularity-picks-list">${popularityPlayerPicks(game, accounts, room)}</div></section><section class="popularity-ranking"><p class="eyebrow">AKTUALNY RANKING</p>${popularityRanking(game, accounts, room)}</section><button class="primary big" id="popularity-next">${Number(game.round) >= Number(game.totalRounds) ? "Pokaż końcowy ranking" : "Następna para"}</button>`;
  } else {
    const top = Math.max(0, ...game.players.map(uid => Number(game.scores?.[uid] || 0))), winners = game.players.filter(uid => Number(game.scores?.[uid] || 0) === top && top > 0);
    content += `<section class="popularity-final"><span class="popularity-trophy">🏆</span><p class="eyebrow">KONIEC GRY</p><h2>${winners.length ? `Wygrywa ${winners.map(uid => escapeHtml(safeNick(accounts, uid))).join(", ")}!` : "Tym razem bez zwycięzcy"}</h2><p class="muted">Każdy trafny wybór dawał punkt.</p><section class="popularity-ranking">${popularityRanking(game, accounts, room)}</section><button class="primary big" id="popularity-lobby">Zagraj ponownie</button></section>`;
  }
  root.innerHTML = `<main class="page popularity-page enter"><section class="panel popularity-panel">${content}<p class="popularity-snapshot-note">Liczby są stałym snapshotem rundy — wszyscy grają na tych samych danych.</p></section><button id="popularity-leave" class="ghost">Wyjdź z pokoju</button></main>`;
  root.querySelectorAll("[data-popularity-choice]").forEach(button => button.addEventListener("click", () => actions.popularityChoose(button.dataset.popularityChoice, expected)));
  root.querySelector("#popularity-next")?.addEventListener("click", actions.popularityNext);
  root.querySelector("#popularity-lobby")?.addEventListener("click", actions.returnToRoom);
  root.querySelector("#popularity-leave")?.addEventListener("click", () => actions.leaveRoom());
  schedulePopularityTimer(game, actions, expected);
  if (game.phase === "choosing") bindPopularityKeyboard(root, actions, expected);
  if (game.phase === "roundResult") animatePopularityValues(root);
  hydratePopularityArtwork(root, pair);
}

const soloStorageKey = playerId => `grygrupowe-popularity-solo-v1:${String(playerId || "guest")}`;
let soloState = null;
let soloOwner = "";
function readSoloState(playerId) {
  const owner = String(playerId || "guest"), key = soloStorageKey(owner);
  if (soloOwner === owner && soloState) return soloState;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    soloState = parsed && typeof parsed === "object" ? parsed : { status:"idle", playerId:owner, metric:"views", streak:0, best:0, round:0, usedIds:[], pair:[], lastResult:null };
  } catch { soloState = { status:"idle", playerId:owner, metric:"views", streak:0, best:0, round:0, usedIds:[], pair:[], lastResult:null }; }
  soloOwner = owner;
  return soloState;
}
function saveSoloState(state) {
  try { localStorage.setItem(soloStorageKey(state.playerId), JSON.stringify(state)); } catch {}
}
function createSoloPair(usedIds, metric) { return nextPair(usedIds, metric); }
export function startPopularitySolo(playerId, metric = "views") {
  const owner = String(playerId || "guest"), previous = readSoloState(owner), clean = cleanMetric(metric), pair = createSoloPair([], clean);
  const best = Math.max(Number(previous.best) || 0, Number(previous.streak) || 0);
  soloState = { status:"playing", playerId:owner, metric:clean, streak:0, best, round:1, usedIds:pair.map(track => track.id), pair, lastResult:null };
  soloOwner = owner; saveSoloState(soloState); return soloState;
}
export function stopPopularitySolo(playerId) {
  const state = readSoloState(playerId);
  state.status = "idle"; state.pair = []; state.round = 0; state.streak = 0; state.lastResult = null; saveSoloState(state); return state;
}
export function setPopularitySoloMetric(playerId, metric) {
  const state = readSoloState(playerId); state.metric = cleanMetric(metric); saveSoloState(state); return state;
}
export function choosePopularitySolo(playerId, side) {
  const state = readSoloState(playerId);
  if (state.status !== "playing") return state;
  const answer = correctSide(state.pair, state.metric), correct = answer === "tie" || side === answer;
  state.lastResult = { pair:state.pair.map(cloneTrack), metric:state.metric, selected:side, correctSide:answer, correct };
  if (!correct) { state.status = "over"; state.best = Math.max(Number(state.best) || 0, Number(state.streak) || 0); saveSoloState(state); return state; }
  state.streak = Number(state.streak || 0) + 1; state.best = Math.max(Number(state.best) || 0, state.streak); state.round = Number(state.round || 0) + 1;
  const usedIds = [...new Set([...array(state.usedIds), ...array(state.pair).map(track => track?.id).filter(Boolean)])];
  state.pair = createSoloPair(usedIds, state.metric); state.usedIds = [...new Set([...usedIds, ...state.pair.map(track => track.id)])].slice(-popularityTracks.length); saveSoloState(state); return state;
}
export const PopularitySoloEngine = { start:startPopularitySolo, stop:stopPopularitySolo, choose:choosePopularitySolo, setMetric:setPopularitySoloMetric };

function soloMetricButtons(state) { return `<div class="popularity-metric-switch" role="tablist" aria-label="Rodzaj statystyki">${[["views", "Wyświetlenia"], ["listeners", "Miesięczni słuchacze"]].map(([id, label]) => `<button type="button" class="${state.metric === id ? "active" : ""}" data-popularity-solo-metric="${id}">${label}</button>`).join("")}</div>`; }
function soloTrackCard(track, side, state, reveal = false) { return popularityTrackCard(track, side, { selected:reveal && state.lastResult?.selected === side, reveal, correct:reveal && (state.lastResult?.correctSide === "tie" || state.lastResult?.correctSide === side), metric:state.metric }); }

export function renderPopularitySolo(root, { profile, playerId }, actions) {
  const state = readSoloState(playerId), game = { ...state, totalRounds:0 };
  let content = popularityHeader(game, true);
  if (state.status === "idle") {
    content += `<section class="popularity-solo-start"><div class="popularity-solo-icon">♫</div><p class="eyebrow">SZYBKI SOLO RUN</p><h2>Ile trafień zrobisz z rzędu?</h2><p class="muted">Klikasz większą liczbę, następna para pojawia się od razu. Możesz przerwać serię w dowolnym momencie.</p>${soloMetricButtons(state)}<div class="popularity-best-card"><span>🏆</span><div><small>TWÓJ REKORD</small><b>${Number(state.best || 0)} trafień</b></div></div><button class="primary big" id="popularity-solo-start">Zacznij serię</button></section>`;
  } else if (state.status === "over") {
    const result = state.lastResult || {}, pair = result.pair || state.pair;
    content += `<section class="popularity-solo-over"><div class="popularity-over-icon">${result.correct ? "✦" : "×"}</div><p class="eyebrow">SERIA ZAKOŃCZONA</p><h2>Streak: ${Number(state.streak || 0)}</h2><p class="muted">Poprawna odpowiedź to ${result.correctSide === "tie" ? "remis" : result.correctSide === "left" ? "piosenka A" : "piosenka B"}.</p><div class="popularity-duel-stage popularity-reveal-stage">${soloTrackCard(pair?.[0], "left", state, true)}<div class="popularity-vs"><span>VS</span><i></i></div>${soloTrackCard(pair?.[1], "right", state, true)}</div><div class="popularity-solo-over-actions"><button class="primary big" id="popularity-solo-restart">Zagraj jeszcze raz</button><button class="ghost" id="popularity-solo-menu">Wróć do menu</button></div></section>`;
  } else {
    const pair = array(state.pair).slice(0, 2);
    content += `<section class="popularity-question"><span>🔥</span><div><b>Co ma więcej ${escapeHtml(metricLabel(state.metric))}?</b><small>${escapeHtml(metricSource(state.metric))} · bez limitu rund</small></div></section><div class="popularity-key-hint"><span>A / D albo ← / →</span><small>Możesz też kliknąć kartę</small></div><div class="popularity-duel-stage" data-popularity-solo-round="${Number(state.round || 1)}">${soloTrackCard(pair[0], "left", state)}<div class="popularity-vs"><span>VS</span><i></i></div>${soloTrackCard(pair[1], "right", state)}</div><div class="popularity-streak-bar"><span>STREAK</span><strong>${Number(state.streak || 0)}</strong><small>Rekord: ${Number(state.best || 0)}</small></div><div class="popularity-solo-controls">${soloMetricButtons(state)}<button class="ghost" id="popularity-solo-stop">Przerwij serię</button></div>`;
  }
  root.innerHTML = `<main class="page popularity-page popularity-solo-page enter"><section class="panel popularity-panel">${content}<p class="popularity-snapshot-note">Snapshot statystyk jest taki sam dla każdego gracza i nie wymaga połączenia z zewnętrznym API.</p></section><button id="popularity-solo-home" class="ghost">Wróć do menu</button></main>`;
  root.querySelectorAll("[data-popularity-solo-metric]").forEach(button => button.addEventListener("click", () => { actions.popularitySoloMetric(button.dataset.popularitySoloMetric); }));
  root.querySelector("#popularity-solo-start")?.addEventListener("click", () => actions.popularitySoloStart(state.metric));
  root.querySelector("#popularity-solo-restart")?.addEventListener("click", () => actions.popularitySoloStart(state.metric));
  root.querySelector("#popularity-solo-stop")?.addEventListener("click", actions.popularitySoloStop);
  root.querySelector("#popularity-solo-menu")?.addEventListener("click", actions.goPlatform);
  root.querySelector("#popularity-solo-home")?.addEventListener("click", actions.goPlatform);
  root.querySelectorAll("[data-popularity-choice]").forEach(button => button.addEventListener("click", () => actions.popularitySoloChoose(button.dataset.popularityChoice)));
  if (state.status === "playing") bindPopularityKeyboard(root, actions, {}, true);
  if (state.status === "over") animatePopularityValues(root);
  hydratePopularityArtwork(root, state.pair || state.lastResult?.pair || []);
}

export function renderPopularityLobbySettings(room, isHost) {
  const settings = sanitizePopularitySettings(room.settings);
  return `<div class="popularity-settings"><label class="setting-row"><span>Statystyka do porównania</span><select data-popularity-setting="metric" ${isHost ? "" : "disabled"}><option value="views" ${settings.metric === "views" ? "selected" : ""}>Wyświetlenia na YouTube</option><option value="listeners" ${settings.metric === "listeners" ? "selected" : ""}>Miesięczni słuchacze na Spotify</option></select></label><label class="setting-row"><span>Liczba rund</span><select data-popularity-setting="rounds" ${isHost ? "" : "disabled"}>${[3,5,7,10,15,20,30].map(value => `<option value="${value}" ${settings.rounds === value ? "selected" : ""}>${value}</option>`).join("")}</select></label><label class="setting-row"><span>Czas na wybór</span><select data-popularity-setting="choiceTime" ${isHost ? "" : "disabled"}>${[5,10,15,20,30].map(value => `<option value="${value}" ${settings.choiceTime === value ? "selected" : ""}>${value}s</option>`).join("")}</select></label><p class="tiny">W każdej rundzie pokazujemy dwa utwory. Liczby są ujawniane dopiero po wyborach, a remis daje punkt każdemu trafionemu graczowi.</p></div>`;
}
