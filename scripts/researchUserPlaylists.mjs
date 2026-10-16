// Read public, user-selected Apple playlists; output metadata only (never audio files).
import {tournamentMusicCatalog} from '../js/tournamentMusic.js';
import {cupTrackKey} from '../js/tournamentMusicKey.js';
const urls=[
 'https://music.apple.com/pl/playlist/charli-xcx/pl.u-xlyNJb3tJv2yEkB',
 'https://music.apple.com/pl/playlist/the-weeknd/pl.u-WabZl9aseNMP5d9',
 'https://music.apple.com/pl/playlist/lisa/pl.u-GgA52y5io25mrZk',
 'https://music.apple.com/pl/playlist/selena-gomez/pl.u-jV89aBLuDB4mVdg',
 'https://music.apple.com/pl/playlist/rihanna/pl.u-KVXBBaLuL06GDZy',
 'https://music.apple.com/pl/playlist/skibidi/pl.u-NpXmDM7F4yE90m6',
 'https://music.apple.com/pl/playlist/dua-lipa/pl.u-NpXmmgau4yE90m6',
 'https://music.apple.com/pl/playlist/ava-max/pl.u-GgA55mRco25mrZk',
 'https://music.apple.com/pl/playlist/shakira/pl.u-WabZzxVUeNMP5d9',
 'https://music.apple.com/pl/playlist/eurowizja-2023-hity-2024-2026/pl.u-NpXmDgpC4yE90m6',
 'https://music.apple.com/pl/album/legacy-feat-north-west-single/6807524493',
 'https://music.apple.com/pl/playlist/random/pl.u-kv9lR5dIJDo2p7l',
 'https://music.apple.com/pl/playlist/wszytko-stare/pl.u-2aoqPBeiG2P9oNA',
 'https://music.apple.com/pl/playlist/britney-spears/pl.u-WabZlZYieNMP5d9',
 'https://music.apple.com/pl/playlist/lady-d%C5%BCad%C5%BCa/pl.u-oZyl3mZTGakKXRA',
 'https://music.apple.com/pl/playlist/kpop/pl.u-xlyNJ2PCJv2yEkB'
];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function json(url){for(let attempt=0;attempt<4;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json();}catch(e){if(attempt===3)throw e;await pause(4000*(attempt+1));}}}
const report={date:'2026-10-16',sources:[],supplements:[],unavailable:[]},rows=new Map();
const additional=process.argv.includes('--additional');
for(const url of additional?urls.slice(-3):urls){
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`HTTP ${r.status}`);
  const html=await r.text(),match=html.match(/<script type="application\/json" id="serialized-server-data">([\s\S]*?)<\/script>/);if(!match)throw Error('No public track data');
  const data=JSON.parse(match[1]).data?.[0]?.data,sections=data?.sections||[],header=sections.find(s=>s.itemKind==='containerDetailHeaderLockup')?.items?.[0];
  const items=sections.flatMap(s=>s.items||[]).filter(item=>item.contentDescriptor?.kind==='song' && item.contentDescriptor?.identifiers?.storeAdamID);
  const source={url,title:header?.title||url.split('/').at(-2),advertisedTracks:header?.trackCount??null,tracks:items.length,trackIds:[]};
  for(const item of items){const id=String(item.contentDescriptor.identifiers.storeAdamID);source.trackIds.push(id);const row={id,title:item.title,artist:item.artistName||item.subtitleLinks?.map(s=>s.title).join(' & '),sources:[url]};if(rows.has(id))rows.get(id).sources.push(url);else rows.set(id,row);}
  if(!items.length)throw Error('No publicly visible songs');report.sources.push(source);
 }catch(e){report.sources.push({url,error:e.message});}
}
// Explicitly requested missing evergreen hits, rather than entire artist discographies.
for(const [artist,title] of additional?[]:[['Ellie Goulding','Love Me Like You Do'],['Ellie Goulding','Burn'],['Ellie Goulding','Lights'],['Ellie Goulding','Anything Could Happen'],['Ellie Goulding','On My Mind'],['Ellie Goulding','Your Song'],['Ellie Goulding','Still Falling For You'],['Ricky Martin',"Livin' la Vida Loca"]]){
 const url=`https://itunes.apple.com/search?term=${encodeURIComponent(artist+' '+title)}&entity=song&limit=15&country=pl`;
 try{const data=await json(url),key=cupTrackKey({artist,title});const t=data.results.find(t=>t.previewUrl&&cupTrackKey({artist:t.artistName,title:t.trackName})===key);if(!t)throw Error('No exact catalog match');const id=String(t.trackId);if(!rows.has(id))rows.set(id,{id,title:t.trackName,artist:t.artistName,sources:[url]});report.supplements.push({artist,title,id,url});}catch(e){report.supplements.push({artist,title,url,error:e.message});}await pause(3200);
}
const lookedUp=new Map(),ids=[...rows.keys()];
for(let i=0;i<ids.length;i+=50){const url=`https://itunes.apple.com/lookup?id=${ids.slice(i,i+50).join(',')}&country=pl&entity=song&limit=200`;
 try{for(const t of (await json(url)).results||[])if(t.kind==='song')lookedUp.set(String(t.trackId),t);}catch(e){report.unavailable.push({ids:ids.slice(i,i+50),error:e.message});}await pause(3200);}
const existing=new Set(tournamentMusicCatalog.map(cupTrackKey)),tracks=[],duplicates=[];
for(const row of rows.values()){
 const t=lookedUp.get(row.id),key=cupTrackKey(row);
 if(existing.has(key)){duplicates.push(row);continue;}
 if(!t?.previewUrl||!t.artworkUrl100){report.unavailable.push({...row,reason:'No public Apple preview/catalog lookup'});continue;}
 // Prefer the playlist's title/artist credit. Catalog metadata provides genre and date.
 const track={id:`itunes-${t.trackId}`,title:row.title,artist:row.artist||t.artistName,album:t.collectionName||'',region:'global',coverUrl:t.artworkUrl100.replace(/\d+x\d+bb/,'600x600bb'),previewUrl:t.previewUrl,externalUrl:row.sources.find(s=>s.includes('/album/'))||t.trackViewUrl,provider:'preview',originalReleaseYear:Number(t.releaseDate?.slice(0,4))||null,genre:t.primaryGenreName||'',originalReleaseSource:t.trackViewUrl};
 const canonical=cupTrackKey(track);if(existing.has(canonical)){duplicates.push(row);continue;}
 existing.add(canonical);tracks.push({...track,researchSources:row.sources});
}
console.log(JSON.stringify({tracks,report:{...report,uniquePlaylistAndSupplementSongs:rows.size,duplicates:duplicates.length,added:tracks.length,previousTotal:tournamentMusicCatalog.length,duplicatesFound:duplicates}}));
