import { clearVoiceSession, hasVoiceSignaling, setVoiceSignal, subscribeVoiceSignals, serverNow } from "./firebase.js?v=20261123-5";
import { isBotId } from "./bots.js?v=20261121-8";

const rtcConfig = { iceServers:[{ urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"] }] };
const signalingError = "Brak połączenia z usługą czatu głosowego. Spróbuj połączyć ponownie.";
const iceConnected = pc => pc.connectionState === "connected" || ["connected","completed"].includes(pc.iceConnectionState);

export function createIdentityVoiceChat(onChange = () => {}) {
  let roomId = "", uid = "", gameId = "", players = [], game = null, stream = null, session = null;
  let manualMuted = false, micError = "", requesting = false, repeatTimer, lastStateJson = "", snapshot = {};
  const peers = new Map();
  const supported = () => Boolean(globalThis.RTCPeerConnection && navigator.mediaDevices?.getUserMedia);
  const state = () => ({
    supported:supported() && hasVoiceSignaling(uid), connected:Boolean(stream), requesting, error:micError,
    manualMuted, allowedToSpeak:canSpeak(), audioBlocked:[...peers.values()].some(peer=>peer.audioBlocked),
    remoteCount:[...peers.values()].filter(peer=>iceConnected(peer.pc)).length, peerCount:players.length,
    connectionFailed:[...peers.values()].some(peer=>peer.failed),
  });
  function emit() {
    const next = JSON.stringify(state());
    if (next !== lastStateJson) { lastStateJson = next; onChange(); }
  }

  function canSpeak() {
    if (!game || !uid) return false;
    const active = game.order?.[game.turnIndex];
    if (game.phase === "turn") return uid === active;
    if (game.phase !== "responses") return false;
    return Number(game.repeatUntil || 0) > serverNow() ? uid === active : uid !== active;
  }

  function applyMute() {
    clearTimeout(repeatTimer);
    const repeatLeft = Number(game?.repeatUntil || 0) - serverNow();
    if (game?.phase === "responses" && repeatLeft > 0) repeatTimer = setTimeout(applyMute,repeatLeft);
    stream?.getAudioTracks().forEach(track => { track.enabled = canSpeak() && !manualMuted; });
    emit();
  }

  function dropPeer(peerUid) {
    const peer = peers.get(peerUid);
    if (!peer) return;
    peers.delete(peerUid);
    clearTimeout(peer.timer);
    peer.pc.close();
    if(peer.audio) {
      peer.audio.srcObject = null;
      peer.audio.remove();
    }
  }

  async function playAudio(peer) {
    if (!peer.audio) return;
    try { await peer.audio.play(); peer.audioBlocked = false; }
    catch (error) { peer.audioBlocked = error?.name === "NotAllowedError"; }
    if (peers.get(peer.uid) === peer) emit();
  }

  function makePeer(peerUid, remoteSession, active) {
    const pc = new RTCPeerConnection(rtcConfig);
    const peer = {
      uid:peerUid, pc, remoteSession, audio:null, candidates:[], seenIce:new Set(), pending:Promise.resolve(),
      description:null, lastIncoming:"", audioBlocked:false, failed:false,
    };
    peers.set(peerUid,peer);
    stream.getAudioTracks().forEach(track=>pc.addTrack(track,stream));
    const valid = () => session===active && peers.get(peerUid)===peer;
    function checkConnection() {
      if (!valid()) return;
      clearTimeout(peer.timer);
      peer.failed = pc.connectionState === "failed" || pc.iceConnectionState === "failed";
      if (!peer.failed && !iceConnected(pc)) {
        peer.timer = setTimeout(()=>{ if(valid()) { peer.failed=true; emit(); } },15000);
      }
      emit();
    }
    pc.onconnectionstatechange = checkConnection;
    pc.oniceconnectionstatechange = checkConnection;
    checkConnection();
    peer.publish = async () => {
      if (!valid() || !peer.description) return;
      const ok = await setVoiceSignal(active.roomId,active.uid,peerUid,"negotiation",{
        fromSession:active.id, toSession:remoteSession, description:peer.description, candidates:[...peer.candidates],
      });
      if (!ok && valid()) { micError=signalingError; emit(); }
    };
    pc.onicecandidate = ({candidate}) => {
      if (candidate && valid()) { peer.candidates.push(candidate.toJSON()); void peer.publish(); }
    };
    pc.ontrack = event => {
      if (!valid()) return;
      if (!peer.audio) {
        peer.audio=document.createElement("audio");
        peer.audio.autoplay=true;
        peer.audio.setAttribute("playsinline","");
        peer.audio.hidden=true;
        peer.audio.dataset.identityVoicePeer=peerUid;
        document.body.append(peer.audio);
      }
      peer.audio.srcObject=event.streams[0] || new MediaStream([event.track]);
      void playAudio(peer);
    };
    return peer;
  }

  async function setLocal(peer, description, valid) {
    if(!valid()) return;
    await peer.pc.setLocalDescription(description);
    if(!valid()) return;
    const {type,sdp}=peer.pc.localDescription;
    peer.description={type,sdp};
    await peer.publish();
  }

  function reconcile(active) {
    if(session!==active || !stream) return;
    for(const [id,peer] of peers) {
      if(!players.includes(id) || snapshot[id]?.[id]?.session!==peer.remoteSession) dropPeer(id);
    }
    for(const peerUid of players) {
      const remoteSession=snapshot[peerUid]?.[peerUid]?.session;
      if(typeof remoteSession!=="string" || !remoteSession) continue;
      const existing=peers.get(peerUid), peer=existing||makePeer(peerUid,remoteSession,active);
      const message=snapshot[peerUid]?.[uid]?.negotiation;
      const incoming=message?.fromSession===remoteSession && message.toSession===active.id ? message : null;
      const signature=incoming?JSON.stringify(incoming):"";
      if(existing && peer.lastIncoming===signature) continue;
      peer.lastIncoming=signature;
      const valid=()=>session===active && peers.get(peerUid)===peer;
      peer.pending=peer.pending.then(async()=>{
        if(!valid()) return;
        const pc=peer.pc;
        if(!existing && active.uid<peerUid) await setLocal(peer,await pc.createOffer(),valid);
        if(!valid() || !incoming) return;
        if(!pc.remoteDescription && incoming.description?.type===(active.uid<peerUid?"answer":"offer")) {
          await pc.setRemoteDescription(incoming.description);
          if(valid() && incoming.description.type==="offer") await setLocal(peer,await pc.createAnswer(),valid);
        }
        if(!valid() || !pc.remoteDescription) return;
        for(const candidate of Object.values(incoming.candidates || {})) {
          if(!valid()) return;
          const key=JSON.stringify(candidate);
          if(peer.seenIce.has(key)) continue;
          await pc.addIceCandidate(candidate);
          peer.seenIce.add(key);
        }
      }).catch(()=>{
        if(valid()) { peer.failed=true; emit(); }
      });
    }
    emit();
  }

  function endSession() {
    const old=session;
    session=null;
    snapshot={};
    for(const id of peers.keys()) dropPeer(id);
    if(old) {
      old.unsubscribe?.();
      void old.ready?.then(()=>clearVoiceSession(old.roomId,old.uid,old.id));
    }
  }

  function startSession() {
    endSession();
    const active={roomId,uid,id:crypto.randomUUID()};
    session=active;
    active.unsubscribe=subscribeVoiceSignals(roomId,uid,data=>{
      if(session!==active) return;
      snapshot=data;
      reconcile(active);
    },()=>{
      if(session===active) { micError=signalingError; emit(); }
    });
    active.ready=setVoiceSignal(roomId,uid,uid,"session",active.id);
    void active.ready.then(ok=>{
      if(!ok && session===active) { micError=signalingError; emit(); }
    });
  }

  function sync(nextRoom, currentUid) {
    const voice=nextRoom?.gameMode==="kim-jestem" && ["browserVoice","voice"].includes(nextRoom.settings?.gameFlow)
      && nextRoom.status==="playing" && nextRoom.game && nextRoom.game.phase!=="results" && nextRoom.players?.includes(currentUid);
    if(!voice || !currentUid) { stop(); return; }
    const nextGameId=nextRoom.game.siteGameId || nextRoom.game.startedAt || "";
    if(roomId!==nextRoom.roomId || uid!==currentUid || gameId!==nextGameId) {
      stop();
      roomId=nextRoom.roomId;
      uid=currentUid;
      gameId=nextGameId;
    }
    players=nextRoom.players.filter(player=>player!==uid && !isBotId(player));
    game=nextRoom.game;
    applyMute();
    if(session) reconcile(session);
  }

  let micRequest = null;
  async function enable() {
    if(!roomId || micRequest) return;
    // Call play directly from the click so browsers that block autoplay can unlock it.
    peers.forEach(peer=>{if(peer.audioBlocked) void playAudio(peer);});
    if(!supported() || !hasVoiceSignaling(uid)) {
      micError=supported()?"Czat głosowy wymaga połączenia z pokojem online.":"Ta przeglądarka nie pozwala użyć mikrofonu.";
      emit(); return;
    }
    if(stream) {
      if(micError || !session || [...peers.values()].some(peer=>peer.failed)) { micError=""; startSession(); emit(); }
      return;
    }
    const request={};
    micRequest=request;
    requesting=true; micError=""; emit();
    try {
      const captured=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
      if(micRequest!==request) { captured.getTracks().forEach(track=>track.stop()); return; }
      stream=captured;
      captured.getAudioTracks().forEach(track=>track.addEventListener("ended",()=>{
        if(stream!==captured) return;
        endSession(); stream=null;
        micError="Mikrofon został odłączony. Połącz go ponownie.";
        emit();
      },{once:true}));
      applyMute();
      startSession();
    } catch(error) {
      if(micRequest!==request) return;
      micError=error?.name==="NotAllowedError"?"Zezwól na mikrofon w ustawieniach tej strony i spróbuj ponownie.":"Nie udało się uruchomić mikrofonu. Sprawdź urządzenie i spróbuj ponownie.";
    } finally {
      if(micRequest===request) { micRequest=null; requesting=false; emit(); }
    }
  }

  function toggleMute() { manualMuted=!manualMuted; applyMute(); }

  function stop() {
    endSession(); clearTimeout(repeatTimer);
    micRequest=null; requesting=false;
    stream?.getTracks().forEach(track=>track.stop()); stream=null;
    roomId=""; uid=""; gameId=""; players=[]; game=null; micError=""; manualMuted=false;
    emit();
  }

  return { sync, stop, enable, toggleMute, state };
}
