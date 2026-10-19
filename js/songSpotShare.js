import { bindResultSharing } from './tournamentShare.js?v=20261019-1';

export const SONGSPOT_SHARE_URL = 'https://grygrupowe.pages.dev/songspot-solo';
export function songSpotShareData(state, profile = {}) {
  const result = state.lastResult;
  if (!result || state.status === 'playing' || state.status === 'idle') throw new Error('Najpierw zakończ utwór.');
  const seconds = Number(result.seconds);
  const time = Number.isFinite(seconds) && seconds >= 0 ? `${new Intl.NumberFormat('pl-PL', {maximumFractionDigits:2}).format(seconds)} s` : 'brak pomiaru';
  return {
    title:String(result.title || 'Nieznany utwór').slice(0,180), artist:String(result.artist || '').slice(0,180), coverUrl:result.coverUrl || '',
    nick:String(profile.nick || 'Gracz').slice(0,100), avatarImage:profile.avatarImage || '',
    modeLabel:'ZGADNIJ UTWÓR', playerLabel:result.correct ? 'TRAFIONO' : 'NIE ODGADNIĘTO',
    timeText:result.correct ? `Zgadnięto po: ${time} odsłuchu` : `Nie odgadnięto · odsłuch: ${time}`,
    footer:`${state.filters?.mode === 'playlist' ? 'Twoja playlista' : state.region === 'polish' ? 'Polskie' : 'Globalne'} · Streak: ${Number(state.streak) || 0} · ${state.rankedRun ? 'Ranking' : 'Trening'}`,
  };
}
export function bindSongSpotSharing(root, state, getProfile = () => ({})) {
  return bindResultSharing(root, {selector:'[data-songspot-share]',getData:()=>songSpotShareData(state,getProfile() || {}),url:SONGSPOT_SHARE_URL,fileName:'gry-grupowe-zgadnij-utwor.png',heading:'Twój wynik — Zgadnij utwór',title:'Mój wynik — Zgadnij utwór',privacy:'Na grafice są utwór, nick, profilowe i wynik z czasem odsłuchu. Bez danych konta i listy playlisty.'});
}
