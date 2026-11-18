// The larger catalogue is shared by these two modes. Download it on entry.
export const songSpotDefaults = { region:"global", rounds:5, answerTime:20, enabledTimes:[0.1,0.5,2,8,15] };
let songSpot, cup, songSpotRequest, cupRequest;
let songSpotRetries = 0, cupRetries = 0;
export let SongSpotEngine, SongSpotSoloEngine;

export function musicModeReady(mode) {
  if (mode === "playlista-cup") return Boolean(cup);
  if (mode === "songspot" || mode === "songspot-solo") return Boolean(songSpot);
  return true;
}

export function loadMusicMode(mode) {
  if (mode === "playlista-cup") {
    const path = "./playlistTournament.js?v=20261118-12";
    cupRequest ||= import(cupRetries ? `${path}&retry=${cupRetries}` : path)
      .then(module => { cup = module; })
      .catch(error => { cupRequest = null; cupRetries++; throw error; });
    return cupRequest;
  }
  if (mode === "songspot" || mode === "songspot-solo") {
    const path = "./songSpot.js?v=20261118-12";
    songSpotRequest ||= import(songSpotRetries ? `${path}&retry=${songSpotRetries}` : path)
      .then(module => {
        songSpot = module;
        ({ SongSpotEngine, SongSpotSoloEngine } = module);
      })
      .catch(error => { songSpotRequest = null; songSpotRetries++; throw error; });
    return songSpotRequest;
  }
  return Promise.resolve();
}

export const createSongSpotGame = (...args) => songSpot.createSongSpotGame(...args);
export const renderSongSpotGame = (...args) => songSpot.renderSongSpotGame(...args);
export const renderSongSpotSolo = (...args) => songSpot.renderSongSpotSolo(...args);
export const renderSongSpotLobbySettings = (...args) => songSpot.renderSongSpotLobbySettings(...args);
export const sanitizeSongSpotSettings = (...args) => songSpot.sanitizeSongSpotSettings(...args);
export const stopSongSpotTimer = () => songSpot?.stopSongSpotTimer();
export const stopSongSpotGameTimer = () => songSpot?.stopSongSpotGameTimer();
export const stopSongSpotSharing = () => songSpot?.stopSongSpotSharing();
export const renderPlaylistTournament = (...args) => cup.renderPlaylistTournament(...args);
export const stopPlaylistTournament = () => cup?.stopPlaylistTournament();
