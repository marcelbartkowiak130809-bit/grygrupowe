// Research builder: monthly snapshots of Billboard's weekly Global 200,
// matched against Apple's catalog. Only public metadata is stored, never audio.
import {musicPreviewCatalog} from '../js/music.js';
import {cupTrackKey} from '../js/tournamentMusicKey.js';
const base=musicPreviewCatalog.filter(t=>t.previewUrl),existing=new Set(base.map(cupTrackKey));
const norm=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').replace(/ł/g,'l').toLowerCase().replace(/[^a-z0-9]/g,'');
const decode=s=>s.replace(/<[^>]*>/g,'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([a-f\d]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#039;|&apos;/g,"'").replace(/&nbsp;/g,' ').trim();
const dates=[];for(let y=2021;y<=2025;y++)for(let m=0;m<12;m++){const d=new Date(Date.UTC(y,m+1,0));d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+1)%7);dates.push(d.toISOString().slice(0,10));}
const charts=new Map(),sources=[];
for(let i=0;i<dates.length;i+=3){await Promise.all(dates.slice(i,i+3).map(async date=>{
 const url=`https://www.billboard.com/charts/billboard-global-200/${date}/`;
 try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(r.status);const html=await r.text();
 const rows=[...html.matchAll(/<h3[^>]*id="title-of-a-story"[^>]*>([\s\S]*?)<\/h3>\s*<span[^>]*class="[^"]*a-no-trucate[^"]*"[^>]*>([\s\S]*?)<\/span>/g)].map(m=>({title:decode(m[1]),artist:decode(m[2])}));
 if(rows.length<100)throw Error(`Only ${rows.length} songs`);
 sources.push({date,url,rows:rows.length});rows.slice(0,100).forEach((t,index)=>{const key=cupTrackKey(t);const old=charts.get(key)||{...t,peak:200,months:0,sources:[]};old.peak=Math.min(old.peak,index+1);old.months++;old.sources.push(url);charts.set(key,old);});
 }catch(e){sources.push({date,url,error:String(e.message)});}
 }));console.error(`Charts ${Math.min(i+3,dates.length)}/${dates.length}; unique ${charts.size}`);}
const lead=t=>String(t.artist).split(/\s+(?:&|feat\.?|featuring|with|x)\s+|,\s*/i)[0].trim();
const artists=new Map();for(const t of base){const name=lead(t);if(name.length>1&&!artists.has(norm(name)))artists.set(norm(name),{name,region:t.region||'global',known:0,charts:0});artists.get(norm(name)).known++;}
for(const t of charts.values()){const k=norm(lead(t));if(artists.has(k))artists.get(k).charts+=Math.max(0,101-t.peak)*t.months;}
const order=[...artists.values()].sort((a,b)=>b.charts-a.charts||b.known-a.known).slice(0,90);
const candidates=new Map(),catalogSources=[];
let lastRequest=0;
for(let index=0;index<order.length;index++){
 const artist=order[index];await new Promise(r=>setTimeout(r,Math.max(0,3100-(Date.now()-lastRequest))));lastRequest=Date.now();
 const url=`https://itunes.apple.com/search?term=${encodeURIComponent(artist.name)}&entity=song&attribute=artistTerm&limit=200&country=${artist.region==='polish'?'pl':'us'}`;
 try{const r=await fetch(url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(r.status);const data=await r.json();catalogSources.push({artist:artist.name,url,results:data.resultCount});
 data.results.forEach((t,rank)=>{
  if(!t.previewUrl||!t.artworkUrl100||norm(lead({artist:t.artistName}))!==norm(artist.name))return;
  if(/\b(?:live|remix|instrumental|karaoke|sped up|slowed|acoustic|radio edit|demo|tribute|sped-up|re-recorded)\b/i.test(t.trackName))return;
  const track={id:`itunes-${t.trackId}`,title:t.trackName,artist:t.artistName,album:t.collectionName||'',region:artist.region,coverUrl:t.artworkUrl100.replace(/\d+x\d+bb/,'600x600bb'),previewUrl:t.previewUrl,externalUrl:t.trackViewUrl,spotifyUrl:`https://open.spotify.com/search/${encodeURIComponent(t.artistName+' '+t.trackName)}`,provider:'preview'};
  const key=cupTrackKey(track);if(existing.has(key)||existing.has(cupTrackKey({title:t.trackName,artist:artist.name})))return;
  const chart=charts.get(key),eligible=chart||(rank<25&&!/remaster|deluxe|anniversary/i.test(t.trackName));if(!eligible)return;
  const score=chart?10000+(101-chart.peak)*10+chart.months*100:1000-rank*15+Math.min(artist.known,20);
  const entry={...track,research:{method:chart?'billboard-monthly-snapshot':'existing-artist-catalog',artistSearch: url,searchRank:rank+1,...(chart?{peak:chart.peak,sampledMonths:chart.months,chartSource:chart.sources[0]}:{})},selectionScore:score};
  if(!candidates.has(key)||score>candidates.get(key).selectionScore)candidates.set(key,entry);
 });
 }catch(e){catalogSources.push({artist:artist.name,url,error:e.message});}
 console.error(`Artists ${index+1}/${order.length}; candidates ${candidates.size}`);
 if(candidates.size>=600&&index>=49)break;
}
const target=1200-existing.size;
const tracks=[...candidates.values()].sort((a,b)=>b.selectionScore-a.selectionScore).slice(0,target).map(({selectionScore,...track})=>track);
console.log(JSON.stringify({tracks,report:{created:'2026-10-14',basePlayable:base.length,baseUnique:existing.size,target:1200,added:tracks.length,totalUnique:existing.size+tracks.length,chartMethod:'Top 100 from the last weekly Global 200 chart in each month, 2021–2025; not monthly aggregated rankings.',sources,catalogSources}}));
