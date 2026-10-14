import { escapeHtml } from './utils.js?v=20260903-7';
import { Audio } from './audio.js?v=20261014-6';
import { musicPreviewCatalog, musicCatalogForRegion } from './music.js?v=20261014-6';
import { songSpotTrackLinks } from './songSpotLibrary.js?v=20261012-1';
import { PlaylistTournamentEngine as engine, tournamentMatchKey, tournamentPair, tournamentDuration } from './playlistTournamentEngine.js?v=20261013-1';
import { bindTournamentSharing, formatTournamentDuration } from './tournamentShare.js?v=20261013-1';

import { cupSizes, cupPreviewTimes, cupSettings, cupEstimate, randomCupTracks } from './musicCupSettings.js?v=20261013-1';
import { musicArtworkUrl } from './musicArtwork.js?v=20261014-6';

let cleanup = () => {};
export function stopPlaylistTournament() { cleanup(); cleanup = () => {}; }
const art = track => `<div class="playlist-cup-art"><span aria-hidden="true">♫</span>${track.coverUrl ? `<img src="${escapeHtml(musicArtworkUrl(track.coverUrl))}" alt="Okładka: ${escapeHtml(track.title)}" decoding="async" onerror="this.hidden=true">` : ''}</div>`;
function card(track, side) {
  return `<article class="playlist-cup-card" data-cup-card="${side}">${art(track)}<div class="playlist-cup-track"><small>${side === 'left' ? 'A' : 'B'}</small><h2>${escapeHtml(track.title)}</h2><p>${escapeHtml(track.artist)}</p></div><div class="playlist-cup-wave" aria-hidden="true">${Array.from({length:12}, (_, i) => `<i style="--wave:${i % 5}"></i>`).join('')}</div><div class="playlist-cup-progress"><i data-cup-progress="${side}"></i></div><div class="playlist-cup-card-actions"><button class="ghost" data-cup-replay="${side}">▶ Odsłuch</button><button class="primary" data-cup-choice="${side}" disabled>Wybieram ${side === 'left' ? 'A' : 'B'} <span>→</span></button></div></article>`;
}
function summary(state) {
  const winner = state.tracks.find(t => t.id === state.winnerId), final = state.history.at(-1), runnerUp = state.tracks.find(t => t.id === final?.loserId);
  const links = songSpotTrackLinks(winner), wins = state.history.filter(m => m.winnerId === winner.id).length;
  return `<section class="playlist-cup-result"><div class="playlist-cup-crown" aria-hidden="true">♛</div><p class="eyebrow">TWÓJ ZWYCIĘZCA</p>${art(winner)}<h2>${escapeHtml(winner.title)}</h2><p>${escapeHtml(winner.artist)}</p><div class="playlist-cup-stats"><span><b>${state.tracks.length}</b> utworów</span><span><b>${state.history.length}</b> pojedynków</span><span><b>${wins}</b> wygranych zwycięzcy</span></div><p class="playlist-cup-duration">Czas turnieju: ${formatTournamentDuration(tournamentDuration(state))}</p><p class="muted">Finalista: ${escapeHtml(runnerUp?.artist || '')} — ${escapeHtml(runnerUp?.title || '')}</p><audio controls data-cup-result-audio preload="none" src="${escapeHtml(winner.previewUrl)}"></audio><div class="playlist-cup-result-links">${links.apple ? `<a class="ghost" href="${escapeHtml(links.apple)}" target="_blank" rel="noopener noreferrer">Apple Music ↗</a>` : ''}<a class="ghost" href="${escapeHtml(links.spotify)}" target="_blank" rel="noopener noreferrer">Spotify ↗</a></div><div class="playlist-cup-result-actions"><button class="primary" data-cup-share>↗ Udostępnij wynik</button><button class="primary" data-cup-start>Rewanż · losuj od nowa</button><button class="ghost" data-cup-reset>Nowy zestaw</button></div></section><details class="playlist-cup-history" open><summary>Droga do finału · wszystkie wybory</summary>${[...new Set(state.history.map(m => m.round))].map(round => `<section><h3>${round === state.round ? 'Finał' : `Runda ${round}`}</h3>${state.history.filter(m => m.round === round).map(m => { const a = state.tracks.find(t => t.id === m.winnerId), b = state.tracks.find(t => t.id === m.loserId); return `<div class="playlist-cup-history-row"><span>✓ <b>${escapeHtml(a.title)}</b><small>${escapeHtml(a.artist)}</small></span><span>× ${escapeHtml(b.title)}<small>${escapeHtml(b.artist)}</small></span></div>`; }).join('')}${state.byes.filter(m => m.round === round).map(m => `<p class="muted">Wolny los: ${escapeHtml(state.tracks.find(t => t.id === m.trackId)?.title)}</p>`).join('')}</section>`).join('')}</details>`;
}
export function renderPlaylistTournament(root, {playerId = 'guest', profile = {}, getProfile = () => profile}, actions) {
  stopPlaylistTournament();
  root.dataset.cupPlayer = String(playerId);
  const state = engine.get(playerId);
  const settings=cupSettings(state.settings), previewSeconds=state.previewSeconds || settings.previewSeconds;
  let content;
  if (state.status === 'setup') {
    content = `<section class="playlist-cup-import"><div class="playlist-cup-import-icon" aria-hidden="true">♫</div><h2>Losowe hity. Jeden zwycięzca.</h2><p class="muted">Posłuchaj A i B. Wybierz, który utwór przechodzi dalej.</p><form data-cup-setup><label for="cup-region">Pula piosenek</label><select id="cup-region" name="region">${[['all','Wszystkie'],['global','Globalne'],['polish','Polskie']].map(([id,label])=>`<option value="${id}" ${settings.region===id?'selected':''}>${label}</option>`).join('')}</select><label for="cup-seconds">Długość każdego odsłuchu</label><select id="cup-seconds" name="previewSeconds">${cupPreviewTimes.map(time=>`<option value="${time}" ${settings.previewSeconds===time?'selected':''}>${time} sekund</option>`).join('')}</select><fieldset class="cup-size-options"><legend>Liczba piosenek</legend>${cupSizes.map(size=>`<label><input type="radio" name="size" value="${size}" ${settings.size===size?'checked':''}><b>${size} utworów</b><small data-cup-estimate="${size}"></small>${size>=64?`<span class="cup-size-warning ${size===128?'is-long':''}">${size===128?'⚠ Bardzo długa gra':'Dłuższy turniej'}</span>`:''}</label>`).join('')}</fieldset><p class="muted">Szacunek: oba odsłuchy + 3–8 s na wybór. Pauzy i powtórki wydłużą grę.</p><button class="primary big" type="submit">Losuj zestaw i graj →</button><output data-cup-import-status role="status"></output></form></section>`;
  } else if (state.status === 'done') content = summary(state);
  else {
    const [left, right] = tournamentPair(state), final = state.entrants.length === 2;
    content = `<section class="playlist-cup-round"><div class="playlist-cup-round-heading"><span class="badge">${final ? '♛ FINAŁ' : `RUNDA ${state.round}`}</span><span>${Math.floor(state.index / 2) + 1}/${Math.floor(state.entrants.length / 2)} · ${state.entrants.length} w grze</span></div><div class="playlist-cup-duel">${card(left, 'left')}<div class="playlist-cup-versus" aria-hidden="true">VS</div>${card(right, 'right')}</div><div class="playlist-cup-toolbar"><div class="playlist-cup-listen-status" data-cup-status role="status"></div><div class="playlist-cup-controls"><button class="ghost" data-cup-play>▶ Odtwórz A</button><button class="ghost" data-cup-skip>Pomiń odsłuch A →</button></div><button class="ghost playlist-cup-exit" data-cup-reset>Przerwij turniej</button></div>${Audio.trackVolumeControlHtml({compact:true})}<audio data-cup-audio preload="auto"></audio><div class="playlist-cup-total-progress"><i style="width:${state.history.length / (state.tracks.length - 1) * 100}%"></i></div><small class="playlist-cup-total-label">${state.history.length}/${state.tracks.length - 1} wyborów · ${state.tracks.length - state.history.length} pozostałych</small>${state.entrants.length % 2 ? `<p class="playlist-cup-bye">Wolny los w tej rundzie: ${escapeHtml(state.tracks.find(t => t.id === state.entrants.at(-1))?.title)}</p>` : ''}</section>`;
  }
  root.innerHTML = `<main class="page playlist-cup-page${state.status === 'playing' ? ' is-playing' : ''}"><section class="panel playlist-cup-panel"><header class="playlist-cup-header"><div><p class="eyebrow">LOSOWE HITY · TURNIEJ SOLO</p><h1>Turniej hitów</h1></div><span aria-hidden="true">♛</span></header>${content}</section><button class="ghost" data-cup-home>← Wróć do muzyki</button></main>`;
  let controller, transitionTimer, frame, lastPaint = 0, stopped = false, activeSide = '', error = '';
  const audio = root.querySelector('[data-cup-audio]'), resultAudio = root.querySelector('[data-cup-result-audio]');
  const matchKey = tournamentMatchKey(state);
  const alive = () => !stopped && root.isConnected;
  const stopSharing = bindTournamentSharing(root, state, getProfile);
  cleanup = () => { stopped = true; stopSharing(); controller?.abort(); clearTimeout(transitionTimer); cancelAnimationFrame(frame); if (audio) Audio.stopTrackAudio(audio); if (resultAudio) Audio.stopTrackAudio(resultAudio); };
  const repaint = () => { if (alive()) renderPlaylistTournament(root, {playerId, profile, getProfile}, actions); };
  root.querySelector('[data-cup-home]').addEventListener('click', () => { stopPlaylistTournament(); (actions.goMusicModes || actions.goPlatform)(); });
  root.querySelectorAll('[data-cup-start]').forEach(button => button.addEventListener('click', () => { startRandom(); }));
  root.querySelectorAll('[data-cup-reset]').forEach(button => button.addEventListener('click', () => { engine.reset(playerId); repaint(); }));
  function startRandom(raw=settings) {
    try {
      const selected=cupSettings(raw), pool=selected.region==='all'?musicPreviewCatalog:musicCatalogForRegion(selected.region);
      engine.load(playerId,randomCupTracks(pool,selected.size),{previewSeconds:selected.previewSeconds,settings:selected});
      engine.start(playerId); repaint(); root.__cupPlayFirst?.();
    } catch(error) { const output=root.querySelector('[data-cup-import-status]'); if(output)output.textContent=error.message; }
  }
  const setup=root.querySelector('[data-cup-setup]');
  if(setup) {
    const estimates=()=>{const seconds=Number(setup.elements.previewSeconds.value);root.querySelectorAll('[data-cup-estimate]').forEach(label=>{const estimate=cupEstimate(Number(label.dataset.cupEstimate),seconds);label.textContent=`~${estimate.min}–${estimate.max} min · ${estimate.matches} pojedynków`;});};
    setup.addEventListener('change',estimates); estimates();
    setup.addEventListener('submit',event=>{event.preventDefault();startRandom({size:Number(setup.elements.size.value),previewSeconds:Number(setup.elements.previewSeconds.value),region:setup.elements.region.value});});
  }
  if (resultAudio) { Audio.bindTrackAudio(resultAudio, `cup-winner:${playerId}:${state.session}`); return; }
  if (!audio) return;
  Audio.bindTrackVolumeControls(root);
  const volumeInput=root.querySelector('[data-track-volume]');
  volumeInput?.setAttribute('aria-label','Głośność piosenek');
  const controls = root.querySelector('[data-cup-play]'), skip = root.querySelector('[data-cup-skip]');
  function update() {
    if (!alive()) return;
    const current = engine.get(playerId); if (tournamentMatchKey(current) !== matchKey) return;
    const ready = current.stage === 'choice', playing = !audio.paused && !audio.ended;
    const side = activeSide || current.stage, label = side === 'left' ? 'A' : 'B';
    root.querySelectorAll('[data-cup-card]').forEach(card => {
      card.classList.toggle('is-hidden', card.dataset.cupCard === 'right' && current.stage === 'left');
      card.classList.toggle('is-playing', playing && card.dataset.cupCard === activeSide);
      card.classList.toggle('is-ready', ready);
    });
    root.querySelectorAll('[data-cup-choice]').forEach(button => button.disabled = !ready);
    root.querySelectorAll('[data-cup-replay]').forEach(button => { const isActive = button.dataset.cupReplay === activeSide && playing; button.textContent = isActive ? 'Ⅱ Pauza' : '▶ Odsłuch'; button.disabled = current.stage !== 'choice' && button.dataset.cupReplay !== current.stage; });
    const elapsed = Number(audio.currentTime) || 0;
    for (const which of ['left','right']) root.querySelector(`[data-cup-progress="${which}"]`).style.width = `${Math.min(100, (which === activeSide ? elapsed : current.seconds[which]) / previewSeconds * 100)}%`;
    controls.textContent = playing ? `Ⅱ Pauza ${label}` : `▶ ${activeSide ? 'Wznów' : 'Odtwórz'} ${label}`;
    controls.hidden = ready && !activeSide; skip.hidden = ready;
    skip.textContent = `Pomiń odsłuch ${current.stage === 'left' ? 'A' : 'B'} →`;
    root.querySelector('[data-cup-status]').textContent = error || (ready ? 'Który utwór przechodzi dalej?' : playing ? `Słuchasz ${label} · ${Math.max(0, Math.ceil(previewSeconds - elapsed))} s` : `Odsłuch ${current.stage === 'left' ? 'A' : 'B'} · kliknij ▶`);
  }
  function play(side, replay = false) {
    if (!alive()) return;
    const current = engine.get(playerId);
    if (tournamentMatchKey(current) !== matchKey || (current.stage !== 'choice' && current.stage !== side)) return;
    error = '';
    if (activeSide !== side || replay) {
      activeSide = side;
      Audio.setTrackAudioSource(audio, `cup:${playerId}:${matchKey}:${side}`, tournamentPair(current)[side === 'left' ? 0 : 1].previewUrl, {autoplay:false,restart:true});
      audio.currentTime = 0;
    }
    const promise = audio.play();
    promise?.catch(() => { if (alive()) { error = 'Kliknij ▶, aby rozpocząć odsłuch. Możesz też go pominąć.'; update(); } });
    update();
  }
  function finish() {
    if (!alive() || !activeSide) return;
    const finishedSide = activeSide; audio.pause(); activeSide = '';
    const advanced = engine.finishPreview(playerId, finishedSide, matchKey);
    update();
    if (advanced && finishedSide === 'left') play('right');
  }
  const tick = timestamp => {
    if (!alive()) return;
    if (activeSide && !audio.paused) {
      engine.progress(playerId, activeSide, audio.currentTime, matchKey);
      if (audio.currentTime >= previewSeconds) finish(); else if (timestamp - lastPaint >= 100) { lastPaint = timestamp; update(); }
    }
    frame = requestAnimationFrame(tick);
  };
  audio.addEventListener('ended', finish);
  audio.addEventListener('timeupdate', () => { if (activeSide && audio.currentTime >= previewSeconds) finish(); });
  audio.addEventListener('play', update); audio.addEventListener('pause', update);
  audio.addEventListener('error', () => { if (alive()) { error = 'Odsłuch niedostępny. Spróbuj ponownie lub pomiń go.'; update(); } });
  controls.addEventListener('click', () => { if (!audio.paused) audio.pause(); else play(activeSide || engine.get(playerId).stage); });
  skip.addEventListener('click', () => { const current = engine.get(playerId), side = current.stage; audio.pause(); activeSide = ''; error = ''; if (engine.finishPreview(playerId, side, matchKey)) { update(); if (side === 'left') play('right'); } });
  root.querySelectorAll('[data-cup-replay]').forEach(button => button.addEventListener('click', () => { const side = button.dataset.cupReplay; if (activeSide === side && !audio.paused) audio.pause(); else play(side, engine.get(playerId).stage === 'choice'); }));
  root.querySelectorAll('[data-cup-choice]').forEach(button => button.addEventListener('click', () => {
    const side = button.dataset.cupChoice;
    if (!engine.choose(playerId, side, matchKey)) return;
    Audio.stopTrackAudio(audio); activeSide = ''; cancelAnimationFrame(frame);
    root.querySelectorAll('[data-cup-choice]').forEach(b => b.disabled = true);
    root.querySelector(`[data-cup-card="${side}"]`).classList.add('is-winner');
    root.querySelector(`[data-cup-card="${side === 'left' ? 'right' : 'left'}"]`).classList.add('is-loser');
    root.querySelector('[data-cup-status]').textContent = 'Przechodzi dalej!';
    transitionTimer = setTimeout(() => { repaint(); playFirst(); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550);
  }));
  root.__cupPlayFirst = () => { if (engine.get(playerId).stage !== 'choice') play(engine.get(playerId).stage); };
  update(); frame = requestAnimationFrame(tick);
  function playFirst() { root.__cupPlayFirst?.(); }
}
