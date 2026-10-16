import {userPlaylistTracks} from '../js/userPlaylistMusic.js';
const checked=[];let index=0;
async function worker(){while(index<userPlaylistTracks.length){const track=userPlaylistTracks[index++],entry={id:track.id};for(const key of ['coverUrl','previewUrl']){try{const r=await fetch(track[key],{method:'HEAD',signal:AbortSignal.timeout(20000)});entry[key]={status:r.status,type:r.headers.get('content-type')};}catch(e){entry[key]={error:e.message};}}checked.push(entry);}}
await Promise.all(Array.from({length:6},worker));
const failed=checked.filter(e=>e.coverUrl.status!==200||e.previewUrl.status!==200||!e.coverUrl.type?.startsWith('image/')||!/audio|video/.test(e.previewUrl.type));
console.log(JSON.stringify({date:'2026-10-16',total:checked.length,passed:checked.length-failed.length,failed}));
if(failed.length)process.exitCode=1;
