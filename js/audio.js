const STORAGE_KEY = "udowodnij_audio_v1";
const defaults = { muted: false, musicVolume: 0.16, sfxVolume: 0.34 };
const playlist = [
  { name: "Neon Rush", bass:[98.00,98.00,130.81,146.83], arp:[392.00,493.88,587.33,783.99,659.25,493.88] },
  { name: "Table Voltage", bass:[110.00,146.83,123.47,164.81], arp:[440.00,554.37,659.25,880.00,739.99,554.37] },
  { name: "Afterparty Cards", bass:[87.31,116.54,130.81,103.83], arp:[349.23,436.05,523.25,698.46,587.33,436.05] },
];
const sfx = {
  buttonClick: [420, 0.04, "sine", 0.2],
  buttonHover: [620, 0.018, "sine", 0.045],
  purchase: [520, 0.16, "triangle", 0.65],
  success: [660, 0.18, "triangle", 0.74],
  error: [180, 0.18, "sawtooth", 0.5],
  joinRoom: [440, 0.12, "sine", 0.56],
  playerJoin: [520, 0.14, "triangle", 0.58],
  playerLeave: [270, 0.12, "sine", 0.34],
  leaveRoom: [260, 0.12, "sine", 0.38],
  gameStart: [330, 0.22, "triangle", 0.6],
  roundEnd: [560, 0.2, "sine", 0.55],
  countdown: [760, 0.07, "square", 0.22],
  notification: [700, 0.1, "sine", 0.36],
  modalOpen: [360, 0.08, "sine", 0.24],
  modalClose: [280, 0.07, "sine", 0.2],
  choice: [510, 0.12, "triangle", 0.7],
  submit: [480, 0.08, "triangle", 0.34],
  clue: [560, 0.09, "sine", 0.42],
  chat: [690, 0.055, "sine", 0.2],
  vote: [310, 0.1, "triangle", 0.46],
  turn: [590, 0.1, "triangle", 0.38],
  bid: [470, 0.08, "triangle", 0.34],
  challenge: [170, 0.16, "sawtooth", 0.58],
  ready: [620, 0.08, "sine", 0.32],
  phase: [390, 0.11, "triangle", 0.38],
  shopOpen: [560, 0.11, "triangle", 0.42],
  catalogOpen: [720, 0.12, "sine", 0.38],
  equip: [740, 0.1, "triangle", 0.52],
  questClaim: [620, 0.18, "triangle", 0.7],
  poll: [520, 0.12, "triangle", 0.46],
  report: [220, 0.13, "sawtooth", 0.42],
  inbox: [640, 0.1, "sine", 0.38],
  candyPick: [880, 0.08, "triangle", 0.42],
  candyPoison: [160, 0.18, "sawtooth", 0.56],
  candySafe: [640, 0.12, "triangle", 0.48],
  candyDeath: [95, 0.38, "sawtooth", 0.68],
  cooldown: [480, 0.07, "square", 0.18],
};

function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return { ...defaults };
  }
}

let settings = loadSettings();
let context;
let musicGain;
let ambientTimer;
let trackIndex = 0;
let started = false;

function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = context.createGain();
    musicGain.connect(context.destination);
  }
  if (context.state === "suspended") context.resume();
  updateGains();
  return context;
}

function updateGains() {
  if (musicGain) musicGain.gain.value = settings.muted ? 0 : settings.musicVolume;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  updateGains();
  window.dispatchEvent(new CustomEvent("audio:change"));
}

function tone(frequency, duration, type = "sine", gain = 0.4, destination) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const volume = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  volume.gain.setValueAtTime(0.0001, ctx.currentTime);
  volume.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.025);
  volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(volume);
  volume.connect(destination || ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.03);
}

function noise(duration = 0.12, gain = 0.25, destination, filterFrequency = 9000) {
  const ctx = getContext();
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const volume = ctx.createGain();
  filter.type = "highpass";
  filter.frequency.value = filterFrequency;
  volume.gain.setValueAtTime(0.0001, ctx.currentTime);
  volume.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(volume);
  volume.connect(destination || ctx.destination);
  source.start();
}

function scheduleAmbient() {
  clearInterval(ambientTimer);
  let beat = 0;
  const playAmbientNote = () => {
    if (!started || settings.muted || settings.musicVolume === 0) return;
    const track = playlist[trackIndex];
    const bass = track.bass[Math.floor(beat / 2) % track.bass.length];
    const arp = track.arp[beat % track.arp.length];
    if (beat % 2 === 0) tone(bass, .34, "triangle", 0.065, musicGain);
    tone(arp, .16, beat % 3 === 0 ? "square" : "triangle", 0.027, musicGain);
    if (beat % 4 === 1) tone(arp * 1.5, .13, "sine", 0.018, musicGain);
    if (beat % 2 === 1) noise(.035, 0.014, musicGain, 7000);
    beat += 1;
    if (beat % 32 === 0) trackIndex = (trackIndex + 1) % playlist.length;
  };
  playAmbientNote();
  ambientTimer = setInterval(playAmbientNote, 430);
}

function sequence(notes, gap = 80) {
  notes.forEach(([frequency,duration,type,gain],index)=>setTimeout(()=>tone(frequency,duration,type,gain*settings.sfxVolume),index*gap));
}

function percussion(kind) {
  if (kind === "kick") return sequence([[82,.09,"sine",.85],[48,.12,"triangle",.45]],28);
  if (kind === "snap") return noise(.055, settings.sfxVolume * .5, undefined, 3500);
  if (kind === "spark") return sequence([[940,.035,"sine",.35],[1260,.045,"triangle",.28]],38);
}

export const Audio = {
  init() {
    document.addEventListener("pointerdown", () => {
      if (!started) {
        started = true;
        getContext();
        scheduleAmbient();
      }
    }, { once: true });
  },
  play(name) {
    if (!started || settings.muted || settings.sfxVolume === 0) return;
    if (name === "shopOpen") return sequence([[420,.07,"triangle",.38],[560,.08,"triangle",.44],[760,.13,"sine",.36]],55);
    if (name === "catalogOpen") return sequence([[520,.05,"sine",.25],[660,.05,"sine",.28],[820,.08,"triangle",.34],[1040,.12,"sine",.26]],42);
    if (name === "equip") return sequence([[740,.05,"triangle",.5],[980,.08,"sine",.46],[620,.11,"triangle",.28]],48);
    if (name === "cosmeticCommon") return sequence([[520,.07,"triangle",.32],[660,.09,"sine",.26]],58);
    if (name === "cosmeticRare") return sequence([[520,.06,"triangle",.36],[720,.08,"triangle",.34],[960,.12,"sine",.28]],48);
    if (name === "cosmeticEpic") return sequence([[390,.05,"square",.28],[780,.08,"triangle",.42],[1170,.14,"sine",.34]],50);
    if (name === "cosmeticLegendary") { percussion("spark"); return sequence([[330,.07,"triangle",.42],[660,.08,"triangle",.52],[990,.12,"sine",.46],[1320,.18,"triangle",.34]],55); }
    if (name === "cosmeticMythic") { noise(.18, settings.sfxVolume * .32, undefined, 900); return sequence([[110,.16,"sawtooth",.48],[440,.09,"square",.42],[880,.14,"triangle",.56],[1760,.24,"sine",.36]],70); }
    if (name === "winCrown" || name === "levelChampionWin") return sequence([[520,.08,"triangle",.52],[780,.1,"triangle",.6],[1040,.24,"sine",.45]],70);
    if (name === "winLaser") return sequence([[740,.06,"square",.34],[1240,.08,"sawtooth",.32],[980,.06,"square",.34],[1480,.12,"sine",.25]],45);
    if (name === "winMoney" || name === "winRoyalRain") return sequence([[660,.045,"triangle",.4],[880,.045,"triangle",.36],[660,.045,"triangle",.4],[1100,.09,"sine",.28]],42);
    if (name === "winDemonKing" || name === "loseDemonLaugh") return this.play("evilLaugh");
    if (name === "loseBlackHole" || name === "levelVoidLose") { noise(.24, settings.sfxVolume * .24, undefined, 180); return sequence([[160,.18,"sawtooth",.45],[120,.22,"sawtooth",.38],[82,.3,"sine",.32]],82); }
    if (name === "loseMeteorHit" || name === "winMeteor") { percussion("kick"); setTimeout(()=>noise(.13, settings.sfxVolume * .38, undefined, 450),90); return sequence([[180,.08,"sawtooth",.52],[92,.22,"sawtooth",.46]],80); }
    if (name === "questClaim") return sequence([[480,.08,"triangle",.42],[720,.11,"triangle",.54],[960,.16,"sine",.42]],65);
    if (name === "poll") return sequence([[360,.06,"triangle",.32],[520,.08,"triangle",.42],[680,.1,"sine",.34]],55);
    if (name === "report") return sequence([[240,.08,"sawtooth",.42],[180,.12,"square",.28]],75);
    if (name === "inbox") return sequence([[620,.07,"sine",.35],[820,.11,"triangle",.28]],75);
    if (name === "candyPick") return sequence([[900,.035,"triangle",.35],[1150,.055,"sine",.22]],38);
    if (name === "candyPoison") return sequence([[130,.1,"sawtooth",.46],[210,.08,"square",.32],[95,.18,"sawtooth",.28]],55);
    if (name === "candySafe") return sequence([[520,.06,"triangle",.35],[700,.09,"sine",.32]],52);
    if (name === "candyDeath") { percussion("kick"); return sequence([[180,.11,"sawtooth",.58],[90,.34,"square",.4]],78); }
    if (name === "impactStart") return sequence([[120,.18,"sawtooth",.75],[220,.2,"triangle",.72],[440,.28,"sine",.6]],70);
    if (name === "impactSuccess") return sequence([[160,.09,"square",.58],[520,.14,"triangle",.92],[810,.22,"sine",.72],[1080,.18,"triangle",.45]],52);
    if (name === "impactMiss") return sequence([[190,.18,"sawtooth",.82],[118,.28,"square",.58],[82,.32,"sawtooth",.34]],62);
    if (name === "victory") return sequence([[260,.16,"triangle",.64],[390,.16,"triangle",.7],[520,.18,"triangle",.78],[780,.35,"sine",.65]],90);
    if (name === "defeat") return sequence([[240,.16,"sawtooth",.52],[170,.2,"sawtooth",.48],[95,.42,"square",.36]],100);
    if (name === "detect") return sequence([[110,.22,"sawtooth",.55],[440,.12,"square",.5],[660,.16,"triangle",.65],[880,.26,"sine",.55]],80);
    if (name === "evilLaugh") return sequence([[155,.18,"sawtooth",.5],[122,.16,"square",.42],[170,.18,"sawtooth",.5],[112,.18,"square",.42],[150,.3,"sawtooth",.5]],125);
    if (name === "reveal") return sequence([[220,.1,"triangle",.48],[440,.14,"triangle",.6],[760,.25,"sine",.5]],75);
    if (name === "voteHit") return sequence([[120,.18,"square",.44],[280,.16,"triangle",.55],[190,.28,"sawtooth",.42]],75);
    if (!sfx[name]) return;
    const [frequency, duration, type, gain] = sfx[name];
    tone(frequency, duration, type, gain * settings.sfxVolume);
    if (name === "purchase" || name === "success" || name === "gameStart" || name === "playerJoin") {
      setTimeout(() => tone(frequency * 1.25, duration, type, gain * settings.sfxVolume), 85);
    }
  },
  bindGlobalUI() {
    document.addEventListener("click", event => {
      if (event.target.closest("button")) this.play("buttonClick");
    });
    document.addEventListener("pointerover", event => {
      const button=event.target.closest("button");
      if (button&&!button.contains(event.relatedTarget)) this.play("buttonHover");
    });
  },
  get settings() {
    return { ...settings };
  },
  setMusicVolume(value) {
    settings.musicVolume = Number(value);
    persist();
  },
  setSfxVolume(value) {
    settings.sfxVolume = Number(value);
    persist();
  },
  setMuted(value) {
    settings.muted = Boolean(value);
    persist();
  },
  get currentTrack() {
    return playlist[trackIndex].name;
  },
};
