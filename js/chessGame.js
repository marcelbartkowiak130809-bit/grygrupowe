import { Chess } from "./vendor/chess-1.4.0.js";

export const chessMode = "board-szachy";
export const chessDefaults = { chessMinutes:10, chessIncrement:5 };
export const chessMinutes = [3,5,10,15];
export const chessIncrements = [0,3,5,10];
export const chessInfo = {
  id:chessMode, name:"Szachy", icon:"♞", players:"2 osoby", minPlayers:2, maxPlayers:2,
  description:"Partia na zegarze z historią i podglądem ruchów.", art:"board-chess",
  rules:["Wybierz figurę, a potem jedno z podświetlonych pól. Wygrywa mat lub poddanie rywala.",
    "Zegar odlicza czas całej partii. Po ruchu doliczane są sekundy ustawione w lobby.",
    "Partia kończy się remisem przy pacie, braku materiału, trzykrotnym powtórzeniu pozycji, po 50 ruchach bez bicia i ruchu pionem albo po przyjęciu propozycji remisu."],
};

export function chessSettings(raw) {
  const minutes = Number(raw.chessMinutes), increment = Number(raw.chessIncrement ?? chessDefaults.chessIncrement);
  return {
    chessMinutes:chessMinutes.includes(minutes) ? minutes : chessDefaults.chessMinutes,
    chessIncrement:chessIncrements.includes(increment) ? increment : chessDefaults.chessIncrement,
  };
}

export function createChessGame(players, settings, now) {
  const duration = settings.chessMinutes * 60_000;
  return {
    boardMode:chessMode, players, chessSeats:players, currentUid:players[0] || "", turnIndex:0,
    scores:Object.fromEntries(players.map(uid=>[uid,0])), finished:false, phase:"playing",
    chessMoves:[], chessClock:{w:duration,b:duration}, chessIncrementMs:settings.chessIncrement*1000,
    phaseEndsAt:now+duration, chessStartedAt:now,
  };
}

export const chessMoveLog = game => Array.isArray(game.chessMoves) ? game.chessMoves : [];
export function chessPosition(game, ply = chessMoveLog(game).length) {
  const chess = new Chess(game.chessStartFen);
  for (const san of chessMoveLog(game).slice(0,ply)) chess.move(san,{strict:true});
  return chess;
}

export const chessTime = (game,color,now) => game.phase==="playing" && color===(game.turnIndex===0?"w":"b")
  ? Math.max(0,game.phaseEndsAt-now) : Math.max(0,Number(game.chessClock?.[color])||0);

export function chessGameAction(game, uid, action, payload, now, finish) {
  if (!["timeout","chess-move","chess-resign","chess-offer","chess-accept","chess-decline"].includes(action)) return "Nieznana akcja.";
  const color = game.turnIndex===0?"w":"b";
  const opponent = game.players.find(player=>player!==uid);
  const end = (reason,winner) => {
    game.chessClock[color]=chessTime(game,color,now);
    game.chessEnd=reason;
    game.chessDrawOffer="";
    finish(game,winner?[winner]:[]);
  };
  if (now>=game.phaseEndsAt) {
    const flagWinner = game.players.find(player=>player!==game.currentUid);
    const otherColor = color==="w"?"b":"w";
    const position = chessPosition(game);
    const canMate = position.board().some(row=>row.some(piece=>piece?.color===otherColor&&piece.type!=="k")) && !position.isInsufficientMaterial();
    return end(canMate?"time":"material",canMate?flagWinner:null);
  }
  if (action==="timeout") return;
  if (action==="chess-resign") return end("resign",opponent);
  if (action==="chess-offer") {
    if (game.chessDrawOffer) return "Propozycja remisu już czeka.";
    game.chessDrawOffer=uid;
    return;
  }
  if (action==="chess-accept" || action==="chess-decline") {
    if (!opponent || game.chessDrawOffer!==opponent) return "Nie ma propozycji remisu od rywala.";
    if (action==="chess-accept") return end("agreement");
    game.chessDrawOffer="";
    return;
  }
  if (game.currentUid!==uid) return "Poczekaj na swoją kolej.";
  const [from,to,promotion] = String(payload||"").split("|");
  if (!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to) || (promotion&&!/^[qrbn]$/.test(promotion))) return "Ten ruch jest niedozwolony.";
  const chess = chessPosition(game);
  let move;
  try { move=chess.move({from,to,promotion:promotion||undefined}); }
  catch { return "Ten ruch jest niedozwolony."; }
  game.chessMoves=[...chessMoveLog(game),move.san];
  if (chess.isCheckmate()) return end("mate",uid);
  if (chess.isStalemate()) return end("stalemate");
  if (chess.isInsufficientMaterial()) return end("material");
  if (chess.isThreefoldRepetition()) return end("repetition");
  if (chess.isDrawByFiftyMoves()) return end("fifty");
  game.chessClock[color]=chessTime(game,color,now)+game.chessIncrementMs;
  if (game.chessDrawOffer===opponent) game.chessDrawOffer="";
  game.turnIndex=1-game.turnIndex;
  game.currentUid=opponent;
  game.phaseEndsAt=now+game.chessClock[chess.turn()];
}
