// Public chart observations, not an assertion of an official TikTok ranking.
import {tournamentMusicCatalog} from '../js/tournamentMusic.js';
const global='https://tokchart.com/tiktok-trending-songs',us=global+'/united-states',weekly='https://postdom.com/trends/popular-tiktok-songs';
const seeds=[
 ['Prince Royce','Rechazame',global],['Siddhant Kaushal','Dilruba Dilnasheen',global],['Justin Bieber','Baby',global],['Thiago Navarro Music','Bonito, Bonito',global],['KAROL G','BbY WOW',global],['IKI DANO','NONA KAKA SAYANG',global],['Mariah Carey','All I Want for Christmas Is You',global],['Joey Phuwasit','เด๋อ',global],['Satinder Sartaaj','Guzarish',global],['Zlatan','INFERNO',global],
 ['Adonai Michel','Futile Devices (Orchestral Version)',us],['nissi','Wyw my sweetie #JerseyClub (Super Slowed)',us],['Central Cee','Doja',us],['Wham!','Last Christmas',us],['Additup','Gangster Bxtch',us],['Nat King Cole','Deck the Hall',us],['Tate McRae','Housewife',us],['Season 25',"Shotta's.",us],['Pink Floyd','Time',weekly],['Róisín Murphy','Ramalama (Bang Bang)',weekly]
];
const norm=s=>String(s).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const title=s=>norm(String(s).replace(/\s*[([](?:feat\.?|featuring|with|\d*\s*remaster(?:ed)?|single version)[^)\]]*[)\]]/gi,''));
const observations=[],tracks=[];
for(const [artist,name,source] of seeds){
 const old=tournamentMusicCatalog.find(t=>title(t.title)===title(name)&&norm(t.artist).includes(norm(artist)));
 if(old){observations.push({artist,title:name,source,sourceDate:'2026-11-13',status:'existing',existingId:old.id});continue;}
 const url=`https://itunes.apple.com/search?term=${encodeURIComponent(artist+' '+name)}&entity=song&limit=30&country=pl`;
 try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();
 const t=data.results.find(t=>t.previewUrl&&norm(t.artistName).includes(norm(artist))&&title(t.trackName)===title(name));
 if(!t){observations.push({artist,title:name,source,status:'no-exact-playable-match'});}
 else{tracks.push({id:`itunes-${t.trackId}`,title:t.trackName,artist:t.artistName,album:t.collectionName||'',region:'global',coverUrl:t.artworkUrl100.replace(/\d+x\d+bb/,'600x600bb'),previewUrl:t.previewUrl,externalUrl:t.trackViewUrl,provider:'preview',originalReleaseYear:Number(t.releaseDate.slice(0,4)),genre:t.primaryGenreName,originalReleaseSource:t.trackViewUrl});observations.push({artist,title:name,source,sourceDate:source===weekly?'2026-11-11':'2026-11-13',status:'matched',id:`itunes-${t.trackId}`,catalogSource:url});}
 }catch(e){observations.push({artist,title:name,source,status:'error',error:e.message});}
 await new Promise(resolve=>setTimeout(resolve,3200));
}
console.log(JSON.stringify({date:'2026-11-14',method:'Public worldwide/US trending-song charts and weekly trend coverage, not an official TikTok or Polish ranking. Exact title and performer matched against Apple catalog; uploaded speech/memes are excluded.',tracks,observations}));
