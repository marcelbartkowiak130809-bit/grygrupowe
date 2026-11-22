import {musicPreviewCatalog} from './music.js?v=20261123-7';
import {tournamentExtraTracks} from './tournamentExtraMusic.js?v=20261117-10';
import {cupTrackKey} from './tournamentMusicKey.js?v=20261117-10';
import {expandedSongMetadata} from './expandedSongMetadata.js?v=20261117-10';
import {userPlaylistTracks} from './userPlaylistMusic.js?v=20261117-10';
import {octoberChartTracks} from './octoberChartMusic.js?v=20261117-10';
import {novemberTrendTracks} from './novemberTrendMusic.js?v=20261117-10';
import {americanRapTracks} from './americanRapMusic.js?v=20261118-12';
// Shared by the tournament and SongSpot; other music modes keep their own pools.
const keys=new Set(),ids=new Set();
export const tournamentMusicCatalog=[...musicPreviewCatalog,...tournamentExtraTracks.map(track=>({...track,...expandedSongMetadata[track.id]})),...userPlaylistTracks,...octoberChartTracks,...novemberTrendTracks,...americanRapTracks].filter(track=>{
  if(!track.id||!track.previewUrl)return false;
  const key=cupTrackKey(track);if(keys.has(key)||ids.has(String(track.id)))return false;
  keys.add(key);ids.add(String(track.id));return true;
});
export const tournamentCatalogForRegion=region=>tournamentMusicCatalog.filter(track=>track.region===region);
