import { popularityViewSnapshots } from './popularityViewSnapshots.js?v=20260903-audit4';
import { researchedSongMetadata } from './songMetadataResearch.js?v=20261010-7';
import { chartMusicTracks } from './chartMusic.js?v=20261010-2';
const chartIds=new Set(chartMusicTracks.map(track=>track.id));

export const songSpotLevels=[['all','All'],['easy','Easy'],['medium','Medium'],['hard','Hard'],['cycle','Cykl ↻']];
export function songSpotTrackLinks(track) {
  let apple='';
  for(const value of [track.externalUrl,researchedSongMetadata[track.id]?.source]) {
    try {const url=new URL(value);if(url.protocol==='https:' && url.hostname==='music.apple.com' && /\/(album|song)\//.test(url.pathname)){url.searchParams.delete('uo');apple=url.href;break;}}catch{}
  }
  const embed=apple?apple.replace('https://music.apple.com/','https://embed.music.apple.com/'):'';
  return {apple,embed,spotify:`https://open.spotify.com/search/${encodeURIComponent(`${track.artist} ${track.title}`)}`};
}
const metricKey=value=>String(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
// Existing audited YouTube snapshots, NOT fabricated Spotify stream counts.
// Regional thresholds keep Polish hits playable in every recognition tier.
export function songSpotTier(track) {
  const views=popularityViewSnapshots.get(metricKey(`${track.title} ${track.artist}`));
  const easy=track.region==='polish'?50000000:1000000000, medium=track.region==='polish'?10000000:100000000;
  return Number(views)>=easy?'easy':Number(views)>=medium || (!Number.isFinite(views) && (chartIds.has(track.id) || track.chartHit))?'medium':'hard';
}
export function songSpotRoundTier(level,round=1){return level==='cycle'?['easy','medium','hard'][(Math.max(1,round)-1)%3]:level;}

const textKey=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const titleKey=value=>textKey(String(value||'').replace(/\s*[\(\[]\s*(?:feat\.?|ft\.?|featuring|with)\s+[^\)\]]*[\)\]]/gi,''));
export function parseSongSpotPlaylist(text) {
  const lines=String(text).split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  if(!lines.length)throw new Error('Wklej listę: Artysta — Tytuł, po jednym utworze w wierszu.');
  if(lines.length>200)throw new Error('Jednorazowo można załadować do 200 utworów.');
  return [...new Set(lines)].map(line=>{
    if(/^https?:\/\//i.test(line))throw new Error('Wklej nazwy utworów, nie link do playlisty.');
    const parts=line.split(/\s+[—–-]\s+|\t/);
    return parts.length>1?{artist:parts.shift().trim(),title:parts.join(' — ').trim(),label:line}:{artist:'',title:line,label:line};
  });
}
export function matchSongSpotPlaylistEntry(entry,tracks) {
  const title=titleKey(entry.title),artist=textKey(entry.artist);
  const matches=tracks.filter(track=>track.previewUrl && titleKey(track.title)===title && (!artist || textKey(track.artist)===artist || String(track.artist).split(/\s*(?:&|,|feat\.?|featuring)\s*/i).some(name=>textKey(name)===artist)));
  if(matches.length && (artist || new Set(matches.map(track=>textKey(track.artist))).size===1))return matches[0];
  return null;
}
export async function importSongSpotPlaylist(text,catalog,{signal,onProgress=()=>{},fetcher=fetch,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}) {
  const entries=parseSongSpotPlaylist(text),tracks=[],missing=[];
  let networkUsed=false;
  for(const [index,entry] of entries.entries()) {
    if(signal?.aborted)throw new DOMException('Import anulowany.','AbortError');
    let track=matchSongSpotPlaylistEntry(entry,catalog);
    if(!track) {
      if(networkUsed)await pause(3100);
      if(signal?.aborted)throw new DOMException('Import anulowany.','AbortError');
      networkUsed=true;
      try {
        const url=`https://itunes.apple.com/search?term=${encodeURIComponent(`${entry.artist} ${entry.title}`)}&entity=song&limit=25&country=PL`;
        const response=await fetcher(url,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});
        if(!response.ok)throw new Error('Search unavailable');
        const data=await response.json();
        const candidates=(data.results||[]).map(item=>({id:`playlist-itunes-${item.trackId}`,title:item.trackName,artist:item.artistName,previewUrl:item.previewUrl,coverUrl:item.artworkUrl100,externalUrl:item.trackViewUrl,year:Number(item.releaseDate?.slice(0,4)),genre:item.primaryGenreName,region:'global',provider:'preview'}));
        track=matchSongSpotPlaylistEntry(entry,candidates);
      } catch(error) {if(signal?.aborted)throw error;}
    }
    if(track && !tracks.some(item=>item.id===track.id))tracks.push(track);
    if(!track)missing.push(entry.label);
    onProgress({done:index+1,total:entries.length,loaded:tracks.length});
  }
  return {tracks,missing,total:entries.length};
}
