import { chessMoveLog, chessPosition } from "./chessGame.js?v=20261121-8";

const pieceValue = {p:100,n:320,b:335,r:500,q:910,k:0};
const levels = {
  easy:{depth:1,nodes:100,ms:22,variety:260},
  normal:{depth:2,nodes:750,ms:55,variety:80},
  hard:{depth:3,nodes:2700,ms:100,variety:24},
  expert:{depth:4,nodes:6500,ms:150,variety:5},
};
const mate = 100_000;
const interrupted = Symbol("chess search budget");
const center = (file,rank) => 7-Math.abs(3.5-file)-Math.abs(3.5-rank);
const movePriority = move => (pieceValue[move.captured] || 0)*10-(move.captured ? pieceValue[move.piece] : 0)+(pieceValue[move.promotion] || 0)*9;
const algebraic = square => `${"abcdefgh"[square&7]}${8-(square>>4)}`;

function evaluate(chess) {
  let score=0, majorMaterial=0, kingScore=0, kingEndgame=0;
  for (const [y,row] of chess.board().entries()) for (const [x,piece] of row.entries()) {
    if (!piece) continue;
    const {type,color}=piece, sign=color==="w" ? 1 : -1;
    const rank=color==="w" ? 7-y : y;
    const central=center(x,y);
    if(type==="k"){
      kingScore+=sign*(rank===0 && (x<3 || x>5) ? 22 : -central*5-rank*7);
      kingEndgame+=sign*central*6;
      continue;
    }
    if(type!=="p") majorMaterial+=pieceValue[type];
    const placement = type==="p" ? (rank-1)*7+central*2
      : type==="n" ? central*9+Math.min(1,rank)*8
      : type==="b" ? central*5+Math.min(1,rank)*9
      : type==="r" ? (rank===6 ? 20 : 0)+central*2
      : central*3;
    score+=sign*(pieceValue[type]+placement);
  }
  const middlegame=Math.min(1,majorMaterial/2800);
  return (score+kingScore*middlegame+kingEndgame*(1-middlegame))*(chess.turn()==="w" ? 1 : -1);
}

function variation(key,move) {
  let hash=2166136261;
  for (const char of `${key}:${move.from}:${move.to}:${move.promotion || ""}`) hash=Math.imul(hash^char.charCodeAt(0),16777619);
  return ((hash^hash>>>16)>>>0)/4294967296;
}

export function chessBotAction(game,uid,difficulty,remaining=Infinity) {
  const chess=chessPosition(game);
  const ply=chessMoveLog(game).length;
  if(game.chessDrawOffer && game.chessDrawOffer!==uid){
    const side=game.chessSeats?.[0]===uid ? "w" : "b";
    const score=evaluate(chess)*(chess.turn()===side ? 1 : -1);
    return {action:ply>=16 && (score < -170 || ply>=42 && Math.abs(score)<70) ? "chess-accept" : "chess-decline",payload:""};
  }
  if(game.currentUid!==uid) return null;

  const options=levels[difficulty] || levels.normal;
  const timeLimit=performance.now()+Math.min(options.ms,Math.max(8,remaining*.16));
  let nodes=0;
  // chess.js 1.4.0's raw legal moves avoid generating SAN and FEN for each search node.
  // The chosen coordinates still go through the public move validator in chessGameAction.
  const after = (move,visit) => {
    chess._makeMove(move);
    try { return visit(); }
    finally { chess._undoMove(); }
  };
  const search = (depth,alpha,beta,distance,extension) => {
    if (++nodes>options.nodes || performance.now()>=timeLimit) throw interrupted;
    const moves=chess._moves();
    const check=chess.isCheck();
    if(!moves.length) return check ? -mate+distance : 0;
    if(chess.isDrawByFiftyMoves() || chess.isInsufficientMaterial()) return 0;
    if(depth<=0){
      const stand=evaluate(chess);
      if(!extension) return stand;
      if(!check){
        if(stand>=beta) return stand;
        alpha=Math.max(alpha,stand);
      }
    }
    const candidates=depth>0 || check ? moves : moves.filter(move=>move.captured || move.promotion);
    for(const move of candidates.sort((a,b)=>movePriority(b)-movePriority(a))){
      const score=after(move,()=>-search(depth-1,-beta,-alpha,distance+1,depth<=0 ? extension-1 : extension));
      if(score>=beta) return score;
      alpha=Math.max(alpha,score);
    }
    return alpha;
  };
  const roots=chess._moves().map(move=>({move,score:movePriority(move)}));
  if(!roots.length) return null;
  roots.sort((a,b)=>b.score-a.score);
  const key=`${game.siteGameId || game.chessStartedAt}:${ply}:${uid}`;
  let chosen=roots[0].move;
  for(let depth=1;depth<=options.depth;depth++){
    try {
      let best=-Infinity;
      const evaluated=roots.map(({move})=>{
        const bias=variation(key,move)*options.variety;
        const score=after(move,()=>-search(depth-1,-Infinity,Number.isFinite(best) ? bias-best : Infinity,1,difficulty==="expert" && depth>1 ? 1 : 0));
        best=Math.max(best,score+bias);
        return {move,score:score+bias};
      });
      roots.splice(0,roots.length,...evaluated.sort((a,b)=>b.score-a.score));
      chosen=roots[0].move;
      if(roots[0].score>mate/2) break;
    } catch(error) {
      if(error!==interrupted) throw error;
      break;
    }
  }
  return {action:"chess-move",payload:[algebraic(chosen.from),algebraic(chosen.to),chosen.promotion || ""].join("|")};
}
