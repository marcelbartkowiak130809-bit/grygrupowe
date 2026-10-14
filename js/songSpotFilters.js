import { researchedSongMetadata } from './songMetadataResearch.js?v=20261010-7';
import { songMetadataOverrides } from './songMetadataOverrides.js?v=20261010-7';
import { songSpotLevels } from './songSpotLibrary.js?v=20261014-8';

export const songSpotEras = [['all','All'],['classic','< 2000s'],['2000s','2000s'],['2010s','2010s'],['2020s','2020s']];
export const songSpotGenres = [['all','All'],['pop','Pop'],['hiphop','Hip-Hop'],['rock','Rock / Alternative'],['rnb','R&B'],['country','Country / Folk'],['kpop','K-Pop'],['dance','Dance / Electronic'],['latin','Latin'],['other','Pozostałe']];
export const artistIdentity = value => String(value).normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim().replace(/\s+/g,' ');
const protectedNames = ['Tyler, The Creator','Earth, Wind & Fire','Florence + the Machine','Brooks & Dunn','Chase & Status','Simon & Garfunkel','HUNTR/X','AC/DC','Of Monsters and Men','Years & Years'];
function splitArtists(value) {
  let text = String(value || '');
  protectedNames.forEach((name,index) => { text = text.replaceAll(name,`ARTISTTOKEN${index}`); });
  return text.split(/\s*(?:,|&|\s+[xX]\s+|\s+and\s+|\s+feat\.\s+|\s+featuring\s+)\s*/).map(name => name.trim().replace(/ARTISTTOKEN(\d+)/g,(_,index)=>protectedNames[Number(index)])).filter(Boolean);
}
const cache = new Map();
export function songSpotTrackMetadata(track) {
  if (cache.has(track.id)) return cache.get(track.id);
  const source = researchedSongMetadata[track.id] || {year:track.originalReleaseYear,genre:track.genre,artist:track.artist,title:track.title,source:track.originalReleaseSource || track.externalUrl};
  const names = [...splitArtists(source.artist || track.artist), ...splitArtists(track.artist)];
  for (const title of [source.title, track.title]) {
    for (const match of String(title || '').matchAll(/(?:\bfeat\.?|\bfeaturing|[\(\[]with)\s+([^\)\]]+)/gi)) names.push(...splitArtists(match[1]));
  }
  const artists = [...new Map(names.map(name=>[artistIdentity(name),name])).values()];
  const primary = String(source.genre || '').toLowerCase();
  const genres = [];
  if (/k-pop/.test(primary)) genres.push('kpop','pop');
  else if (/hip-hop|rap/.test(primary)) genres.push('hiphop');
  else if (/r&b|soul/.test(primary)) genres.push('rnb');
  else if (/rock|alternative|metal|punk/.test(primary)) genres.push('rock');
  else if (/country|folk|singer\/songwriter/.test(primary)) genres.push('country');
  else if (/dance|electronic|house/.test(primary)) genres.push('dance');
  else if (/latin|reggaeton|urbano|salsa|brazil/.test(primary)) genres.push('latin');
  else if (/pop/.test(primary)) genres.push('pop');
  else genres.push('other');
  const override=songMetadataOverrides[track.id];
  const year = Number(override?.year || source.year) || null;
  const metadata = {year, genres:override?.genres || genres, artists, source:override?.source || source.source || '', genreSource:override?.genreSource || source.source || ''};
  cache.set(track.id,metadata);
  return metadata;
}
export function normalizeSongSpotFilters(raw = {}) {
  const artists=Array.isArray(raw.artists)?[...new Set(raw.artists.map(artistIdentity).filter(Boolean))].sort():[];
  const mode=raw.mode==='playlist'?'playlist':raw.mode==='mix'?'mix':raw.mode==='artists'||artists.length?'artists':'mix';
  return {mode,level:songSpotLevels.some(([id])=>id===raw.level)?raw.level:'all',era:mode==='mix'&&songSpotEras.some(([id])=>id===raw.era)?raw.era:'all',genre:mode==='mix'&&songSpotGenres.some(([id])=>id===raw.genre)?raw.genre:'all',artists:mode==='artists'?artists:[]};
}
export function songSpotRanked(filters) {
  const selected = normalizeSongSpotFilters(filters);
  return selected.mode!=='playlist' && selected.level==='all' && selected.era==='all' && selected.genre==='all' && selected.artists.length===0;
}
export function filterSongSpotTracks(tracks, filters) {
  const selected = normalizeSongSpotFilters(filters), artists = new Set(selected.artists);
  if(artists.size>0 && artists.size<3) return [];
  return tracks.filter(track=>{
    const metadata = songSpotTrackMetadata(track), year=metadata.year;
    const era = year ? year<2000?'classic':year<2010?'2000s':year<2020?'2010s':'2020s' : null;
    return (selected.era==='all'||selected.era===era) && (selected.genre==='all'||metadata.genres.includes(selected.genre)) && (!artists.size||metadata.artists.some(name=>artists.has(artistIdentity(name))));
  });
}
export function songSpotArtistOptions(tracks) {
  const artists = new Map();
  const counts=new Map();
  tracks.forEach(track=>songSpotTrackMetadata(track).artists.forEach(name=>{
    const id=artistIdentity(name), current=artists.get(id), primary=artistIdentity(track.artist)===id;
    counts.set(id,(counts.get(id)||0)+1);
    if(!current || (!current.cover && track.coverUrl) || (!current.primary && primary && track.coverUrl))
      artists.set(id,{name,cover:String(track.coverUrl || '').replace(/\d+x\d+bb/,'100x100bb'),primary});
  }));
  return [...artists].map(([id,item])=>[id,item.name,item.cover,counts.get(id)]).sort((a,b)=>a[1].localeCompare(b[1],'pl'));
}
