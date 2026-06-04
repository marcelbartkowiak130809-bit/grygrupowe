import { clearVoiceSignals, hasVoiceSignaling, pushVoiceIceCandidate, setVoiceSignal, subscribeVoiceSignals } from "./firebase.js?v=20260604-7";

const rtcConfig = { iceServers:[{ urls:"stun:stun.l.google.com:19302" }, { urls:"stun:stun1.l.google.com:19302" }] };
const now = () => Date.now();

export function createIdentityVoiceChat(onChange = () => {}) {
  let roomId = "", uid = "", players = [], game = null, stream = null, stopSignals = () => {};
  let manualMuted = false, micError = "", requesting = false, cleanupStarted = false;
  let lastStateJson = "";
  const peers = new Map(), processedIce = new Set(), remoteAudio = new Map(), offeredPeers = new Set();

  const state = () => ({ supported:hasVoiceSignaling(), connected:Boolean(stream), requesting, error:micError, manualMuted, allowedToSpeak:canSpeak(), remoteCount:remoteAudio.size, peerCount:Math.max(0, players.length - 1) });
  const emit = () => { const next = JSON.stringify(state()); if (next !== lastStateJson) { lastStateJson = next; onChange(); } };

  function canSpeak() {
    if (!game || !uid) return false;
    const active = game.order?.[game.turnIndex];
    if (game.phase === "turn") return uid === active;
    if (game.phase === "responses") {
      if (Number(game.repeatUntil || 0) > now()) return uid === active;
      return uid !== active;
    }
    return false;
  }

  function applyMute() {
    const enabled = Boolean(stream && canSpeak() && !manualMuted);
    stream?.getAudioTracks().forEach(track => { track.enabled = enabled; });
    emit();
  }

  async function ensureMic() {
    if (stream || requesting) return Boolean(stream);
    if (!navigator.mediaDevices?.getUserMedia) { micError = "Ta przegladarka nie obsluguje dostepu do mikrofonu."; emit(); return false; }
    requesting = true; micError = ""; emit();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true, autoGainControl:true }, video:false });
      requesting = false; applyMute(); return true;
    } catch (error) {
      requesting = false;
      micError = error?.name === "NotAllowedError" ? "Odmowiono dostepu do mikrofonu. Zezwol w przegladarce, zeby rozmawiac przez gre." : "Nie udalo sie uruchomic mikrofonu.";
      emit(); return false;
    }
  }

  function audioFor(peerUid) {
    let element = remoteAudio.get(peerUid);
    if (!element) {
      element = document.createElement("audio");
      element.autoplay = true;
      element.playsInline = true;
      element.dataset.identityVoicePeer = peerUid;
      element.style.display = "none";
      document.body.append(element);
      remoteAudio.set(peerUid, element);
    }
    return element;
  }

  function makePeer(peerUid) {
    if (peers.has(peerUid) || !stream) return peers.get(peerUid);
    const pc = new RTCPeerConnection(rtcConfig);
    peers.set(peerUid, pc);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.onicecandidate = event => { if (event.candidate) pushVoiceIceCandidate(roomId, uid, peerUid, event.candidate.toJSON()); };
    pc.ontrack = event => {
      const element = audioFor(peerUid);
      element.srcObject = event.streams[0];
      element.play?.().catch(() => {});
      emit();
    };
    pc.onconnectionstatechange = () => { if (["failed","closed","disconnected"].includes(pc.connectionState)) emit(); };
    return pc;
  }

  async function createOffer(peerUid) {
    if (offeredPeers.has(peerUid)) return;
    const pc = makePeer(peerUid);
    if (!pc || pc.signalingState !== "stable") return;
    const offer = await pc.createOffer({ offerToReceiveAudio:true });
    await pc.setLocalDescription(offer);
    offeredPeers.add(peerUid);
    await setVoiceSignal(roomId, uid, peerUid, "offer", { type:pc.localDescription.type, sdp:pc.localDescription.sdp });
  }

  async function handleSignals(data = {}) {
    if (!stream || !roomId || !uid) return;
    for (const fromUid of Object.keys(data)) {
      if (fromUid === uid || !players.includes(fromUid)) continue;
      const incoming = data[fromUid]?.[uid] || {};
      const pc = makePeer(fromUid);
      if (!pc) continue;
      if (incoming.offer && pc.signalingState === "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await setVoiceSignal(roomId, uid, fromUid, "answer", { type:pc.localDescription.type, sdp:pc.localDescription.sdp });
      }
      if (incoming.answer && pc.signalingState === "have-local-offer") await pc.setRemoteDescription(new RTCSessionDescription(incoming.answer));
      for (const [candidateId, candidate] of Object.entries(incoming.candidates || {})) {
        const key = `${fromUid}:${candidateId}`;
        if (processedIce.has(key)) continue;
        processedIce.add(key);
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }
    }
  }

  async function sync(nextRoom, currentUid) {
    const voice = nextRoom?.gameMode === "kim-jestem" && ["browserVoice", "voice"].includes(nextRoom.settings?.gameFlow) && nextRoom.status === "playing" && nextRoom.game?.phase !== "results";
    if (!voice || !currentUid) return stop();
    const changedRoom = roomId !== nextRoom.roomId || uid !== currentUid;
    roomId = nextRoom.roomId; uid = currentUid; players = [...(nextRoom.players || [])]; game = nextRoom.game;
    if (!hasVoiceSignaling()) { micError = "Voice chat przez gre wymaga Firebase Realtime Database i zalogowanego gracza."; emit(); return; }
    await ensureMic();
    applyMute();
    if (!stream) return;
    [...peers.keys()].filter(peerUid => !players.includes(peerUid)).forEach(peerUid => { peers.get(peerUid)?.close(); peers.delete(peerUid); offeredPeers.delete(peerUid); remoteAudio.get(peerUid)?.remove(); remoteAudio.delete(peerUid); });
    players.filter(peerUid => peerUid !== uid).forEach(peerUid => makePeer(peerUid));
    if (changedRoom) {
      stopSignals();
      offeredPeers.clear();
      stopSignals = subscribeVoiceSignals(roomId, uid, snapshot => handleSignals(snapshot).catch(()=>{}));
    }
    await Promise.all(players.filter(peerUid => peerUid !== uid && uid < peerUid).map(createOffer));
  }

  function toggleMute() { manualMuted = !manualMuted; applyMute(); }
  async function enable() { await ensureMic(); applyMute(); }

  async function stop() {
    if (cleanupStarted && !roomId) return;
    cleanupStarted = true;
    const oldRoom = roomId, oldUid = uid;
    stopSignals(); stopSignals = () => {};
    peers.forEach(pc => pc.close()); peers.clear(); processedIce.clear(); offeredPeers.clear();
    remoteAudio.forEach(element => element.remove()); remoteAudio.clear();
    stream?.getTracks().forEach(track => track.stop()); stream = null;
    roomId = ""; uid = ""; players = []; game = null; cleanupStarted = false;
    if (oldRoom && oldUid) clearVoiceSignals(oldRoom, oldUid);
    emit();
  }

  return { sync, stop, enable, toggleMute, state };
}
