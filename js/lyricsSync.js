export function validLyricsSync(previewUrl,sync) {
  const words=String(sync?.previousLine || '').trim().split(/\s+/);
  return Boolean(sync && sync.previewUrl===previewUrl && sync.answer && Number.isFinite(sync.start) && Number.isFinite(sync.stop) && sync.start>=0 && sync.stop>sync.start && sync.stop<=30 && Array.isArray(sync.wordTimes) && sync.wordTimes.length===words.length && sync.wordTimes.every(([start,end],i)=>Number.isFinite(start)&&Number.isFinite(end)&&start>=sync.start&&start<sync.stop&&end>=start&&(!i||start>=sync.wordTimes[i-1][0])));
}
export function lyricsVisibleWordCount(sync,audioTime) {
  if(!Number.isFinite(audioTime))return 0;
  return sync.wordTimes.filter(([start])=>start<=audioTime).length;
}
