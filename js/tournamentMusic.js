import {musicPreviewCatalog} from './music.js?v=20261014-7';
import {tournamentExtraTracks} from './tournamentExtraMusic.js?v=20261014-7';
import {cupTrackKey} from './tournamentMusicKey.js?v=20261014-7';
// Deliberately separate: quiz difficulty, search, metadata and rankings keep
// using the original library. Only the music tournament sees these additions.
const keys=new Set(),ids=new Set();
export const tournamentMusicCatalog=[...musicPreviewCatalog,...tournamentExtraTracks].filter(track=>{
  if(!track.id||!track.previewUrl)return false;
  const key=cupTrackKey(track);if(keys.has(key)||ids.has(String(track.id)))return false;
  keys.add(key);ids.add(String(track.id));return true;
});
export const tournamentCatalogForRegion=region=>tournamentMusicCatalog.filter(track=>track.region===region);
