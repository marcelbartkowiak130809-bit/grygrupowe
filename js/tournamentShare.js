import { tournamentDuration } from './playlistTournamentEngine.js?v=20261016-2';
export const TOURNAMENT_SHARE_URL = 'https://grygrupowe.pages.dev/playlista-cup';
const BASE_URL = new URL('../assets/share/playlist-cup-base.svg?v=20261013-1', import.meta.url).href;

export function formatTournamentDuration(ms) {
  if (ms === null || !Number.isFinite(Number(ms)) || Number(ms) < 0) return 'Brak pomiaru';
  const seconds = Math.floor(Number(ms) / 1000), hours = Math.floor(seconds / 3600);
  return hours ? `${hours} h ${Math.floor(seconds / 60) % 60} min ${seconds % 60} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}
export function formatTournamentCounts(tracks, matches) {
  const word = (n, one, few, many) => n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;
  return `${tracks} ${word(tracks,'utwór','utwory','utworów')}  ·  ${matches} ${word(matches,'pojedynek','pojedynki','pojedynków')}`;
}
export function tournamentShareData(state, profile = {}) {
  const winner = state.tracks?.find(t => t.id === state.winnerId);
  if (state.status !== 'done' || !winner) throw new Error('Najpierw zakończ turniej.');
  return {title:String(winner.title).slice(0,180), artist:String(winner.artist).slice(0,180), coverUrl:winner.coverUrl || '',
    nick:String(profile.nick || 'Gracz').slice(0,100), avatarImage:profile.avatarImage || '',
    duration:formatTournamentDuration(tournamentDuration(state)), tracks:state.tracks.length, matches:state.history.length};
}
function loadImage(source, {signal, required = false} = {}) {
  if (!source) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const image = new Image(); image.crossOrigin = 'anonymous';
    let timer;
    const finish = (error = false) => {
      clearTimeout(timer); signal?.removeEventListener('abort', abort); image.onload = image.onerror = null;
      if (signal?.aborted) reject(new DOMException('Anulowano.', 'AbortError'));
      else if (error && required) reject(new Error('Nie udało się wczytać szablonu grafiki.'));
      else resolve(error ? null : image);
    };
    const abort = () => { image.src = ''; finish(true); };
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener('abort', abort, {once:true});
    image.onload = () => finish(); image.onerror = () => finish(true);
    timer = setTimeout(() => finish(true), 7000);
    image.src = source;
  });
}
function clipRect(ctx, x, y, width, height, radius) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.clip();
}
function imageCover(ctx, image, x, y, width, height, radius = 0) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
  ctx.save(); clipRect(ctx, x,y,width,height,radius); ctx.drawImage(image,x+(width-w)/2,y+(height-h)/2,w,h); ctx.restore();
}
export function fitShareText(ctx, value, maxWidth, size, minSize, weight = 700) {
  let text = String(value);
  const font = () => { ctx.font = `${weight} ${size}px Arial, sans-serif`; };
  font(); while (size > minSize && ctx.measureText(text).width > maxWidth) { size--; font(); }
  if (ctx.measureText(text).width > maxWidth) {
    const chars = Array.from(text);
    while (chars.length && ctx.measureText(chars.join('') + '…').width > maxWidth) chars.pop();
    text = chars.join('') + '…';
  }
  return text;
}
export async function createTournamentPoster(data, {signal} = {}) {
  const coverSource=String(data.coverUrl || '').replace(/\d+x\d+bb(?=\.)/,'600x600bb');
  const [base, cover, avatar] = await Promise.all([loadImage(BASE_URL, {signal,required:true}), loadImage(coverSource,{signal}), loadImage(data.avatarImage,{signal})]);
  if (signal?.aborted) throw new DOMException('Anulowano.', 'AbortError');
  await document.fonts?.ready;
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Przeglądarka nie obsługuje zapisu grafiki.');
  ctx.drawImage(base,0,0);
  ctx.textAlign='center'; ctx.fillStyle='#bca2ff';
  ctx.fillText(fitShareText(ctx,data.modeLabel || 'TURNIEJ HITÓW · MÓJ ZWYCIĘZCA',900,20,16),540,270);
  if (cover) imageCover(ctx,cover,300,333,480,480,24);
  else {
    ctx.fillStyle = '#282342'; ctx.beginPath(); ctx.roundRect(300,333,480,480,24); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#a48fe1'; ctx.font = '150px Arial'; ctx.fillText('♫',540,610);
  }
  ctx.textAlign = 'center'; ctx.fillStyle = '#f6f8ff';
  const title = fitShareText(ctx,data.title,920,58,30); ctx.fillText(title,540,909);
  ctx.fillStyle = '#aabbd5'; const artist = fitShareText(ctx,data.artist,900,34,23,400); ctx.fillText(artist,540,970);
  ctx.save(); ctx.beginPath(); ctx.arc(166,1141,51,0,Math.PI*2); ctx.clip();
  if (avatar) imageCover(ctx,avatar,115,1090,102,102);
  else {
    const gradient=ctx.createLinearGradient(115,1090,217,1192); gradient.addColorStop(0,'#8b5bf0'); gradient.addColorStop(1,'#2bcfe2');
    ctx.fillStyle=gradient; ctx.fillRect(115,1090,102,102); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='700 42px Arial'; ctx.fillText(Array.from(data.nick)[0]?.toUpperCase() || '?',166,1156);
  }
  ctx.restore(); ctx.textAlign='left'; ctx.fillStyle='#9aa9c2'; ctx.font='700 15px Arial'; ctx.fillText(data.playerLabel || 'WYBÓR GRACZA',248,1098);
  ctx.fillStyle='#f2f5ff'; const nick=fitShareText(ctx,data.nick,690,38,24); ctx.fillText(nick,248,1146);
  ctx.fillStyle='#5edeee'; ctx.fillText(fitShareText(ctx,data.timeText || `Czas turnieju: ${data.duration}`,690,24,18,400),248,1190);
  ctx.textAlign='center'; ctx.fillStyle='#91a2bd'; ctx.fillText(fitShareText(ctx,data.footer || formatTournamentCounts(data.tracks,data.matches),920,22,16,400),540,1248);
  const blob = await new Promise((resolve,reject) => { try { canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Nie udało się zapisać grafiki.')), 'image/png'); } catch { reject(new Error('Nie udało się zapisać okładki. Spróbuj ponownie.')); } });
  return {blob, missingCover:!cover, missingAvatar:!!data.avatarImage && !avatar};
}
export function canShareTournamentFile(file, navigatorObject = navigator) {
  try { return Boolean(navigatorObject.share && navigatorObject.canShare?.({files:[file]})); } catch { return false; }
}
export function bindTournamentSharing(root, state, getProfile = () => ({})) {
  return bindResultSharing(root, {selector:'[data-cup-share]',getData:()=>tournamentShareData(state,getProfile() || {}),url:TOURNAMENT_SHARE_URL,fileName:'gry-grupowe-playlista-cup.png',heading:'Twój zwycięski hit',title:'Mój zwycięzca Playlista Cup',privacy:'Udostępniasz zwycięski utwór, nick, profilowe i czas turnieju. Lista playlisty nie trafia na grafikę.'});
}
export function bindResultSharing(root, options) {
  const trigger = root.querySelector(options.selector); if (!trigger) return () => {};
  const dialog = document.createElement('dialog'); dialog.className = 'cup-share-dialog';
  dialog.setAttribute('aria-labelledby','cup-share-title');
  dialog.innerHTML = `<header><h2 id="cup-share-title">Twój zwycięski hit</h2><button class="ghost" data-share-close aria-label="Zamknij podgląd">×</button></header><p data-share-feedback role="status">Przygotowuję grafikę…</p><img data-share-preview alt="Grafika wyniku Playlista Cup" hidden><div class="cup-share-actions"><button class="primary" data-share-native hidden>Udostępnij grafikę</button><a class="primary" data-share-download hidden>Pobierz PNG</a><button class="ghost" data-share-link>Kopiuj link do trybu</button></div><small>Udostępniasz zwycięski utwór, nick, profilowe i czas turnieju. Lista playlisty nie trafia na grafikę.</small>`;
  root.append(dialog);
  dialog.querySelector('h2').textContent=options.heading;
  dialog.querySelector('small').textContent=options.privacy;
  dialog.querySelector('img').alt=`Grafika wyniku: ${options.heading}`;
  let controller, url = '', file, cachedKey = '', disposed = false;
  const feedback = dialog.querySelector('[data-share-feedback]'), preview=dialog.querySelector('[data-share-preview]'), native=dialog.querySelector('[data-share-native]'), download=dialog.querySelector('[data-share-download]');
  const cancel = () => controller?.abort();
  dialog.querySelector('[data-share-close]').addEventListener('click',()=>dialog.close()); dialog.addEventListener('close',cancel);
  trigger.addEventListener('click',async()=>{
    dialog.showModal();
    const data=options.getData(), key=JSON.stringify(data);
    if (file && key===cachedKey) { feedback.textContent='Gotowe — możesz pobrać lub udostępnić grafikę.'; return; }
    cancel(); controller=new AbortController(); const active=controller;
    feedback.textContent='Przygotowuję grafikę…'; preview.hidden=download.hidden=native.hidden=true; file=null;
    try {
      const result=await createTournamentPoster(data,{signal:active.signal});
      if(disposed || active.signal.aborted)return;
      if(url)URL.revokeObjectURL(url); url=URL.createObjectURL(result.blob); cachedKey=key;
      file=new File([result.blob],options.fileName,{type:'image/png'});
      preview.src=url; preview.hidden=false; download.href=url; download.download=file.name; download.hidden=false;
      native.hidden=!canShareTournamentFile(file);
      feedback.textContent=result.missingCover || result.missingAvatar?'Grafika gotowa. Niedostępne zdjęcie zastąpiłem symbolem.':'Gotowe — możesz pobrać lub udostępnić grafikę.';
    } catch(error) { if(!disposed && !active.signal.aborted)feedback.textContent=`${error.message} Link do trybu nadal możesz skopiować.`; }
  });
  native.addEventListener('click',async()=>{
    if(!file)return;
    try { await navigator.share({files:[file],title:options.title,text:options.url}); if(!disposed)feedback.textContent='Grafika przekazana do udostępnienia.'; }
    catch(error) { if(!disposed)feedback.textContent=error.name==='AbortError'?'Udostępnianie anulowane.':'Nie udało się udostępnić. Użyj „Pobierz PNG”.'; }
  });
  dialog.querySelector('[data-share-link]').addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(options.url); feedback.textContent='Link skopiowany!'; }
    catch { feedback.textContent=`Link do trybu: ${options.url}`; }
  });
  return () => { disposed=true; cancel(); if(url)URL.revokeObjectURL(url); dialog.close(); dialog.remove(); };
}
