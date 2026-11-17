import {musicPreviewCatalog} from './music.js?v=20261117-3';
import {tournamentExtraTracks} from './tournamentExtraMusic.js?v=20261117-3';
import {cupTrackKey} from './tournamentMusicKey.js?v=20261117-3';
import {expandedSongMetadata} from './expandedSongMetadata.js?v=20261117-3';
import {userPlaylistTracks} from './userPlaylistMusic.js?v=20261117-3';
import {octoberChartTracks} from './octoberChartMusic.js?v=20261117-3';
import {novemberTrendTracks} from './novemberTrendMusic.js?v=20261117-3';
// Shared by the tournament and SongSpot; other music modes keep their own pools.
const keys=new Set(),ids=new Set();
export const tournamentMusicCatalog=[...musicPreviewCatalog,...tournamentExtraTracks.map(track=>({...track,...expandedSongMetadata[track.id]})),...userPlaylistTracks,...octoberChartTracks,...novemberTrendTracks].filter(track=>{
  if(!track.id||!track.previewUrl)return false;
  const key=cupTrackKey(track);if(keys.has(key)||ids.has(String(track.id)))return false;
  keys.add(key);ids.add(String(track.id));return true;
});
export const tournamentCatalogForRegion=region=>tournamentMusicCatalog.filter(track=>track.region===region);
