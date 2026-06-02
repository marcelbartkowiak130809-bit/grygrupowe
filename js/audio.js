const STORAGE_KEY = "udowodnij_audio_v1";
const defaults = { muted: false, musicVolume: 0.13, sfxVolume: 0.28 };
const playlist = [
  { name: "Neon Table", notes: [130.81, 164.81, 196.00, 246.94, 220.00, 196.00] },
  { name: "Friendly Pulse", notes: [146.83, 174.61, 220.00, 261.63, 220.00, 293.66] },
  { name: "Night Lobby", notes: [110.00, 146.83, 164.81, 220.00, 196.00, 146.83] },
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

function scheduleAmbient() {
  clearInterval(ambientTimer);
  let beat = 0;
  const playAmbientNote = () => {
    if (!started || settings.muted || settings.musicVolume === 0) return;
    const track = playlist[trackIndex];
    const base = track.notes[beat % track.notes.length];
    tone(base, 2.7, "sine", 0.08, musicGain);
    tone(base * 2, 1.4, "triangle", 0.021, musicGain);
    if (beat % 2 === 0) tone(base / 2, .38, "triangle", 0.035, musicGain);
    if (beat % 4 === 2) tone(base * 1.5, .24, "sine", 0.026, musicGain);
    beat += 1;
    if (beat % 18 === 0) trackIndex = (trackIndex + 1) % playlist.length;
  };
  playAmbientNote();
  ambientTimer = setInterval(playAmbientNote, 2700);
}

function sequence(notes, gap = 80) {
  notes.forEach(([frequency,duration,type,gain],index)=>setTimeout(()=>tone(frequency,duration,type,gain*settings.sfxVolume),index*gap));
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
