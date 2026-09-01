const STORAGE_KEY = "udowodnij_audio_v1";
const defaults = { muted: false, musicVolume: 0.16, sfxVolume: 0.34 };
const playlist = [
  { name: "Neon Rush", bass:[98.00,98.00,130.81,146.83], arp:[392.00,493.88,587.33,783.99,659.25,493.88] },
  { name: "Table Voltage", bass:[110.00,146.83,123.47,164.81], arp:[440.00,554.37,659.25,880.00,739.99,554.37] },
  { name: "Afterparty Cards", bass:[87.31,116.54,130.81,103.83], arp:[349.23,436.05,523.25,698.46,587.33,436.05] },
];
const ambientChords = [
  [[98,123.47,146.83],[110,130.81,164.81],[123.47,146.83,185],[87.31,110,130.81]],
  [[110,138.59,164.81],[146.83,174.61,220],[123.47,146.83,185],[98,123.47,146.83]],
  [[87.31,110,130.81],[103.83,130.81,155.56],[116.54,146.83,174.61],[77.78,98,116.54]],
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
  toggleOn: [580, 0.07, "sine", 0.28],
  toggleOff: [300, 0.07, "sine", 0.22],
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
  boardTurn: [590, 0.09, "triangle", 0.34],
  boardMove: [410, 0.08, "triangle", 0.38],
  boardDice: [250, 0.07, "square", 0.42],
  boardCapture: [155, 0.16, "sawtooth", 0.48],
  boardShot: [430, 0.07, "square", 0.35],
  boardHit: [760, 0.12, "triangle", 0.6],
  boardMiss: [210, 0.13, "sine", 0.3],
  boardWord: [520, 0.1, "triangle", 0.46],
  boardFlip: [670, 0.06, "sine", 0.32],
  boardPair: [720, 0.16, "triangle", 0.62],
  boardDrop: [330, 0.12, "triangle", 0.54],
  boardDomino: [460, 0.09, "triangle", 0.44],
  boardDraw: [300, 0.1, "sine", 0.34],
  boardPass: [280, 0.09, "sine", 0.26],
  boardVictory: [520, 0.24, "triangle", 0.7],
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
let musicFilter;
let musicCompressor;
let ambientTimer;
let trackIndex = 0;
let started = false;

function getContext() {
  if (!context) {
    context = new (window.AudioContext || window.webkitAudioContext)();
    musicGain = context.createGain();
    musicFilter = context.createBiquadFilter();
    musicFilter.type = "lowpass";
    musicFilter.frequency.value = 5200;
    musicCompressor = context.createDynamicsCompressor();
    musicCompressor.threshold.value = -22;
    musicCompressor.knee.value = 18;
    musicCompressor.ratio.value = 4;
    musicCompressor.attack.value = 0.012;
    musicCompressor.release.value = 0.18;
    musicGain.connect(musicFilter);
    musicFilter.connect(musicCompressor);
    musicCompressor.connect(context.destination);
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
    const chord = ambientChords[trackIndex][Math.floor(beat / 8) % 4];
    if (beat % 8 === 0) chord.forEach((frequency, index) => tone(frequency * 2, 1.45, "sine", 0.017 - index * 0.002, musicGain));
    if (beat % 2 === 0) tone(bass / 2, .38, "sine", 0.045, musicGain);
    tone(bass, .3, "triangle", 0.052, musicGain);
    tone(arp, .22, beat % 4 === 0 ? "sine" : "triangle", 0.034, musicGain);
    if (beat % 4 === 2) tone(arp * 1.5, .16, "sine", 0.022, musicGain);
    if (beat % 4 === 0) tone(72, .12, "sine", 0.032, musicGain);
    if (beat % 2 === 1) noise(.045, 0.012, musicGain, 7000);
    beat += 1;
    if (beat % 48 === 0) trackIndex = (trackIndex + 1) % playlist.length;
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
    if (name === "minecraftCorrect") return sequence([[392,.06,"square",.28],[523,.07,"triangle",.38],[784,.16,"sine",.32]],52);
    if (name === "minecraftWrong") return sequence([[220,.08,"square",.28],[174,.12,"sawtooth",.24],[130,.18,"triangle",.22]],58);
    if (name === "minecraftReveal") { percussion("snap"); return sequence([[262,.05,"square",.22],[392,.07,"triangle",.28],[523,.12,"sine",.3]],56); }
    if (name === "minecraftRedstone") return sequence([[110,.045,"square",.24],[165,.05,"square",.28],[220,.08,"triangle",.26],[330,.12,"sine",.22]],48);
    if (name === "shopOpen") return sequence([[420,.07,"triangle",.38],[560,.08,"triangle",.44],[760,.13,"sine",.36]],55);
    if (name === "wardrobeOpen") return sequence([[220,.08,"sine",.24],[360,.08,"triangle",.3],[520,.1,"triangle",.34],[760,.16,"sine",.28]],68);
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
    if (name === "boardTurn") return sequence([[440,.05,"sine",.26],[660,.09,"triangle",.34]],65);
    if (name === "boardMove") return sequence([[390,.045,"triangle",.3],[520,.07,"sine",.24]],48);
    if (name === "boardDice") { noise(.045,settings.sfxVolume*.12,undefined,4200); return sequence([[230,.055,"square",.34],[300,.07,"square",.28],[390,.08,"triangle",.24]],45); }
    if (name === "boardCapture") { percussion("kick"); return sequence([[180,.1,"sawtooth",.44],[115,.19,"square",.34]],62); }
    if (name === "boardShot") return sequence([[340,.045,"square",.3],[520,.08,"triangle",.38]],45);
    if (name === "boardHit") { percussion("snap"); return sequence([[620,.07,"triangle",.46],[880,.13,"sine",.4]],58); }
    if (name === "boardMiss") return sequence([[240,.1,"sine",.28],[180,.13,"triangle",.2]],70);
    if (name === "boardWord") return sequence([[520,.06,"triangle",.3],[680,.08,"triangle",.38],[860,.1,"sine",.3]],52);
    if (name === "boardFlip") return sequence([[580,.045,"sine",.24],[760,.055,"triangle",.28]],44);
    if (name === "boardPair") { percussion("spark"); return sequence([[660,.08,"triangle",.42],[880,.1,"triangle",.52],[1180,.18,"sine",.38]],62); }
    if (name === "boardDrop") { percussion("kick"); return sequence([[280,.07,"triangle",.3],[420,.1,"sine",.32]],55); }
    if (name === "boardDomino") return sequence([[430,.06,"triangle",.3],[570,.1,"sine",.34]],55);
    if (name === "boardDraw") return sequence([[300,.08,"sine",.26],[400,.1,"triangle",.32]],58);
    if (name === "boardPass") return sequence([[300,.07,"sine",.2],[240,.1,"sine",.16]],62);
    if (name === "boardVictory") { percussion("spark"); setTimeout(()=>percussion("spark"),360); return sequence([[392,.1,"triangle",.48],[523,.12,"triangle",.58],[659,.15,"triangle",.64],[784,.3,"sine",.54]],72); }
    if (name === "impactStart") return sequence([[120,.18,"sawtooth",.75],[220,.2,"triangle",.72],[440,.28,"sine",.6]],70);
    if (name === "impactSuccess") return sequence([[160,.09,"square",.58],[520,.14,"triangle",.92],[810,.22,"sine",.72],[1080,.18,"triangle",.45]],52);
    if (name === "impactMiss") return sequence([[190,.18,"sawtooth",.82],[118,.28,"square",.58],[82,.32,"sawtooth",.34]],62);
    if (name === "victory") { percussion("spark"); return sequence([[260,.14,"triangle",.58],[330,.14,"triangle",.62],[390,.16,"triangle",.68],[520,.18,"triangle",.76],[660,.2,"sine",.72],[780,.34,"sine",.64]],88); }
    if (name === "defeat") { noise(.22, settings.sfxVolume * .2, undefined, 420); return sequence([[280,.14,"sawtooth",.48],[220,.16,"sawtooth",.5],[170,.2,"sawtooth",.46],[120,.24,"square",.42],[82,.5,"sine",.32]],105); }
    if (name === "gameVictory") { percussion("spark"); setTimeout(() => percussion("spark"), 520); setTimeout(() => percussion("spark"), 1040); return sequence([[262,.16,"triangle",.56],[330,.16,"triangle",.62],[392,.18,"triangle",.7],[523,.2,"triangle",.78],[659,.2,"sine",.74],[784,.24,"sine",.7],[988,.46,"sine",.64]],105); }
    if (name === "gameDefeat") { noise(.3, settings.sfxVolume * .24, undefined, 360); return sequence([[294,.15,"sawtooth",.48],[247,.17,"sawtooth",.46],[196,.2,"sawtooth",.44],[147,.23,"square",.4],[110,.28,"sawtooth",.36],[73,.62,"sine",.3]],125); }
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
