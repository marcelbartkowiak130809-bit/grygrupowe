export const MARKER_MIN_COVERAGE = .05;
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
