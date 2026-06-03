import { renderGame } from "./game.js?v=20260603-22";
import { impostorDefaults, renderImpostorGameStable as renderImpostorGame } from "./impostor.js?v=20260603-4";
import { identityDefaults, renderIdentityGame } from "./identity.js?v=20260602-1";
import { otherQuestionDefaults, renderOtherQuestionGame } from "./otherQuestion.js";
import { renderWouldYouRather } from "./wouldYouRather.js?v=20260603-22";
import { mostLikelyDefaults, renderMostLikelyGame } from "./mostLikely.js";
import { friendshipDefaults, renderFriendshipTestGame } from "./friendshipTest.js";

export const gamesRegistry = {
  udowodnij: {
    id: "udowodnij",
    name: "Udowodnij!",
    description: "Licytuj liczbę odpowiedzi, podbijaj stawkę i sprawdzaj, kto tylko blefuje.",
    players: "2-8 osób",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "⚡",
    art: "prove",
    featured: true,
    render: renderGame,
    defaultSettings: { answerTime: 30 },
  },
  impostor: {
    id: "impostor",
    name: "Impostor",
    description: "Jedna osoba nie zna sekretnego hasła. Rozmawiajcie i znajdźcie impostora.",
    players: "2-8 osób",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "◉",
    art: "impostor",
    render: renderImpostorGame,
    defaultSettings: impostorDefaults,
  },
  "kim-jestem": {
    id: "kim-jestem",
    name: "Kim jestem?",
    description: "Odgadnij swoją postać, zadając znajomym pytania, na które odpowiedzą tak lub nie.",
    players: "2-10 osób",
    minPlayers: 2,
    maxPlayers: 10,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "?",
    art: "identity",
    render: renderIdentityGame,
    defaultSettings: identityDefaults,
  },
  "inne-pytanie": {
    id: "inne-pytanie",
    name: "Inne pytanie",
    description: "Odpowiedz tak, żeby pasować do grupy, ale uważaj: ktoś dostał zupełnie inne pytanie.",
    players: "3-10 osób",
    minPlayers: 3,
    maxPlayers: 10,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "✦",
    art: "question",
    render: renderOtherQuestionGame,
    defaultSettings: otherQuestionDefaults,
  },
  "co-wolisz": {
    id: "co-wolisz",
    name: "Co wolisz?",
    description: "Wybieraj jedną z dwóch opcji i porównuj swoje odpowiedzi z innymi graczami.",
    players: "Tryb solo",
    minPlayers: 1,
    maxPlayers: 12,
    supportsLobby: false,
    supportsSolo: true,
    symbol: "↔",
    art: "choice",
    render: renderWouldYouRather,
    defaultSettings: {},
  },
  "kto-najpredzej": {
    id: "kto-najpredzej",
    name: "Kto najprędzej...?",
    description: "Głosujcie, kto z was najpewniej zrobi daną rzecz. Wyniki potrafią zaskoczyć.",
    players: "2-8 osób",
    minPlayers: 2,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "☝",
    art: "vote",
    render: renderMostLikelyGame,
    defaultSettings: mostLikelyDefaults,
  },
  "test-znajomosci": {
    id: "test-znajomosci",
    name: "Test znajomości",
    description: "Sprawdźcie, kto naprawdę zna ekipę najlepiej. Każda odpowiedź ma znaczenie.",
    players: "3-8 osób",
    minPlayers: 3,
    maxPlayers: 8,
    supportsLobby: true,
    supportsSolo: false,
    symbol: "♥",
    art: "friends",
    render: renderFriendshipTestGame,
    defaultSettings: friendshipDefaults,
  },
};

export const gamesList = Object.values(gamesRegistry);

export function getGameMode(id) {
  return gamesRegistry[id] || gamesRegistry.udowodnij;
}
