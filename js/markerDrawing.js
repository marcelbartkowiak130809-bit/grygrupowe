export const MARKER_MIN_COVERAGE = .05;
export function markerCrossValid(strokes) {
  if (!Array.isArray(strokes) || strokes.length !== 2) return false;
  const lines = strokes.map(points => {
    if (!Array.isArray(points) || points.length < 2 || points.length > 256) return null;
    if (!points.every(p => Array.isArray(p) && p.length === 2 && p.every(n => Number.isFinite(n) && n >= 0 && n <= 1))) return null;
    const a=points[0], b=points.at(-1), dx=b[0]-a[0], dy=b[1]-a[1];
    if (Math.abs(dx)<.5 || Math.abs(dy)<.5 || Math.abs(dx/dy)<.5 || Math.abs(dx/dy)>2) return null;
    if (!points.every(p => Math.abs(dx*(p[1]-a[1])-dy*(p[0]-a[0]))/Math.hypot(dx,dy)<.18)) return null;
    return {a,dx,dy};
  });
  if (lines.some(line=>!line)) return false;
  const [u,v]=lines;
  if (u.dx*u.dy*v.dx*v.dy>=0) return false;
  const det=u.dx*v.dy-u.dy*v.dx;
  const t=((v.a[0]-u.a[0])*v.dy-(v.a[1]-u.a[1])*v.dx)/det;
  const s=((v.a[0]-u.a[0])*u.dy-(v.a[1]-u.a[1])*u.dx)/det;
  const x=u.a[0]+t*u.dx, y=u.a[1]+t*u.dy;
  return t>0&&t<1&&s>0&&s<1&&x>.2&&x<.8&&y>.2&&y<.8;
}
export function markerInkCoverage(imageData) {
  let ink=0;
  for(let i=3;i<imageData.data.length;i+=4)if(imageData.data[i]>35)ink++;
  return ink/(imageData.width*imageData.height || 1);
}
export function markerCellAt(rect,size,x,y) {
  if(rect.width<=0 || rect.height<=0 || x<rect.left || y<rect.top || x>=rect.left+rect.width || y>=rect.top+rect.height)return null;
  return Math.floor((x-rect.left)*size/rect.width)+Math.floor((y-rect.top)*size/rect.height)*size;
}
export function markerActionMatches(game,expected={}) {
  return game.phase===expected.phase && (game.selectedCell ?? null)===(expected.selectedCell ?? null)
    && Number(game.turn || 0)===Number(expected.turn || 0) && game.turnUid===expected.turnUid;
}
