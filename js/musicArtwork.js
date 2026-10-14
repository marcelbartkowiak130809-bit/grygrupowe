// Request the original CDN artwork at card size instead of enlarging a thumbnail.
export function musicArtworkUrl(value) {
  const raw=String(value||'');
  try {
    const url=new URL(raw);
    if(url.protocol!=='https:'||!/(^|\.)mzstatic\.com$/i.test(url.hostname))return raw;
    url.pathname=url.pathname.replace(/\/(\d+)x(\d+)(bb[^/]*)$/i,(match,w,h,suffix)=>
      Number(w)<600||Number(h)<600?`/600x600${suffix}`:match);
    return url.href;
  } catch { return raw; }
}
