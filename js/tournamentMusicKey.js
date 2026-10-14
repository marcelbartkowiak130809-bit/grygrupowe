const normalized=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').replace(/ł/g,'l').toLowerCase().replace(/[^a-z0-9]+/g,'');
export function cupTrackKey(track){
  const title=String(track.title||'').replace(/\s*[([](?:feat\.?|featuring|with)\b[^)\]]*[)\]]/gi,'').replace(/\s*[([][^)\]]*\b(?:version|remaster(?:ed)?|from the vault)[^)\]]*[)\]]/gi,'').replace(/\s*[-–]\s*(?:\d{4}\s*)?remaster(?:ed)?.*$/i,'').trim();
  const artist=String(track.artist||'').split(/\s+(?:&|feat\.?|featuring|with|x)\s+|,\s*/i)[0];
  return `${normalized(artist)}|${normalized(title)}`;
}
