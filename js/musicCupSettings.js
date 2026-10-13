export const cupSizes = [8,16,32,64,128];
export const cupPreviewTimes = [5,10,15,20,30];
export function cupSettings(raw = {}) {
  return {size:cupSizes.includes(Number(raw.size))?Number(raw.size):16,previewSeconds:cupPreviewTimes.includes(Number(raw.previewSeconds))?Number(raw.previewSeconds):10,region:['global','polish'].includes(raw.region)?raw.region:'all'};
}
export function cupEstimate(size, seconds) {
  const matches=size-1;
  return {min:Math.ceil(matches*(2*seconds+3)/60),max:Math.ceil(matches*(2*seconds+8)/60),matches};
}
export function randomCupTracks(catalog, size, random = Math.random) {
  const unique=[...new Map(catalog.filter(t=>t.previewUrl && t.id).map(t=>[`${t.artist}|${t.title}`.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase(),t])).values()];
  if(unique.length<size)throw new Error(`W tej puli jest tylko ${unique.length} utworów. Wybierz mniejszy zestaw.`);
  for(let i=unique.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[unique[i],unique[j]]=[unique[j],unique[i]];}
  return unique.slice(0,size);
}
